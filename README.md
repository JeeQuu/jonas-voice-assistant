# 🎤 Jonas Voice Assistant

**Your personal AI assistant with 30 integrated operations, powered by Claude 3.5 Sonnet and Brainolf 2.0.**

> 📊 **[View Full System Status](STATUS.md)** - Complete technical overview, features, and deployment info

---

## 🚀 Quick Start

### Live App
Visit: **https://jonas-voice-assistant.vercel.app/chat**

### Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local

# Start development server
npm run dev

# Open browser
open http://localhost:3000/chat
```

---

## ✨ What Can It Do?

### 📧 Communication
- Search and send Gmail
- Create and manage calendar events
- Daily briefings with todos and appointments

### 💰 Finance
- Scan and analyze receipts (OCR)
- Track subscriptions and spending
- Vendor spending reports

### 🗂️ Organization
- Smart todo management
- Dropbox file operations
- Long-term memory storage

### 🧠 Brainolf 2.0
- Context-aware conversations
- Health and mood tracking
- Personalized responses based on energy level

### 🎤 Voice Interface
- Record voice messages
- Automatic transcription (Whisper)
- Natural language understanding

---

## 📦 Tech Stack

**Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS
**Backend:** Node.js/Express on Render (https://quant-show-api.onrender.com)
**AI:** Claude 3.5 Sonnet via OpenRouter + OpenAI Whisper
**Database:** Supabase (PostgreSQL)
**Deployment:** Vercel (Frontend) + Render (Backend)

---

## 🔑 Environment Variables

Create `.env.local` with these variables:

```env
# AI & Voice
OPENROUTER_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here
ELEVENLABS_VOICE_ID=your_voice_id

# Backend
NEXT_PUBLIC_API_URL=https://quant-show-api.onrender.com
NEXT_PUBLIC_API_KEY=your_backend_key

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

See `.env.example` for the complete template.

---

## 📁 Project Structure

```
jonas-voice-assistant/
├── app/
│   ├── api/              # API routes
│   │   ├── chat/         # Main Claude chat endpoint
│   │   ├── user-context/ # Brainolf 2.0 context
│   │   └── voice-simple/ # Voice transcription
│   ├── chat/             # Main chat UI
│   └── page.tsx          # Landing page
├── lib/
│   ├── tools-config.ts   # All 30 tool definitions
│   └── tool-executor.ts  # Tool execution logic
├── public/               # Static assets
├── docs/                 # Archived documentation
├── STATUS.md             # 📊 Detailed system status
└── README.md             # This file
```

---

## 🎯 30 Integrated Operations

View the complete list with status indicators in **[STATUS.md](STATUS.md)**.

**Categories:**
- Gmail (2 operations)
- Google Calendar (4 operations)
- Todos (4 operations)
- Smart Memory (2 operations)
- Receipts & Analytics (3 operations)
- Subscriptions (2 operations)
- Dropbox (5 operations)
- Brainolf 2.0 Context (6 operations)
- Daily Sync (2 operations)

---

## 🧪 Testing

```bash
# Test the chat endpoint locally
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Vad har jag för möten idag?"}'

# Test voice transcription
# Upload an audio file via the web interface
```

---

## 🚀 Deployment

### Vercel (Frontend)
1. Connect GitHub repo to Vercel
2. Add all environment variables
3. Deploy automatically on push to `master`

### Render (Backend)
Backend is already deployed at:
https://quant-show-api.onrender.com

See `docs/DEPLOY.md` for detailed deployment instructions.

---

## 📚 Documentation

- **[STATUS.md](STATUS.md)** - Complete system overview (START HERE!)
- **[docs/SETUP-GUIDE.md](docs/SETUP-GUIDE.md)** - Detailed setup instructions
- **[docs/DEPLOY.md](docs/DEPLOY.md)** - Deployment guide
- **[docs/BRAINOLF-2.0-SCHEMA-REPORT.md](docs/BRAINOLF-2.0-SCHEMA-REPORT.md)** - Database schema

---

## 🐛 Troubleshooting

**Problem:** Calendar shows no events
**Solution:** Events may be >7 days out. System now automatically looks 60 days ahead.

**Problem:** Voice recording not working
**Solution:** Check browser microphone permissions.

**Problem:** Backend timeout
**Solution:** Render free tier may sleep. First request wakes it up (takes ~30s).

See **[STATUS.md](STATUS.md)** for more troubleshooting tips.

---

## 📊 Recent Updates

**2025-10-13:**
- ✅ Calendar now looks 60 days ahead (was 7)
- ✅ Fixed Supabase build errors on Vercel
- ✅ Added full conversation memory (no truncation)
- ✅ Added current time awareness to system prompt

---

## 📞 Support

For detailed technical information, performance metrics, and system architecture, see **[STATUS.md](STATUS.md)**.

---

**Maintained by:** Jonas Quant
**Powered by:** Claude 3.5 Sonnet (Anthropic)
**Last Updated:** 2025-10-13
