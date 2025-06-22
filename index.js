/**
 * LucidTalk Core SDK
 * Privacy-first P2P meeting transcription and AI
 * 
 * This wraps the existing backend modules to provide a clean SDK interface
 */

const EventEmitter = require('eventemitter3');
const path = require('path');

class LucidTalk extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      privacy: 'local-only',
      p2p: false,
      ai: 'local',
      apiKeys: {},
      storagePath: './sessions',
      backendPath: null, // Will be set to parent directory by default
      ...config
    };
    
    this.isTranscribing = false;
    this.currentSession = null;
    this.managers = {
      hyperdrive: null,
      session: null,
      transcription: null,
      ai: null
    };
    
    this.validateConfig();
  }

  validateConfig() {
    if (!this.config.privacy) {
      throw new Error('Privacy mode is required');
    }
    
    if (this.config.ai && !this.config.apiKeys[this.config.ai] && this.config.ai !== 'local') {
      console.warn(`API key for ${this.config.ai} not provided. Some features may not work.`);
    }
  }

  /**
   * Initialize the SDK and load backend modules
   */
  async initialize() {
    if (this.managers.initialized) return;

    // Set default backend path if not provided
    if (!this.config.backendPath) {
      this.config.backendPath = path.join(__dirname, '..');
    }

    // Load P2P modules if enabled
    if (this.config.p2p) {
      try {
        const { HyperdriveManager } = require(path.join(this.config.backendPath, 'backend/HyperdriveManager'));
        const { SessionDriveManager } = require(path.join(this.config.backendPath, 'backend/SessionDriveManager'));
        
        this.managers.hyperdrive = new HyperdriveManager();
        this.managers.session = new SessionDriveManager({
          storagePath: this.config.storagePath,
          shareMode: true,
          verbose: false
        });
        
        await this.managers.hyperdrive.initialize();
        console.log('✅ P2P modules initialized');
      } catch (error) {
        console.warn('⚠️ P2P backend not available:', error.message);
      }
    }

    // Load transcription module
    try {
      const TranscriptionManager = require(path.join(this.config.backendPath, 'src/electron/TranscriptionManager'));
      this.managers.transcription = new TranscriptionManager();
      console.log('✅ Transcription module initialized');
    } catch (error) {
      console.warn('⚠️ Transcription backend not available:', error.message);
    }

    // Load AI module if configured
    if (this.config.ai && this.config.ai !== 'local') {
      try {
        const AIProviderManager = require(path.join(this.config.backendPath, 'src/electron/ai/AIProviderManager'));
        this.managers.ai = new AIProviderManager();
        this.managers.ai.configure({
          provider: this.config.ai,
          apiKeys: this.config.apiKeys
        });
        console.log('✅ AI module initialized');
      } catch (error) {
        console.warn('⚠️ AI backend not available:', error.message);
      }
    }

    this.managers.initialized = true;
    this.emit('initialized');
  }

  /**
   * Start real-time transcription
   */
  async startTranscription(options = {}) {
    if (this.isTranscribing) {
      throw new Error('Transcription already in progress');
    }

    await this.initialize();

    // Create session info
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      participants: [],
      status: 'active'
    };

    // Create P2P session if enabled
    if (this.config.p2p && this.managers.session) {
      try {
        const driveInfo = await this.managers.session.createSessionDrive(this.currentSession.id);
        this.currentSession.driveKey = driveInfo.driveKey;
        this.currentSession.discoveryKey = driveInfo.discoveryKey;
        console.log('🌐 P2P session created:', this.currentSession.driveKey);
      } catch (error) {
        console.warn('⚠️ P2P session creation failed:', error.message);
      }
    }

    // Start transcription
    if (this.managers.transcription) {
      try {
        await this.managers.transcription.startTranscription({
          sessionId: this.currentSession.id,
          outputDir: this.config.storagePath,
          ...options
        });

        // Forward transcription events
        this.managers.transcription.on('transcription', (data) => {
          const event = {
            text: data.text,
            timestamp: data.timestamp,
            confidence: data.confidence,
            isFinal: data.isFinal,
            speaker: data.speaker
          };
          this.emit('transcription', event);
        });

        this.isTranscribing = true;
        console.log('🎙️ Transcription started');
      } catch (error) {
        console.error('❌ Failed to start transcription:', error.message);
        throw error;
      }
    } else {
      // Mock transcription for testing
      console.log('🎙️ Mock transcription started (no backend available)');
      this.isTranscribing = true;
      this.startMockTranscription();
    }

    this.emit('session:started', this.currentSession);
    return this.currentSession;
  }

  /**
   * Stop transcription
   */
  async stopTranscription() {
    if (!this.isTranscribing) return;

    if (this.managers.transcription) {
      await this.managers.transcription.stopRecording();
    }

    this.isTranscribing = false;
    
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.currentSession.status = 'ended';
      this.emit('session:stopped', this.currentSession);
    }

    console.log('🛑 Transcription stopped');
  }

  /**
   * Generate AI summary
   */
  async summarize(options = {}) {
    if (!this.managers.ai) {
      throw new Error('AI provider not configured');
    }

    const template = options.template || 'meeting-notes';
    
    try {
      const transcriptText = await this.getTranscriptText();
      const summary = await this.managers.ai.generateSummary({
        transcript: transcriptText,
        template: this.getPromptTemplate(template, options),
        options
      });

      this.emit('summary:generated', summary);
      return summary;
    } catch (error) {
      console.error('❌ Failed to generate summary:', error);
      throw error;
    }
  }

  /**
   * Share session via P2P
   */
  async shareSession(sessionId) {
    if (!this.config.p2p || !this.managers.session) {
      throw new Error('P2P not enabled');
    }

    const targetSessionId = sessionId || this.currentSession?.id;
    if (!targetSessionId) {
      throw new Error('No session to share');
    }

    try {
      const shareInfo = await this.managers.session.shareSession(targetSessionId);
      this.emit('session:shared', shareInfo);
      return shareInfo;
    } catch (error) {
      console.error('❌ Failed to share session:', error);
      throw error;
    }
  }

  /**
   * Connect to shared session
   */
  async connectToSession(driveKey) {
    if (!this.config.p2p || !this.managers.session) {
      throw new Error('P2P not enabled');
    }

    try {
      const sessionInfo = await this.managers.session.connectToSession(driveKey);
      this.emit('session:connected', sessionInfo);
      return sessionInfo;
    } catch (error) {
      console.error('❌ Failed to connect to session:', error);
      throw error;
    }
  }

  /**
   * Get current session
   */
  getCurrentSession() {
    return this.currentSession;
  }

  /**
   * Check if transcription is active
   */
  isActive() {
    return this.isTranscribing;
  }

  /**
   * Event listener helpers
   */
  onTranscription(callback) {
    this.on('transcription', callback);
  }

  onSessionUpdate(callback) {
    this.on('session:updated', callback);
  }

  onError(callback) {
    this.on('error', callback);
  }

  /**
   * Clean shutdown
   */
  async dispose() {
    if (this.isTranscribing) {
      await this.stopTranscription();
    }
    this.removeAllListeners();
  }

  // Private helper methods
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getPromptTemplate(template, options) {
    const templates = {
      'meeting-notes': 'Generate comprehensive meeting notes with key points and decisions.',
      'action-items': 'Extract action items and assignments from the meeting.',
      'study-notes': 'Create study notes with key concepts and definitions.',
      'interview': 'Summarize interview with key insights and responses.',
      'custom': options.customPrompt || 'Summarize the following transcript.'
    };

    return templates[template] || templates['meeting-notes'];
  }

  async getTranscriptText() {
    if (this.managers.transcription) {
      return await this.managers.transcription.getTranscript();
    }
    return 'Mock transcript text for testing';
  }

  // Mock transcription for testing when backend not available
  startMockTranscription() {
    let counter = 0;
    const mockPhrases = [
      'Hello everyone, welcome to the meeting',
      'Let\'s start with the agenda for today',
      'First item is about the project timeline',
      'We need to discuss the upcoming deadline',
      'Any questions or concerns?'
    ];

    const interval = setInterval(() => {
      if (!this.isTranscribing) {
        clearInterval(interval);
        return;
      }

      const event = {
        text: mockPhrases[counter % mockPhrases.length],
        timestamp: Date.now(),
        confidence: 0.95,
        isFinal: true,
        speaker: 'Speaker 1'
      };

      this.emit('transcription', event);
      counter++;
    }, 3000);
  }
}

module.exports = LucidTalk;