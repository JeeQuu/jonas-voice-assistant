# AGENTS.md - AI Agent Context File

**Quick context for AI assistants working on this codebase**

When you (AI agent) are brought into this project, read this file first to understand everything you need to know.

---

## 🎯 Project Overview

**Name**: Jonas Voice Assistant (aka "Quant Show")
**Purpose**: Personal AI assistant with 30+ integrated operations
**Owner**: Jonas Quant
**Tech Stack**: Next.js 14 (App Router), Supabase, Claude 3.5 Sonnet, ElevenLabs
**Production**: https://jonas-voice-assistant.vercel.app
**Backend API**: https://quant-show-api.onrender.com

---

## 🏗️ Architecture

```
Frontend (Next.js):
├─ / (homepage - start hub)
├─ /chat (AI conversation interface)
└─ /flow (ADHD-friendly task dashboard)

Backend (Express API on Render):
├─ 30+ API endpoints
├─ Claude 3.5 Sonnet integration
├─ Gmail/Calendar API
├─ Supabase database
└─ ElevenLabs text-to-speech
```

---

## 📂 Key File Locations

### Frontend (Next.js App Router)
```
app/
├─ page.tsx                    # Homepage (start hub)
├─ chat/page.tsx               # Main AI chat interface
├─ flow/
│  ├─ page.tsx                 # FLOW dashboard wrapper
│  ├─ components/
│  │  ├─ DailyBriefing.tsx    # Daily briefing component
│  │  ├─ FlowMode.tsx          # FLOW mode visualization
│  │  ├─ MagneticField.tsx     # Magnetic task field
│  │  └─ FocusMode.tsx         # Single-task focus mode
│  └─ hooks/
│     └─ useTasks.ts           # Task management hook
└─ globals.css                 # Tailwind + custom styles
```

### Backend API (Express)
```
api/
├─ server.js                   # Main Express server (all routes)
├─ daily-context.js            # AI daily intelligence layer
├─ morning-meditation.js       # Meditation generator
├─ user-context.js             # Brainolf 2.0 context engine
├─ user-health.js              # Health tracking
├─ memory-store.js             # Conversation memory
├─ sync-gmail-to-memory.js     # Email → memory sync
├─ receipt-*.js                # Receipt OCR & tracking
└─ contacts.js, projects.js, invoices.js
```

### Configuration
```
.env.local (local dev)
.env (production - Vercel/Render)

Required keys:
- OPENROUTER_API_KEY         # Claude 3.5 Sonnet
- ELEVEN_LABS_KEY            # Text-to-speech
- SUPABASE_URL & SUPABASE_KEY
- GOOGLE_CLIENT_*            # Gmail/Calendar OAuth
- NEXT_PUBLIC_API_KEY="JeeQuuFjong"
```

---

## 🎨 Design System (Current)

**Updated**: Oct 23, 2025 - Total redesign to earthy minimalism

### Colors
```css
Background:  #F5F1E8  /* Warm beige */
White:       #FFFFFF
Border:      #D4CDC1  /* Soft gray */
Text:        #2C2420  /* Dark brown */
Muted:       #6B5D52  /* Light brown */
Accent:      #C87D5E  /* Terracotta */
Green:       #6B8E7F  /* Olive green */
Disabled:    #E8E2D5, #A89E92
```

### Typography
- **Font Weight**: `font-light` (300) is default
- **Headers**: Clean, minimal
- **No gradients**: Flat design only
- **Whitespace**: Generous spacing

### Component Style
```jsx
// Example button (earthy style)
<button className="w-full p-6 border-2 border-[#C87D5E] text-[#C87D5E]
  hover:bg-[#C87D5E] hover:text-white transition-all font-light">
  Text
</button>
```

**Old Design (deprecated)**: Gradients, purple/pink/blue colors, font-bold
**New Design**: Earthy, minimal, sober, jordnära

---

## 🧠 Core Concepts

