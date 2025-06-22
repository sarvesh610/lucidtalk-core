/**
 * Study Assistant Example
 * AI-powered lecture transcription with concept extraction
 */

const LucidTalk = require('../../index');
require('dotenv').config();

class StudyAssistant {
  constructor(options = {}) {
    this.options = {
      autoFlashcards: true,
      conceptExtraction: true,
      timestampNotes: true,
      ...options
    };

    this.lucidtalk = new LucidTalk({
      privacy: 'local-only',
      ai: process.env.AI_PROVIDER || 'openai',
      p2p: false, // Study sessions are typically private
      apiKeys: {
        openai: process.env.OPENAI_API_KEY,
        anthropic: process.env.ANTHROPIC_API_KEY,
        groq: process.env.GROQ_API_KEY
      }
    });

    this.concepts = new Map();
    this.flashcards = [];
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Real-time concept detection
    this.lucidtalk.onTranscription((event) => {
      if (event.isFinal) {
        console.log(`[${new Date(event.timestamp).toLocaleTimeString()}] ${event.text}`);
        
        if (this.options.conceptExtraction) {
          this.extractConcepts(event.text, event.timestamp);
        }
      }
    });

    this.lucidtalk.onError((error) => {
      console.error('Study Assistant Error:', error.message);
    });
  }

  async startStudySession(subject = 'General Study') {
    console.log(`📚 Starting study session: ${subject}`);
    
    try {
      const session = await this.lucidtalk.startTranscription();
      console.log(`✅ Study session started: ${session.id}`);
      
      // Auto-generate study materials every 10 minutes
      this.studyInterval = setInterval(async () => {
        await this.generateInterimStudyGuide();
      }, 10 * 60 * 1000);
      
      return session;
    } catch (error) {
      console.error('❌ Failed to start study session:', error);
      throw error;
    }
  }

  async endStudySession() {
    console.log('📖 Ending study session...');
    
    if (this.studyInterval) {
      clearInterval(this.studyInterval);
    }
    
    await this.lucidtalk.stopTranscription();
    
    // Generate final study materials
    const studyGuide = await this.generateFinalStudyGuide();
    console.log('📋 Study guide generated');
    
    return studyGuide;
  }

  extractConcepts(text, timestamp) {
    // Simple keyword detection (real implementation would use NLP)
    const conceptKeywords = [
      'definition:', 'define', 'theorem', 'principle', 'law of',
      'formula', 'equation', 'concept', 'theory', 'hypothesis'
    ];

    const lowerText = text.toLowerCase();
    const hasConcept = conceptKeywords.some(keyword => lowerText.includes(keyword));

    if (hasConcept) {
      const conceptId = `concept_${Date.now()}`;
      this.concepts.set(conceptId, {
        text,
        timestamp,
        extracted: Date.now()
      });

      console.log(`📚 New concept detected: ${text.substring(0, 50)}...`);
    }
  }

  async generateInterimStudyGuide() {
    if (this.concepts.size === 0) return;

    try {
      const conceptsText = Array.from(this.concepts.values())
        .map(concept => concept.text)
        .join('\n');

      const summary = await this.lucidtalk.summarize({
        template: 'study-notes',
        customPrompt: `
          Extract key concepts, definitions, and important facts from this lecture content.
          Create clear, concise study notes with:
          1. Main concepts and definitions
          2. Important formulas or principles
          3. Key examples or applications
          4. Study questions for review
          
          Format as study guide with bullet points.
        `
      });

      console.log('📝 Interim study guide generated');
      return summary;
    } catch (error) {
      console.error('❌ Failed to generate study guide:', error);
    }
  }

  async generateFinalStudyGuide() {
    try {
      const finalGuide = await this.lucidtalk.summarize({
        template: 'study-notes',
        includeKeyPoints: true,
        includeTimestamps: this.options.timestampNotes,
        customPrompt: `
          Create a comprehensive study guide from this lecture including:
          
          ## SUMMARY
          Brief overview of the main topic and key themes
          
          ## KEY CONCEPTS
          Important definitions, theories, and principles with clear explanations
          
          ## FORMULAS & EQUATIONS
          Mathematical formulas or key equations mentioned
          
          ## EXAMPLES
          Important examples or case studies discussed
          
          ## STUDY QUESTIONS
          5-10 review questions to test understanding
          
          ## FLASHCARD SUGGESTIONS
          Key terms that would make good flashcards
          
          Format clearly with headers and bullet points for easy review.
        `
      });

      // Generate flashcards if enabled
      if (this.options.autoFlashcards) {
        await this.generateFlashcards();
      }

      return finalGuide;
    } catch (error) {
      console.error('❌ Failed to generate final study guide:', error);
      throw error;
    }
  }

  async generateFlashcards() {
    try {
      const flashcardData = await this.lucidtalk.summarize({
        template: 'custom',
        customPrompt: `
          Create flashcards from the lecture content. Format as JSON array:
          [
            {
              "front": "Question or term",
              "back": "Answer or definition",
              "category": "concept category"
            }
          ]
          
          Create 10-15 flashcards covering the most important concepts.
          Make questions clear and answers concise but complete.
        `
      });

      // Parse flashcards (in real implementation, you'd parse JSON)
      console.log('🗂️ Flashcards generated:', flashcardData);
      return flashcardData;
    } catch (error) {
      console.error('❌ Failed to generate flashcards:', error);
    }
  }

  getSessionStats() {
    const currentSession = this.lucidtalk.getCurrentSession();
    return {
      sessionId: currentSession?.id,
      startTime: currentSession?.startTime,
      conceptsExtracted: this.concepts.size,
      flashcardsGenerated: this.flashcards.length,
      isActive: this.lucidtalk.isActive()
    };
  }
}

// Example usage
async function main() {
  const study = new StudyAssistant({
    autoFlashcards: true,
    conceptExtraction: true,
    timestampNotes: true
  });

  console.log('🎓 LucidTalk Study Assistant');
  console.log('Ready to transcribe your lectures and generate study materials!\n');

  // Start study session
  await study.startStudySession('Computer Science Lecture');

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n📚 Ending study session...');
    const studyGuide = await study.endStudySession();
    
    const stats = study.getSessionStats();
    console.log('\n📊 Session Summary:');
    console.log(`   Concepts extracted: ${stats.conceptsExtracted}`);
    console.log(`   Duration: ${(Date.now() - stats.startTime) / 1000}s`);
    
    process.exit(0);
  });

  console.log('🎙️ Recording lecture... (Press Ctrl+C to stop and generate study guide)');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = StudyAssistant;