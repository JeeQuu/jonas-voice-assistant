# Jonas Voice Assistant - Setup Guide

## Current Issues & Solutions

### 1. Missing API Keys
You need to add your API keys to `.env.local` file:

```bash
# Edit the .env.local file and add your keys:
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...
ELEVENLABS_API_KEY=...
```

### 2. Voice Recording Issues
- Voice recording currently routes to `/api/voice-simple` which is disabled
- **Solution**: Use text input instead (it's more reliable)
- The text input uses the same AI models but works better

### 3. Memory System
The app tries to connect to `https://quant-fast.vercel.app` for memory storage.
- Check if this endpoint is running
- Or disable memory features temporarily

## Quick Start

1. **Install dependencies:**
```bash
cd jonas-voice-assistant
npm install
```

2. **Add your API keys to `.env.local`:**
- Copy from `.env.local.example`
- Add your actual keys

3. **Run the app:**
```bash
npm run dev
```

4. **Access at:** http://localhost:3000

## Working Features
- ✅ Text chat input (recommended)
- ✅ OpenRouter GPT-4 integration
- ✅ Swedish language support
- ✅ Context-aware responses with family/friend info

## Known Issues
- ⚠️ Voice recording needs fixing
- ⚠️ Memory search may fail if API is down
- ⚠️ ElevenLabs TTS is optional

## Tips
- Use text input for best results
- The AI knows about your family (Sonja, Sigge, Stella)
- It has context about Henrik, Liseberg project, etc.