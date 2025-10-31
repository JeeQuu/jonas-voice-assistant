# AGENTS.md - AI Agent Context File

**Quick context for AI assistants working on this codebase**

When you (AI agent) are brought into this project, read this file first to understand everything you need to know.

---

## 🎯 Project Overview

**Name**: Jonas Voice Assistant (aka "Quant Show")
**Purpose**: Personal AI assistant with 30+ integrated operations
**Owner**: Jonas Quant
**Tech Stack**: Next.js 15.5.3 (App Router), Supabase, Claude 3.5 Sonnet, HeyGen Avatar, ElevenLabs
**Production**: https://jonas-voice-assistant.vercel.app
**Backend API**: https://quant-show-api.onrender.com

**Key Features**:
- 🎤 Voice & text chat with Claude 3.5 Sonnet
- 🤖 Interactive 3D HeyGen avatar that speaks responses
- 📋 ADHD-friendly Flow dashboard with physics-based task management
- 🌌 Vision Quest: 3D psychedelic space journey (Three.js)
- 📧 Gmail sync & email intelligence
- 📅 Google Calendar integration (2 calendars)
- 💰 Receipt OCR & financial tracking
- 🧠 Brainolf 2.0 context system (3-layer memory)
- ⏰ Automated daily sync cronjobs

---

## 🏗️ Architecture

```
Frontend (Next.js 15.5.3 on Vercel):
├─ / (homepage - Morning Zen meditation + Daily Briefing)
├─ /chat (AI conversation with HeyGen avatar + voice recording)
├─ /flow (Physics-based task management - Magnetic/Flow/Focus modes)
├─ /vision (3D space journey with Three.js)
└─ /mobile (Mobile-optimized view)

Backend (Express.js on Render):
├─ 46+ API endpoints (server.js + modules)
├─ Claude 3.5 Sonnet via OpenRouter (with 30 tools)
├─ HeyGen Streaming Avatar API
├─ Gmail/Calendar/Dropbox APIs
├─ Supabase PostgreSQL database
├─ ElevenLabs text-to-speech
├─ OpenAI Whisper transcription
└─ Cron jobs (daily sync, cleanup, summaries)

Data Flow:
Frontend → Next.js API Routes → Tool Executor → Backend API → External Services
```

---

## 📂 Key File Locations

### Frontend (Next.js App Router)
```
app/
├─ page.tsx                    # Homepage (Morning Zen + Daily Briefing)
├─ layout.tsx                  # Root layout with metadata
├─ globals.css                 # Tailwind + custom styles
│
├─ chat/
│  ├─ page.tsx                 # Main AI chat interface with voice
│  └─ components/
│     └─ HeyGenAvatar.tsx      # Interactive 3D avatar (speaks responses)
│
├─ flow/
│  ├─ page.tsx                 # FLOW dashboard wrapper
│  ├─ components/
│  │  ├─ DailyBriefing.tsx    # Daily briefing display
│  │  ├─ FlowMode.tsx          # Text-based flow visualization
│  │  ├─ MagneticField.tsx    # Physics-based draggable task cards
│  │  ├─ MagneticCard.tsx     # Individual magnetic task card
│  │  ├─ TaskCard.tsx          # Alternative task card design
│  │  └─ FocusMode.tsx         # Minimalist single-task focus
│  ├─ hooks/
│  │  ├─ useTasks.ts           # Task management & data fetching
│  │  └─ usePhysics.ts         # Physics simulation for magnetic mode
│  └─ utils/
│     ├─ categoryStyles.ts     # Tailwind styles for task categories
│     ├─ soundEffects.ts       # Audio effect management
│     └─ types.ts              # TypeScript interfaces
│
├─ vision/
│  └─ page.tsx                 # 3D space journey (Three.js visualization)
│
├─ mobile/
│  └─ page.tsx                 # Mobile-optimized view
│
└─ api/                        # Next.js API routes (backend integration)
   ├─ chat/route.ts            # Claude AI chat endpoint
   ├─ heygen/token/route.ts    # HeyGen session token
   ├─ session/
   │  ├─ start/route.ts        # Initialize session
   │  ├─ end/route.ts          # Close session with summary
   │  └─ save/route.ts         # Save session data
   ├─ user-context/
   │  ├─ summary/route.ts      # Fetch Brainolf 2.0 context
   │  └─ insight/route.ts      # Save insights
   ├─ user-health/today/route.ts  # Daily health data
   ├─ voice-simple/route.ts    # Whisper transcription
   ├─ text-simple/route.ts     # Text processing
   └─ test-env/route.ts        # Environment testing

lib/
├─ tools-config.ts             # All 30 tool definitions for Claude
├─ tool-executor.ts            # Tool execution & backend integration
└─ jonas-voice-sdk.js          # SDK for voice interactions

public/
├─ sounds/                     # Audio files & meditation music
└─ spacejourney.mp3            # Background music for Vision Quest
```

