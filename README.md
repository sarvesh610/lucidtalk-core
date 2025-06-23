# 🚀 LucidTalk Core

**Privacy-first P2P meeting transcription and AI SDK for developers**

Clean, simple SDK that wraps LucidTalk's existing backend modules to provide a developer-friendly interface for seamless integration.

## ✨ Features

- 🔒 **Privacy-First**: All processing happens locally
- 🌐 **P2P Sharing**: Direct peer-to-peer, no servers
- 🤖 **AI-Powered**: Smart summaries with your AI provider  
- ⚡ **Real-Time**: Live transcription with confidence scores
- 🛡️ **Zero Cloud**: Works completely offline

## 🚀 Quick Start

```bash
# Clone or copy this directory
npm install
npm start
```

```javascript
const LucidTalk = require('lucidtalk-core');

const bot = new LucidTalk({
  privacy: 'local-only',
  p2p: true,
  ai: 'openai'
});

// Start transcribing
const session = await bot.startTranscription();

// Listen for real-time text
bot.onTranscription((event) => {
  console.log(`[Live] ${event.text}`);
});

// Generate summary
const summary = await bot.summarize({
  template: 'meeting-notes'
});
```

## 🔧 Configuration

```javascript
const config = {
  // Privacy mode (required)
  privacy: 'local-only', // 'local-only' | 'p2p-only' | 'hybrid'
  
  // Enable P2P networking
  p2p: true,
  
  // AI provider (optional)
  ai: 'openai', // 'openai' | 'anthropic' | 'groq' | 'local'
  
  // API keys
  apiKeys: {
    openai: 'your-key-here'
  },
  
  // Paths
  storagePath: './sessions',
  backendPath: '../' // Path to LucidTalk backend modules
};
```

## 📖 Core API

### Transcription

```javascript
// Start recording
const session = await bot.startTranscription();

// Stop recording  
await bot.stopTranscription();

// Check status
if (bot.isActive()) {
  console.log('Currently transcribing...');
}
```

### AI Summaries

```javascript
// Meeting notes
const summary = await bot.summarize({
  template: 'meeting-notes',
  includeActionItems: true
});

// Custom prompt
const customSummary = await bot.summarize({
  template: 'custom',
  customPrompt: 'Extract only decisions and deadlines'
});
```

### P2P Sharing

```javascript
// Share your session
const shareInfo = await bot.shareSession();
console.log(`Share: ${shareInfo.driveKey}`);

// Connect to session
const session = await bot.connectToSession(driveKey);
```

## 🎯 Events

```javascript
// Transcription events
bot.onTranscription((event) => {
  console.log(`${event.timestamp}: ${event.text}`);
  console.log(`Confidence: ${event.confidence}`);
});

// Session events
bot.on('session:started', (session) => {
  console.log('Session started:', session.id);
});

bot.on('session:stopped', (session) => {
  console.log('Session ended:', session.id);
});

// Error handling
bot.onError((error) => {
  console.error('Error:', error);
});
```

## 🏗️ How It Works

This SDK wraps the existing LucidTalk backend modules:

```
LucidTalk Core SDK
├── backend/HyperdriveManager      (P2P networking)
├── backend/SessionDriveManager    (Session management)  
├── src/electron/TranscriptionManager (Audio processing)
└── src/electron/ai/AIProviderManager (AI summaries)
```

The SDK provides a clean interface while using your existing, tested backend code.

## 🔌 Integration with Electron App

To use this SDK in your existing Electron app:

```javascript
// In your Electron main process
const LucidTalk = require('./lucidtalk-core');

const transcriptionBot = new LucidTalk({
  privacy: 'local-only',
  p2p: true,
  backendPath: __dirname // Point to your backend modules
});

// Replace direct backend calls with SDK calls
await transcriptionBot.startTranscription();
```

## 📁 Directory Structure

```
lucidtalk-core/
├── index.js              # Main SDK file
├── package.json          # Dependencies
├── README.md            # This file
└── examples/
    └── basic-example.js  # Usage example
```

## 🚀 Next Steps

1. **Test the SDK**: Run `npm start` to see it working
2. **Integrate with Electron**: Update your Electron app to use the SDK
3. **Move to separate repo**: When ready, move this directory to its own repository
4. **Publish to npm**: Make it available as `npm install lucidtalk-core`

## 📄 License

MIT - Use anywhere, commercial or personal.

---

**Built to wrap and expose LucidTalk's powerful backend in a clean, developer-friendly way.**