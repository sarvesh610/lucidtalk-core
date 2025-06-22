# 🛠️ LucidTalk Core - Developer Guide

**Build privacy-first transcription apps with P2P sharing and local AI processing**

## 🚀 Quick Start

```bash
npm install lucidtalk-core
```

```javascript
const { LucidTalk } = require('lucidtalk-core');

const bot = new LucidTalk({
  privacy: 'local-only',
  p2p: true,
  ai: 'openai'
});

// Start transcribing
const session = await bot.startTranscription();

// Listen for real-time text
bot.onTranscription((event) => {
  console.log(`[${event.confidence}%] ${event.text}`);
});
```

## 🏗️ Architecture

LucidTalk Core provides a clean abstraction over powerful privacy-first technologies:

```
Your App
    ↓
LucidTalk SDK (this package)
    ↓
┌─────────────────────────┐
│ PrivateCore (hidden)    │
│ ├── P2P (Hyperdrive)   │
│ ├── Transcription      │
│ ├── AI Processing      │
│ └── Session Management │
└─────────────────────────┘
```

## 📦 Installation & Setup

### Basic Installation

```bash
npm install lucidtalk-core
```

### System Requirements

- **Node.js**: 16+ (for SDK)
- **macOS**: 10.15+ (for audio processing)
- **Memory**: 2GB+ recommended
- **Storage**: 1GB for models (downloaded automatically)

### Platform Support

| Platform | SDK Support | Audio Processing | P2P Networking |
|----------|-------------|------------------|----------------|
| macOS    | ✅ Full      | ✅ Native        | ✅ Yes         |
| Linux    | 🔶 Partial   | ⚠️ Limited       | ✅ Yes         |
| Windows  | 🔶 Partial   | ⚠️ Limited       | ✅ Yes         |

*Note: Full audio processing currently requires macOS. Other platforms can connect to sessions.*

## 🎯 Core Concepts

### 1. Privacy Modes

```javascript
// Local-only: Everything stays on device
const local = new LucidTalk({ privacy: 'local-only' });

// P2P-only: Share with peers, no cloud
const p2p = new LucidTalk({ privacy: 'p2p-only', p2p: true });

// Hybrid: Best of both worlds
const hybrid = new LucidTalk({ privacy: 'hybrid', p2p: true, ai: 'openai' });
```

### 2. AI Providers

```javascript
const bot = new LucidTalk({
  ai: 'openai',        // GPT models
  // ai: 'anthropic',  // Claude models  
  // ai: 'groq',       // Fast inference
  // ai: 'local',      // Offline processing
  
  apiKeys: {
    openai: process.env.OPENAI_API_KEY
  }
});
```

### 3. P2P Sessions

```javascript
// Create and share session
const session = await bot.startTranscription();
const shareInfo = await bot.shareSession();
console.log(`Share: ${shareInfo.driveKey}`);

// Connect to shared session
const remoteSession = await bot.connectToSession(driveKey);
```

## 🔧 Configuration Options

### Complete Configuration

```javascript
const bot = new LucidTalk({
  // Core settings
  privacy: 'local-only',
  p2p: false,
  ai: 'local',
  
  // Storage
  storagePath: './my-sessions',
  
  // AI Configuration
  apiKeys: {
    openai: 'sk-...',
    anthropic: 'sk-ant-...',
    groq: 'gsk_...'
  },
  
  // Advanced (usually auto-detected)
  whisperModel: './models/ggml-base.bin',
  backendPath: './backend'
});
```

### Environment Variables

```bash
# AI API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...

# Storage
LUCIDTALK_STORAGE_PATH=./sessions

# Advanced
LUCIDTALK_LOG_LEVEL=info
```

## 📚 API Reference

### Core Methods

#### `startTranscription(options?)`

Start real-time transcription.

```javascript
const session = await bot.startTranscription({
  deviceId: 'default',    // Audio input device
  language: 'en',         // Language hint
  continuous: true        // Keep listening
});
```

**Returns**: `Promise<SessionInfo>`

#### `stopTranscription()`

Stop current transcription session.

```javascript
await bot.stopTranscription();
```

#### `summarize(options?)`

Generate AI summary of transcription.

```javascript
const summary = await bot.summarize({
  template: 'meeting-notes',
  includeActionItems: true,
  includeKeyPoints: true,
  includeTimestamps: true,
  customPrompt: 'Focus on technical decisions'
});
```

**Templates**: `meeting-notes`, `action-items`, `study-notes`, `interview`, `custom`

#### `shareSession(sessionId?)`

Share session via P2P network.

```javascript
const shareInfo = await bot.shareSession();
// { driveKey: '...', discoveryKey: '...', shareUrl: '...' }
```

#### `connectToSession(driveKey)`

Connect to shared session.

```javascript
const session = await bot.connectToSession('1c5af5e8b0ce66b8...');
```

### Event Handling

#### `onTranscription(callback)`

Listen for real-time transcription events.