### Backend API (Express on Render)
```
api/  (46+ JavaScript files)
├─ server.js                          # Main Express server (1,500+ lines)
│
├─ Core AI & Context
│  ├─ daily-context.js                # Daily intelligence briefing
│  ├─ morning-meditation.js           # Meditation content generator
│  ├─ user-context.js                 # Brainolf 2.0 context engine (3 layers)
│  ├─ user-health.js                  # Health tracking (mood, energy, stress)
│  └─ session-end.js                  # Session closure with AI summary
│
├─ Memory Management
│  ├─ memory-store.js                 # Store memories to Supabase
│  ├─ memory-search.js                # Search with semantic expansion
│  └─ memory-delete.js                # Delete memories
│
├─ Email Integration (Gmail)
│  ├─ sync-gmail-to-memory.js        # Gmail → smart_memories sync
│  ├─ gmail-send.js                   # Send email via Gmail
│  ├─ gmail-direct-search.js          # IMAP search (Inbox + Sent)
│  ├─ email-formatter.js              # HTML email formatting
│  └─ extract-receipts.js             # Extract receipts from emails
│
├─ Calendar Integration
│  ├─ sync-calendar-to-memory.js     # Google Calendar → memory sync
│  └─ calendar-events.js              # Calendar helpers (2 calendars)
│
├─ Receipt Tracking (12 files)
│  ├─ receipt-store.js                # Store receipt data
│  ├─ receipt-ocr.js                  # OCR extraction
│  ├─ receipt-analytics.js            # Spending analytics
│  ├─ receipt-flags.js                # Flagged receipts
│  ├─ receipt-ai-classifier.js        # AI categorization
│  ├─ subscription-detector.js        # Recurring charge detection
│  └─ renewal-notices-*.js            # Subscription renewal tracking
│
├─ Dropbox Integration (6 files)
│  ├─ dropbox-upload.js               # Upload to Dropbox
│  ├─ dropbox-list.js                 # List files
│  ├─ dropbox-download.js             # Download files
│  ├─ dropbox-copy.js                 # Copy files
│  ├─ dropbox-move.js                 # Move files
│  └─ organize-receipts.js            # Auto-organize receipts
│
├─ CRM & Structured Data
│  ├─ contacts.js                     # Contact management
│  ├─ projects.js                     # Project tracking
│  └─ invoices.js                     # Invoice management
│
├─ Utilities
│  ├─ trigger-sync.js                 # Manual sync trigger
│  ├─ html-to-pdf-simple.js          # PDF conversion
│  └─ subscriptions.js                # Subscription management
│
└─ Cron Jobs
   ├─ daily-sync.js                   # Main sync orchestrator (7 AM)
   ├─ cleanup-emails.js               # AI-based email filtering
   ├─ daily-summary.js                # Daily report email
   ├─ close-inactive-sessions.js      # Auto-close ghost sessions
   └─ check-missing-receipts.js       # Receipt validation

migrations/                           # Database schema migrations
└─ *.sql files for Supabase schema
```

