/**
 * Basic LucidTalk Core Example
 * Shows how to use the SDK for meeting transcription
 */

const LucidTalk = require('../index');

async function basicExample() {
  console.log('🚀 Starting LucidTalk Core Example\n');

  // Create LucidTalk instance
  const bot = new LucidTalk({
    privacy: 'local-only',
    p2p: true,
    ai: 'local', // Change to 'openai' if you have API key
    storagePath: './test-sessions',
    apiKeys: {
      // openai: 'your-api-key-here'
    }
  });

  // Set up event listeners
  bot.onTranscription((event) => {
    console.log(`[${new Date(event.timestamp).toLocaleTimeString()}] ${event.text}`);
  });

  bot.on('session:started', (session) => {
    console.log(`✅ Session started: ${session.id}`);
    if (session.driveKey) {
      console.log(`🌐 P2P Drive Key: ${session.driveKey}`);
    }
  });

  bot.on('session:stopped', (session) => {
    console.log(`🛑 Session ended: ${session.id}`);
    console.log(`Duration: ${(session.endTime - session.startTime) / 1000}s`);
  });

  bot.onError((error) => {
    console.error('❌ Error:', error.message);
  });

  try {
    // Start transcription
    const session = await bot.startTranscription();
    
    console.log('🎙️ Transcription started...');
    console.log('   This example will run for 15 seconds');
    console.log('   Press Ctrl+C to stop early\n');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n👋 Shutting down...');
      await bot.stopTranscription();
      await bot.dispose();
      process.exit(0);
    });

    // Auto-stop after 15 seconds for demo
    setTimeout(async () => {
      console.log('\n⏰ Demo time ended, stopping...');
      await bot.stopTranscription();
      
      // Try to generate summary if AI is available
      try {
        console.log('\n📝 Generating summary...');
        const summary = await bot.summarize({
          template: 'meeting-notes',
          includeActionItems: true
        });
        console.log('Summary:', summary);
      } catch (error) {
        console.log('📝 Summary not available (no AI configured)');
      }
      
      console.log('\n✅ Example completed!');
      process.exit(0);
    }, 15000);

  } catch (error) {
    console.error('❌ Failed to start:', error.message);
    process.exit(1);
  }
}

// Run example
if (require.main === module) {
  basicExample().catch(console.error);
}

module.exports = basicExample;