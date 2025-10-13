# Jonas AI Chat - Setup Guide

## 🚀 Vad du har nu

En snygg, modern AI-chat med:
- ✅ Claude Sonnet 4 (smartare än GPT-4)
- ✅ Brainolf 2.0 auto-integration (känner dig)
- ✅ Voice input (mic button)
- ✅ Jordnära naturdesign
- ✅ Mobile-friendly
- ✅ Auto-saves viktiga insikter

## 🔧 Setup (5 minuter)

### 1. Kopiera .env-mall
```bash
cp .env.example .env.local
```

### 2. Lägg till OpenRouter API key
Gå till: https://openrouter.ai/keys
- Skapa konto (gratis)
- Generera API key
- Lägg in i `.env.local`:
```
OPENROUTER_API_KEY=sk-or-v1-DIN_NYCKEL_HÄR
```

### 3. Klar!
```bash
npm run dev
```

Gå till: http://localhost:3000/chat

## 🎯 Features

### Brainolf 2.0 Integration
- Läser automatiskt din kontext vid start
- Känner dina projekt, ekonomi, mående
- Anpassar svar efter din energinivå
- Sparar viktiga insights automatiskt

### Voice-First
- Stor mic-knapp (gul/grön gradient)
- Transkribering via Whisper
- Hands-free mode

### Smart Chat
- Multi-turn conversations (kommer ihåg 6 meddelanden)
- Keyword detection för auto-save insights
- Responsive design (mobil + desktop)

## 📱 Navigering

- `/` - Gamla simple voice interface
- `/chat` - Nya AI-chatten (denna!)
- `/flow` - FLOW meditation mode

## 💰 Kostnad

OpenRouter Claude Sonnet 4:
- ~$3 per 1M tokens (vs $30 för GPT-4)
- Räcker LÅNGT för personlig användning
- Typ $0.50-1/månad normalt bruk

## 🎨 Design

**Färgpalett:**
- Stone/Sand toner (naturlig, lugn)
- Amber/Green gradients (energi, fokus)
- Soft shadows, rounded corners
- Crisp typography

**Stil:**
- Minimalistisk, luftig
- Touch-friendly (stora knappar)
- Smooth animations
- ADHD-optimerad (tydlig, strukturerad)

## 🔮 Nästa steg

Ideas för framtiden:
- [ ] Streaming responses (text kommer ord för ord)
- [ ] ElevenLabs voice output
- [ ] Shortcuts (Cmd+K för quick commands)
- [ ] Health check-in prompts
- [ ] Todo-integration direkt i chat
- [ ] Kalender-vy sidebar
- [ ] Receipt upload i chat
- [ ] Morning briefing auto-start

Kör!