### Configuration
```
.env.local (local dev)
.env (production - Vercel/Render)

Required Frontend Keys:
- OPENROUTER_API_KEY                # Claude 3.5 Sonnet via OpenRouter
- OPENAI_API_KEY                    # Whisper transcription
- HEYGEN_API_KEY                    # Avatar interaction
- NEXT_PUBLIC_HEYGEN_AVATAR_ID      # Avatar ID (Katya_ProfessionalLook2_public)
- SUPABASE_URL & SUPABASE_SERVICE_KEY
- NEXT_PUBLIC_API_URL               # Backend API URL
- NEXT_PUBLIC_API_KEY               # Backend auth ("JeeQuuFjong")

Required Backend Keys:
- API_KEY="JeeQuuFjong"                  # Backend authentication
- SUPABASE_URL & SUPABASE_ANON_KEY & SUPABASE_SERVICE_KEY
- GMAIL_USER & GMAIL_APP_PASSWORD        # Gmail IMAP/SMTP
- GOOGLE_CALENDAR_ID                     # Primary calendar (jonasquant@gmail.com)
- GOOGLE_SHARED_CALENDAR_ID              # Shared calendar (1np85dkiru57r752i9ssseuuic@group.calendar.google.com)
- GOOGLE_SERVICE_ACCOUNT_JSON            # Google APIs credentials
- OPENAI_KEY                             # OpenRouter API key (PRIMARY - used for ALL AI)
- OPENROUTER_API_KEY                     # Same as OPENAI_KEY (fallback)
- ELEVEN_LABS_KEY                        # Text-to-speech
- DROPBOX_ACCESS_TOKEN                   # Dropbox integration

**Important:** CLAUDE_KEY is NO LONGER NEEDED (removed Oct 31, 2025)
**All AI operations now use OpenRouter only (GPT-4o + Claude 3.5 fallback)**
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

### 1. **Brainolf 2.0 + Claude 3.5 Sonnet**
The AI personality engine with 30 integrated tools.
- **AI Model**: Claude 3.5 Sonnet via OpenRouter
- **Tone**: Warm, Swedish, ADHD-friendly, proactive
- **Context**: 3-layer system (core identity, current state, recent activity)
- **Memory**: Long-term conversation memory with AI summaries
- **Tools**: 30 operations for Gmail, Calendar, Todos, Memory, Receipts, Dropbox

**30 Tools Available to Claude:**
1-2. **Gmail**: search_gmail, send_email
3-6. **Calendar**: get_calendar_events, create/update/delete_calendar_event
7-10. **Todos**: get_todos, create_todo, update_todo, delete_todo
11-12. **Memory**: search_memory, store_memory
13-15. **Receipts**: get_receipt_analytics, extract_receipts_from_email, get_vendor_spending
16-17. **Subscriptions**: list_subscriptions, manage_subscription
18-22. **Dropbox**: list/upload/download/copy/delete_file
23-28. **Brainolf Context**: get_user_context, get_user_health, save_insight, get_daily_context, get_context_history, update_context_section
29-30. **Daily Sync**: trigger_daily_sync, get_daily_briefing

**Tool Executor Pattern** (lib/tool-executor.ts):
```typescript
executeTool(toolName, params) {
  // Maps tool name to backend API endpoint
  // Handles authentication with x-api-key
  // Returns results to Claude for response generation
}
```

### 2. **User Context System**
```javascript
/api/user-context
├─ Core identity (family, work, values)
├─ Current state (projects, economy)
└─ Recent context (last 7 days)
```

### 3. **HeyGen Interactive Avatar**
- **3D Avatar**: Katya (professional look) speaks AI responses
- **Streaming**: Real-time video stream from HeyGen API
- **Natural Speech**: Emotion, prosody, facial expressions
- **Session Token**: Generated via `/api/heygen/token`
- **Events**: Avatar lifecycle (talking, stopped, disconnected)

### 4. **Session Management**
- Chat sessions auto-close after 30min inactivity
- Conversations → AI summary (Claude) → stored in memory
- AI extracts: summary, topics, importance (1-5), insights
- Insights saved to `user_context` if importance >= 3
- Cronjob closes ghost sessions nightly

### 5. **Flow Dashboard (ADHD-Friendly)**
Three interaction modes for task management:

**Magnetic Mode**: Physics-based draggable task cards
- Magnetic attraction between cards
- Global background swipe detection
- Visual momentum & friction
- Sound effects for interactions

**Flow Mode**: Linear, text-based task flow
- Clean list view
- Quick completion toggles

**Focus Mode**: Minimalist single-task view
- One task at a time
- Distraction-free interface

**Features**:
- Background Zen meditation music
- Task categories with color coding
- Stats display (total, completed, urgent)
- Fetches tasks from backend via `useTasks()` hook

### 6. **Vision Quest (3D Experience)**
- **Three.js** 3D space visualization
- Procedurally generated star field
- Text particles floating in 3D space
- Poetic vision narration (personalized from Brainolf context)
- First-person camera movement through space
- Ambient audio with user voice narration

### 7. **Mobile-First Audio**
- **Touch to unlock**: Required on mobile browsers
- Audio context must be initialized by user interaction
- All playback uses `preload='auto'` + `load()` pattern
- Try/catch for NotAllowedError on mobile

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

## 📊 Database (Supabase PostgreSQL)

### Main Tables
```sql
-- Conversation System (3-layer memory)
conversation_sessions   -- Full chat sessions with JSONB messages
                       -- Auto-closes after 30min inactivity
                       -- AI-generated summary, topics, importance