### 1. **Brainolf 2.0**
The AI personality engine (Claude 3.5 Sonnet via OpenRouter).
- **Tone**: Warm, Swedish, ADHD-friendly
- **Context**: User preferences, relationships, habits stored in Supabase
- **Memory**: Long-term conversation memory with vector search

### 2. **User Context System**
```javascript
/api/user-context
├─ Core identity (family, work, values)
├─ Current state (projects, economy)
└─ Recent context (last 7 days)
```

### 3. **Session Management**
- Chat sessions auto-close after 30min inactivity
- Conversations → summarized → stored in memory
- Cronjob closes ghost sessions nightly

### 4. **Mobile-First Audio**
- **Touch to unlock**: Required on mobile browsers
- Audio context must be initialized by user interaction
- All playback uses `preload='auto'` + `load()` pattern

---

## 🔑 Important Patterns

### API Authentication
```javascript
// All backend API calls need:
headers: {
  'x-api-key': 'JeeQuuFjong'
}
```

### Audio Playback (Mobile-Safe)
```typescript
const audio = new Audio();
audio.preload = 'auto';
audio.src = audioSource;
await audio.load();
await audio.play(); // Wrap in try/catch for mobile
```

### Component Navigation
```tsx
// Home button pattern (all pages except homepage)
<a href="/" className="text-[#2C2420] hover:text-[#C87D5E]">
  🏠
</a>
```

---

## 📊 Database (Supabase)

### Main Tables
```sql
emails               -- Gmail sync
calendar_events      -- Google Calendar sync
todos                -- Task management
conversation_memories -- Chat history (vector search)
user_context         -- Brainolf 2.0 core data
user_health          -- Daily mood/energy tracking
receipts             -- OCR-scanned receipts
subscriptions        -- Recurring payments
contacts             -- Key people
projects             -- Ongoing work
invoices             -- Financial obligations
```