```javascript
bot.onTranscription((event) => {
  console.log({
    text: event.text,           // Transcribed text
    timestamp: event.timestamp, // Unix timestamp
    confidence: event.confidence, // 0-1 confidence score
    isFinal: event.isFinal,     // Is this the final version?
    speaker: event.speaker      // Speaker ID (if available)
  });
});
```

#### `onSessionUpdate(callback)`

Listen for session state changes.

```javascript
bot.onSessionUpdate((session) => {
  console.log(`Session ${session.id} updated`);
});
```

#### `onError(callback)`

Handle errors gracefully.

```javascript
bot.onError((error) => {
  console.error('SDK Error:', error.message);
});
```

### Utility Methods

#### `getCurrentSession()`

Get current active session.

```javascript
const session = bot.getCurrentSession();
if (session) {
  console.log(`Active: ${session.id}`);
}
```

#### `isActive()`

Check if transcription is running.

```javascript
if (bot.isActive()) {
  console.log('Currently transcribing...');
}
```

#### `getSessionAnalytics(sessionId?)`

Get session analytics.

```javascript
const analytics = await bot.getSessionAnalytics();
console.log({
  duration: analytics.duration,
  wordCount: analytics.wordCount,
  topics: analytics.topics
});
```

## 🎨 Example Applications

### 1. Meeting Assistant

```javascript
const MeetingBot = require('./examples/meeting-bot');

const bot = new MeetingBot({
  autoSummary: true,
  slackIntegration: true,
  meetingDetection: true
});

await bot.start();
```

### 2. Study Companion

```javascript
const StudyBot = require('./examples/study-assistant');

const study = new StudyBot({
  flashcardGeneration: true,
  conceptExtraction: true,
  quizMode: true
});

study.onConcept((concept) => {
  console.log(`📚 New concept: ${concept.term} - ${concept.definition}`);
});
```

### 3. Interview Transcriber

```javascript
const InterviewBot = require('./examples/interview-tool');

const interview = new InterviewBot({
  speakerDetection: true,
  questionAnalysis: true,
  candidateInsights: true
});

interview.onInsight((insight) => {
  console.log(`💡 ${insight.type}: ${insight.description}`);
});
```

## 🔒 Privacy & Security

### Data Flow

```
Audio Input → Local Processing → P2P Sharing (optional)
     ↓              ↓                    ↓
  Your Mic    Whisper Model     Encrypted P2P
     ↓              ↓                    ↓
  Never leaves   Local AI         Direct peers
   your device    processing      No servers
```

### Privacy Guarantees

- ✅ **Audio never uploaded**: All processing happens locally
- ✅ **No tracking**: Zero telemetry or analytics sent to us
- ✅ **P2P encryption**: All peer communication is encrypted
- ✅ **Your AI keys**: You control which AI providers to use
- ✅ **Local storage**: Sessions stored on your device only

### Security Best Practices

```javascript
// 1. Use environment variables for API keys
const bot = new LucidTalk({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY // Never hardcode keys
  }
});

// 2. Validate P2P connections
bot.on('session:connected', (session) => {
  if (!session.trustedPeer) {
    console.warn('Connected to untrusted peer');
  }
});

// 3. Clean up sessions
process.on('SIGINT', async () => {
  await bot.dispose(); // Cleanup on exit
});
```

## 🛠️ Development

### Local Development

```bash
git clone https://github.com/sarvesh610/lucidtalk-core.git
cd lucidtalk-core
npm install
npm start
```

### Testing

```bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:e2e      # End-to-end tests
npm run test:p2p      # P2P connectivity tests
```

### Building

```bash
npm run build         # Build for production
npm run build:docs    # Generate documentation
npm run lint          # Check code quality
```

### Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Test your changes**: `npm test`
4. **Submit PR**: We review all contributions!

## 🚨 Troubleshooting

### Common Issues

#### 1. "Whisper binary not found"

```bash
# Check if whisper binaries are available
ls node_modules/lucidtalk-core/bin/

# If missing, reinstall
npm uninstall lucidtalk-core
npm install lucidtalk-core
```

#### 2. "Permission denied" (macOS)

```javascript
// The SDK will request permissions automatically
// Grant microphone access when prompted
```

#### 3. "P2P connection failed"

```javascript
// Check network connectivity
const bot = new LucidTalk({ p2p: true });
bot.on('p2p:error', (error) => {
  console.log('P2P Error:', error.message);
});
```

#### 4. "AI provider error"

```javascript
// Verify API keys
const bot = new LucidTalk({
  ai: 'openai',
  apiKeys: { openai: 'sk-...' } // Valid key required
});
```

### Debug Mode

```javascript
const bot = new LucidTalk({
  debug: true,           // Enable verbose logging
  logLevel: 'debug'      // debug, info, warn, error
});
```

### Getting Help

- 💬 **[Discord Community](https://discord.gg/WwxyUCTE)**
- 📚 **[Documentation](https://docs.lucidtalk.ai)**
- 🐛 **[Report Issues](https://github.com/sarvesh610/lucidtalk-core/issues)**
- 📧 **Email**: developer@lucidtalk.ai

## 📄 License

MIT License - Use for any purpose, commercial or personal.

---

**Built with ❤️ for privacy-conscious developers**