daily_summaries        -- Daily compression of conversations
weekly_summaries       -- Weekly high-level summaries

-- Brainolf 2.0 Context System
user_context           -- 3 layers: core (identity), current (active), recent (temporal)
                       -- Sections: identity, projects, economy, relationships, health
user_health            -- Daily tracking: mood_score, energy_level, stress_level, sleep_quality
user_context_history   -- Audit trail of context changes

-- Memory & Email
smart_memories         -- Email/memory storage with JSONB data
                       -- type: email, memory, conversation
                       -- importance scoring (1-5)
                       -- metadata (JSONB)
memories               -- Legacy memory table (still used)

-- Financial Tracking
receipts               -- OCR-scanned receipts
                       -- vendor, amount, date, category, confidence
renewal_notices        -- Subscription renewal tracking
subscriptions          -- Recurring payments

-- CRM
contacts               -- Key people
projects               -- Ongoing work
invoices               -- Financial obligations

-- Tasks
todos                  -- Task management with calendar integration
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

## 🧾 Receipt OCR System (Simplified Oct 31, 2025)

**Architecture:** Single API key (OpenRouter) with dual-model fallback

### How It Works:
1. **Primary**: OpenRouter → GPT-4o vision model
2. **Fallback**: OpenRouter → Claude 3.5 Sonnet (if GPT-4o fails)
3. **PDF Support**: Uses OpenRouter file parser with mistral-ocr engine

### Supported Formats:
- ✅ PDFs (using `type: "file"` with mistral-ocr plugin)
- ✅ Images (JPG, PNG, WebP using `type: "image_url"`)

### Extraction Output:
```json
{
  "vendor": "ElevenLabs",
  "amount": 22,
  "currency": "USD",
  "date": "2025-10-27",
  "items": ["Creator subscription"],
  "category": "subscription",
  "confidence": 0.95,
  "notes": "Invoice for subscription service"
}
```

### Smart Validation:
- Currency detection ($ = USD, kr = SEK, € = EUR)
- Vendor normalization (PayPal Inc → PayPal)
- Hard-coded USD vendors (ElevenLabs, OpenAI, Anthropic, etc.)
- Suspicious amount flagging (<5 SEK or >50,000 SEK)
- Vendor-specific validation (Netflix should be 100-300 SEK)

### Statistics:
- **1,080+ receipts** tracked as of Oct 31, 2025
- **Auto-naming**: `YYYY-MM-DD_Vendor.pdf`
- **Auto-upload** to Dropbox `/Kvitton` folder
- **Monthly analytics** available via `/api/receipt-analytics`

### Cost:
- ~$2 per 1,000 pages (mistral-ocr)
- Typical receipt: ~$0.002 per extraction
- Much cheaper than separate Anthropic API

---

## 🤖 Automated Cron Jobs

### Daily Sync (7:00 AM Daily)
**File**: `cron/daily-sync.js`
**Orchestrates**:
1. Gmail sync (7 days back) → `smart_memories`
2. Calendar sync (14 days ahead) → `smart_memories`
3. Email cleanup (AI-based filtering)
4. Receipt extraction (before deletion)
5. Daily summary email generation

**Render Cron**: Scheduled via Render Cron Jobs service

### Email Cleanup (Part of Daily Sync)
**File**: `cron/cleanup-emails.js`
**AI-Based Filtering**:
- Deletes spam, newsletters, notifications
- Preserves receipts (importance >= 4)
- Preserves family/work emails
- Extracts receipts to Dropbox before deletion

**Deletion Criteria**:
- LinkedIn/GitHub/Spotify notifications
- Marketing emails with unsubscribe links
- Auto-generated notifications (noreply@...)

**Preservation Criteria**:
- Receipts & invoices (importance >= 4)
- Family emails (Sonja, Lina)
- Work/project emails
- High importance (>= 3)

### Daily Summary Email
**File**: `cron/daily-summary.js`
**Generates HTML email with**:
- Email sync statistics
- Calendar events for today
- Recent emails (24h)
- Extracted receipts
- Deleted email list
- Sent to: `jonasquant@gmail.com`

### Close Inactive Sessions
**Endpoint**: `POST /api/cron/close-sessions`
**Logic**:
- Identifies sessions > 30 min inactive
- Generates AI summary using Claude
- Extracts topics and importance
- Saves insights to `user_context`

### Memory Cleanup
**Endpoints**:
- `POST /api/cron/daily-cleanup` - Daily memory cleanup
- `POST /api/cron/weekly-cleanup` - Weekly cleanup

---