### User Context Structure
```json
{
  "core": {
    "identity": { /* family, work, values */ }
  },
  "current": {
    "economy": { /* subscriptions, receipts */ },
    "projects": { /* active projects */ }
  },
  "recent": {
    "conversation_2025-10-23": { /* daily context */ }
  }
}
```

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
git push origin master  # Auto-deploys to Vercel
```
- **Production**: https://jonas-voice-assistant.vercel.app
- **Build**: Next.js 14 (App Router)
- **Env vars**: Set in Vercel dashboard

### Backend (Render)
- **URL**: https://quant-show-api.onrender.com
- **Deploy**: Auto from GitHub `main` branch
- **Location**: `../api/` directory (sibling to quant-show/)
- **Health Check**: `/api/health`

---

## 🎯 Common Tasks

### Adding a New Page
1. Create `app/new-page/page.tsx`
2. Add home button: `<a href="/">🏠</a>`
3. Use earthy design system colors
4. Add to homepage navigation

### Adding API Endpoint
1. Edit `api/server.js`
2. Add route with `authenticate` middleware
3. Test with curl: `curl -H "x-api-key: JeeQuuFjong" ...`
4. Restart Render service

### Updating AI Prompts
- **Chat**: `api/server.js` → `/api/ai/chat` route
- **Meditation**: `api/morning-meditation.js` → meditation prompt
- **Briefing**: `api/daily-context.js` → AI insights generation

### Mobile Audio Fix
1. Add "Touch to unlock" button (see `app/page.tsx` example)
2. Use `preload='auto'` + `load()` before `play()`
3. Wrap in try/catch for NotAllowedError

---

## 🐛 Known Issues & Solutions

### Issue: Audio doesn't play on mobile
**Solution**: User must interact first (touch-to-unlock pattern)

### Issue: API returns 401
**Solution**: Check `x-api-key: JeeQuuFjong` header

### Issue: Vercel build fails
**Solution**: Check TypeScript errors, ensure all imports exist

### Issue: Session not closing
**Solution**: Check `/api/session/end` endpoint, verify cronjob

---

## 📝 Code Style

### TypeScript
```typescript
// Use explicit types
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Prefer const over let
const messages: Message[] = [];
```

### React Components
```tsx
// Functional components with TypeScript
export default function Component({ prop }: { prop: string }) {
  const [state, setState] = useState<string>('');
  return <div>...</div>;
}
```

### API Routes
```javascript
// Always authenticate
app.get('/api/endpoint', authenticate, async (req, res) => {
  try {
    // Logic
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🎯 User Preferences (Jonas)

### Personal
- **Language**: Swedish (always)
- **Family**: Sonja (daughter), Lina (partner)
- **Work**: Projection mapping, content creation
- **Interests**: Disc golf, AI/ML, automation

### Design Preferences
- **Minimalist**: Clean, sober, jordnära
- **No fluff**: Hate cluttered, "billig ful" UI
- **Functional**: Tools > decoration
- **ADHD-friendly**: Clear structure, minimal distractions

### Communication Style
- **Casual**: "fixa", "kör", "nice"
- **Swedish**: Native language
- **Direct**: Get to the point
- **Proactive**: Suggest solutions, don't just ask

---

## 🔄 Recent Changes (Context)

### Oct 23, 2025
- ✅ Complete UI redesign (earthy minimalist)
- ✅ Homepage = Start hub (Morning Zen + Briefing)
- ✅ Touch-to-unlock audio for mobile
- ✅ Home buttons on all pages
- ✅ Removed gradients, added jordnära colors

### Oct 22, 2025
- ✅ Fixed mobile audio playback
- ✅ Improved meditation generation
- ✅ Added conversation memory search

### Previous
- Email sync cronjobs
- Receipt OCR system
- Session management
- Brainolf 2.0 context engine

---

## 💡 When Helping Jonas

### DO:
- ✅ Use Swedish in responses
- ✅ Be proactive (suggest, don't just answer)
- ✅ Follow the new earthy design system
- ✅ Test on mobile (always check audio)
- ✅ Deploy immediately when asked
- ✅ Keep code clean and minimal

### DON'T:
- ❌ Use gradients or "billig" design
- ❌ Over-engineer solutions
- ❌ Forget mobile considerations
- ❌ Use English unless code requires it
- ❌ Add unnecessary features
- ❌ Ignore ADHD-friendly principles

---

## 🔗 Quick Links

**Docs**:
- [README.md](README.md) - Project overview
- [STATUS.md](STATUS.md) - Technical status
- [USER_MANUAL.md](USER_MANUAL.md) - User guide
- [docs/BRAINOLF-2.0-SCHEMA-REPORT.md](docs/BRAINOLF-2.0-SCHEMA-REPORT.md)

**APIs**:
- Frontend: https://jonas-voice-assistant.vercel.app
- Backend: https://quant-show-api.onrender.com/api/health
- Supabase: https://supabase.com (Sweden datacenter)

**External Services**:
- OpenRouter (Claude): https://openrouter.ai
- ElevenLabs (TTS): https://elevenlabs.io
- Vercel (Deploy): https://vercel.com
- Render (API): https://render.com

---

## 🎓 Learning the Codebase

### Start Here (15 min):
1. Read this file (you're doing it!)
2. Skim `README.md`
3. Look at `app/page.tsx` (homepage)
4. Check `api/server.js` (all API routes)

### Go Deeper (1 hour):
5. Read `docs/BRAINOLF-2.0-SCHEMA-REPORT.md`
6. Explore `app/chat/page.tsx` (main interface)
7. Check `api/daily-context.js` (AI intelligence)
8. Review Supabase schema in STATUS.md

### Master Level (2-3 hours):
9. Understand session management flow
10. Learn memory storage system
11. Study receipt OCR pipeline
12. Explore cronjob architecture

---

**Last Updated**: October 23, 2025
**Next Agent**: Read this first, then ask Jonas what to work on! 🚀
