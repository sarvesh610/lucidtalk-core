# 🚀 LucidTalk Core - Installation Guide

**Complete setup guide for developers**

## 📋 System Requirements

### Minimum Requirements
- **Node.js**: 16.0.0 or higher
- **Memory**: 2GB RAM available
- **Storage**: 1GB free space (for models and binaries)
- **Platform**: macOS 10.15+ (recommended), Linux (partial support)

### Recommended Requirements
- **Node.js**: 18.0.0 or higher
- **Memory**: 4GB RAM available
- **Storage**: 2GB free space
- **Network**: Stable internet for AI providers (optional)

## 🛠️ Installation Methods

### Method 1: NPM (Recommended)

```bash
npm install lucidtalk-core
```

### Method 2: Yarn

```bash
yarn add lucidtalk-core
```

### Method 3: From Source

```bash
git clone https://github.com/sarvesh610/lucidtalk-core.git
cd lucidtalk-core
npm install
npm link
```

## 🔧 Platform-Specific Setup

### macOS (Full Support)

```bash
# Install dependencies
npm install lucidtalk-core

# Verify installation
node -e "console.log(require('lucidtalk-core'))"
```

**Required Permissions:**
- Microphone access (granted automatically when first used)
- Screen recording permission (for system audio capture)

### Linux (Partial Support)

```bash
# Install system dependencies
sudo apt update
sudo apt install build-essential libasound2-dev

# Install LucidTalk Core
npm install lucidtalk-core
```

**Note**: Audio processing is limited on Linux. Full transcription requires macOS.

### Windows (Experimental)

```bash
# Install with Windows build tools
npm install --global windows-build-tools
npm install lucidtalk-core
```

**Note**: Windows support is experimental. P2P features work, audio processing is limited.

## 🎯 Quick Verification

### Test Installation

```javascript
// test-installation.js
const { LucidTalk } = require('lucidtalk-core');

async function testInstallation() {
  console.log('🧪 Testing LucidTalk Core installation...');
  
  try {
    const bot = new LucidTalk({
      privacy: 'local-only',
      p2p: false,
      ai: 'local'
    });
    
    console.log('✅ SDK imported successfully');
    console.log('✅ Basic configuration works');
    
    // Test binary availability (macOS only)
    if (process.platform === 'darwin') {
      const fs = require('fs');
      const path = require('path');
      const binPath = path.join(__dirname, 'node_modules/lucidtalk-core/bin/whisper-cli');
      
      if (fs.existsSync(binPath)) {
        console.log('✅ Whisper binary found');
      } else {
        console.log('⚠️ Whisper binary not found');
      }
    }
    
    console.log('🎉 Installation successful!');
    
  } catch (error) {
    console.error('❌ Installation test failed:', error.message);
    process.exit(1);
  }
}

testInstallation();
```

Run the test:
```bash
node test-installation.js
```

## 🔧 Configuration

### Environment Setup

Create `.env` file:
```bash
# API Keys (optional)
OPENAI_API_KEY=sk-your_openai_key_here
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here
GROQ_API_KEY=gsk_your_groq_key_here

# Storage
LUCIDTALK_STORAGE_PATH=./sessions

# Advanced
LUCIDTALK_LOG_LEVEL=info
LUCIDTALK_DEBUG=false
```

### Project Setup

```javascript
// lucidtalk.config.js
module.exports = {
  privacy: 'local-only',
  p2p: true,
  ai: process.env.AI_PROVIDER || 'local',
  
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    groq: process.env.GROQ_API_KEY
  },
  
  storagePath: process.env.LUCIDTALK_STORAGE_PATH || './sessions'
};
```

## 🚨 Troubleshooting

### Common Issues

#### Issue: "Module not found: lucidtalk-core"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: "Whisper binary not found" (macOS)

**Solution:**
```bash
# Check if binary is included
ls node_modules/lucidtalk-core/bin/

# If missing, reinstall
npm uninstall lucidtalk-core
npm install lucidtalk-core
```

#### Issue: "Permission denied" (macOS)

**Solution:**
```bash
# Make binary executable
chmod +x node_modules/lucidtalk-core/bin/whisper-cli

# Grant microphone permission in System Preferences
open "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone"
```

#### Issue: "Node version not supported"

**Solution:**
```bash
# Check Node version
node --version

# Update Node.js to 16+
# Using nvm:
nvm install 18
nvm use 18

# Or download from: https://nodejs.org/
```

#### Issue: "P2P connection failed"

**Solution:**
```bash
# Check network connectivity
ping 8.8.8.8

# Test with local-only mode first
const bot = new LucidTalk({ privacy: 'local-only', p2p: false });
```

### Platform-Specific Issues

#### macOS: "App is damaged" error

```bash
# Remove quarantine attribute
xattr -d com.apple.quarantine node_modules/lucidtalk-core/bin/whisper-cli
```

#### Linux: "Audio device not found"

```bash
# Install ALSA development libraries
sudo apt install libasound2-dev

# List audio devices
arecord -l
```

#### Windows: "Build tools missing"

```bash
# Install Visual Studio Build Tools
npm install --global windows-build-tools

# Alternative: Install Visual Studio Community
```

### Debug Mode

Enable verbose logging:

```javascript
const bot = new LucidTalk({
  debug: true,
  logLevel: 'debug'
});

bot.onError((error) => {
  console.error('Debug Error:', error);
});
```

### Log Files

Check logs for detailed error information:

```bash
# macOS
tail -f ~/Library/Logs/LucidTalk/debug.log

# Linux
tail -f ~/.lucidtalk/logs/debug.log

# Windows
type %APPDATA%\\LucidTalk\\logs\\debug.log
```

## 📦 Dependencies

### Runtime Dependencies
- `eventemitter3`: Event handling
- `node-gyp` (auto-installed): Native module compilation

### Binary Dependencies (Included)
- `whisper-cli`: Audio transcription binary
- `libwhisper.dylib`: Whisper library (macOS)
- `libggml*.dylib`: GGML libraries (macOS)

### Optional Dependencies
- `dotenv`: Environment variable management
- AI provider SDKs (auto-detected when needed)

## 🔄 Updates

### Staying Updated

```bash
# Check for updates
npm outdated lucidtalk-core

# Update to latest version
npm update lucidtalk-core

# Update to specific version
npm install lucidtalk-core@1.2.0
```

### Breaking Changes

Check [CHANGELOG.md](./CHANGELOG.md) for breaking changes between versions.

### Migration Guide

When updating major versions, check the migration guide in our documentation.

## 🆘 Getting Help

If you're still having issues:

1. **Check our [FAQ](https://docs.lucidtalk.ai/faq)**
2. **Search [existing issues](https://github.com/sarvesh610/lucidtalk-core/issues)**
3. **Join our [Discord](https://discord.gg/WwxyUCTE)** for real-time help
4. **Create a [new issue](https://github.com/sarvesh610/lucidtalk-core/issues/new)** with:
   - Your operating system
   - Node.js version
   - Complete error message
   - Steps to reproduce

---

**Ready to build? Check out [DEVELOPER.md](./DEVELOPER.md) for the full API guide!**