## 🔄 Recent Changes (Context)

### Oct 31, 2025 (Latest Updates)
- ✅ **Receipt OCR simplified** - Now uses only OpenRouter (removed Anthropic direct API)
- ✅ **Single API key architecture** - One OpenRouter key for all AI operations
- ✅ **PDF support fixed** - Proper OpenRouter file parser integration with mistral-ocr
- ✅ **Receipt system validated** - 1,080+ receipts tracked, system fully operational
- ✅ **Dual calendar support** - Personal + "Lina och Jonas" shared calendar
- ✅ **Gmail/Calendar verified** - All connections working perfectly
- ✅ **Cost optimization** - Removed need for separate Anthropic account

### Oct 30, 2025
- ✅ **Next.js 15.5.3** upgrade (from 14)
- ✅ **React 19** integration
- ✅ **HeyGen Interactive Avatar** with 3D streaming
- ✅ **Vision Quest** 3D space journey (Three.js)
- ✅ **Flow Dashboard** physics-based task management (3 modes)
- ✅ **30 Claude Tools** fully integrated
- ✅ **Cron automation** for daily sync, cleanup, summaries
- ✅ **46+ API endpoints** on backend
- ✅ **Framer Motion** for advanced animations
- ✅ Complete earthy design system

### Oct 23, 2025
- ✅ Complete UI redesign (earthy minimalist)
- ✅ Homepage = Start hub (Morning Zen + Briefing)
- ✅ Touch-to-unlock audio for mobile
- ✅ Home buttons on all pages
- ✅ Removed gradients, added jordnära colors

### Oct 20, 2025
- ✅ Email sync cronjobs (sync-gmail-to-memory)
- ✅ Daily summary generation
- ✅ Receipt extraction automation
- ✅ Ghost session cleanup

### Previous Milestones
- Receipt OCR system with Dropbox integration
- Brainolf 2.0 context engine (3-layer system)
- Session management with AI summaries
- Multi-calendar support (Personal + Lina och Jonas)

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

---

## 📦 Technology Summary

**Frontend Stack:**
- Next.js 15.5.3 (App Router)
- React 19.1.0
- TypeScript 5
- Tailwind CSS 4
- Framer Motion 12.23.22
- Three.js 0.180.0
- HeyGen Streaming Avatar 2.1.0
- WaveSurfer.js 7.10.1
- RecordRTC 5.6.2

**Backend Stack:**
- Express.js (Node.js)
- Supabase (PostgreSQL)
- Gmail API (IMAP/SMTP)
- Google Calendar API
- Dropbox API
- OpenRouter (Claude 3.5 Sonnet)
- OpenAI (Whisper transcription)
- ElevenLabs (Text-to-speech)
- HeyGen API (Avatar)

**Deployment:**
- Frontend: Vercel (auto-deploy from main)
- Backend: Render (auto-deploy from main)
- Database: Supabase (Sweden datacenter)
- Cron: Render Cron Jobs

**Architecture Highlights:**
- 46+ backend API endpoints
- 30 Claude tools with tool executor pattern
- 3-layer conversation memory system
- HeyGen 3D interactive avatar
- Physics-based task management
- Three.js 3D visualizations
- Automated daily sync & cleanup
- Multi-language support (Swedish/English)

---

**Last Updated**: October 31, 2025
**Next Agent**: Read this first, then ask Jonas what to work on! 🚀

---

## 🎯 System Health Status (Oct 31, 2025)

### ✅ Fully Operational:
- Receipt OCR (1,080+ receipts tracked, OpenRouter only)
- Gmail sync (50 emails in smart_memories, last sync 07:03 AM)
- Calendar integration (dual calendars: personal + shared)
- Daily automation (7 AM sync, cleanup, summaries)
- HeyGen avatar (3D streaming working)
- Flow dashboard (3 modes: Magnetic, Flow, Focus)
- Vision Quest (3D space visualization)

### 📊 Key Metrics:
- **Receipts**: 1,080 total (55 in Oct, 334 in Sept, 319 in Aug)
- **API Keys**: 1 OpenRouter key (simplified from 2 providers)
- **Calendars**: 2 (Personal + Lina och Jonas shared)
- **Cost**: ~$0.002 per receipt OCR
- **Uptime**: Backend healthy on Render

### 🔧 Recent Fixes:
- PDF OCR now works with OpenRouter file parser
- Removed Anthropic API dependency
- Added shared calendar support
- Validated all connections (Gmail, Calendar, Dropbox)

**System is production-ready and fully automated!**
