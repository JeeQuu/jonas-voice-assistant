# Quant Show - AI Assistant & FLOW Dashboard

## ✅ Project Naming (FIXED 2025-10-19)
**Local folder**: `quant-show/` ✅ (renamed from jonas-voice-assistant)
- **Backend**: `quant-show-api` (Render) ✅
- **Frontend**: `jonas-flow-dashboard` (Vercel) ✅
- **Dead Project**: `jonas-voice-assistant` (Vercel) ❌ should be deleted

**Everything is now consistently named "quant-show"!**

## Project Overview

This is Jonas's personal AI assistant system with two main components:
1. **Backend API** - `quant-show-api` deployed on Render.com
2. **Frontend** - `jonas-flow-dashboard` deployed on Vercel

The system provides:
- AI chat assistant with persistent memory (Brainolf 2.0)
- Email integration (Gmail send/search)
- Calendar integration (Google Calendar)
- Health tracking (Apple Health via shortcuts)
- Subscription detection and vendor spending analysis
- Receipt OCR with AI validation
- FLOW Dashboard - Multiple interactive todo visualizations

## Architecture

```
quant-show/                       # Local folder (renamed 2025-10-19)
├── api/                          # Backend (deployed to Render)
│   ├── server.js                 # Main Express server
│   ├── gmail-send.js             # Email sending with session logging
│   ├── gmail-direct-search.js    # Search both INBOX and SENT folders
│   ├── daily-context.js          # Daily AI summary generation
│   ├── user-context.js           # Multi-layer context system
│   ├── user-health.js            # Apple Health data endpoints
│   ├── receipt-vendor-spending.js # Vendor spending analysis
│   ├── cron/                     # Cronjobs
│   │   └── close-inactive-sessions.js  # 3-layer session cleanup
│   └── render.yaml               # Render deployment config
│
├── app/                          # Frontend (Next.js App Router)
│   ├── chat/                     # Brainolf 2.0 chat interface
│   │   └── page.tsx              # Main chat UI with 3-layer session mgmt
│   └── flow/                     # FLOW Dashboard
│       ├── page.tsx              # Main dashboard with mode switching
│       ├── components/
│       │   ├── MagneticField.tsx # Physics-based todo canvas
│       │   ├── MagneticCard.tsx  # Isometric 3D todo cards
│       │   ├── FlowMode.tsx      # Geometric puzzle mode
│       │   ├── FocusMode.tsx     # Zen focus mode
│       │   └── ShootEmUpMode.tsx # TODO DESTROYER arcade game
│       ├── hooks/
│       │   ├── useTasks.ts       # Fetch todos/calendar from API
│       │   └── usePhysics.ts     # Custom physics simulation
│       └── utils/
│           └── categoryStyles.ts # Category detection logic
│
└── public/sounds/                # Audio files
    └── zen-meditation.mp3        # Background music for FLOW
```

## Deployment

### Backend (Render) - quant-show-api
- **Project Name**: `quant-show-api` ⚠️ NOT jonas-voice-assistant!
- **URL**: `https://quant-show-api.onrender.com`
- **API Key**: `JeeQuuFjong` (header: `x-api-key`)
- **Deployment**: Auto-deploy from GitHub `main` branch
- **Cronjobs**: Configured in `render.yaml`
  - `close-inactive-sessions`: **Every 15 minutes** (5 min inactivity timeout)
  - `daily-context`: Daily AI summaries
  - Other health/subscription checks

### Frontend (Vercel) - jonas-flow-dashboard
- **Project Name**: `jonas-flow-dashboard` ⚠️ NOT jonas-voice-assistant!
- **Production URL**: `https://jonas-flow-dashboard.vercel.app`
- **Deployment**: Auto-deploy from GitHub `main` branch
- **Dead Project**: `jonas-voice-assistant` (Vercel) - **DELETE THIS**, has zero env vars

## Environment Variables

### Backend (Render)
```
SUPABASE_URL=https://[project].supabase.co
SUPABASE_SERVICE_KEY=[key without \n characters!]
OPENAI_KEY=[OpenAI API key]
OPENROUTER_API_KEY=[OpenRouter for Claude 3.5 Sonnet]
GMAIL_USER=[Gmail address]
GMAIL_APP_PASSWORD=[Gmail app password]
GOOGLE_CLIENT_ID=[OAuth client ID]
GOOGLE_CLIENT_SECRET=[OAuth client secret]
GOOGLE_REFRESH_TOKEN=[OAuth refresh token]
GOOGLE_CALENDAR_ID=[Personal calendar, e.g., jonasquant@gmail.com]
GOOGLE_SHARED_CALENDAR_ID=1np85dkiru57r752i9ssseuuic@group.calendar.google.com
```

**Multiple Calendars**:
The system fetches from TWO calendars simultaneously:
1. `GOOGLE_CALENDAR_ID` - Personal calendar (work, projects, Liseberg, etc.)
2. `GOOGLE_SHARED_CALENDAR_ID` - Shared "Lina och Jonas" calendar (family events with Lina)

### Frontend (Vercel - jonas-flow-dashboard)
```
NEXT_PUBLIC_API_URL=https://quant-show-api.onrender.com
NEXT_PUBLIC_API_KEY=JeeQuuFjong
SUPABASE_URL=https://[project].supabase.co
SUPABASE_SERVICE_KEY=[key without \n characters!]
```

**CRITICAL WARNINGS**:
- ⚠️ NEVER include `\n` characters in `SUPABASE_SERVICE_KEY`
- ⚠️ Set env vars in Vercel DASHBOARD, NOT via CLI (CLI links to wrong project)
- ⚠️ jonas-flow-dashboard is the ACTIVE project
- ⚠️ jonas-voice-assistant Vercel project should be DELETED
- ⚠️ Local folder name `jonas-voice-assistant/` does NOT match project names

## Database (Supabase)

### Tables

**conversation_sessions**
- `id`: UUID
- `messages`: JSONB array of chat messages
- `summary`: AI-generated summary (on session close)
- `topics`: Text array of discussed topics
- `importance`: 1-5 rating
- `status`: 'active' | 'completed'
- `created_at`, `updated_at`, `ended_at`

**smart_memories**
- Long-term memory storage
- Email sends logged here for cross-session recall
- AI insights and important facts

**user_context**
- Multi-layer context system (recent, weekly, permanent)
- AI-generated insights about Jonas's life

**receipts**
- OCR results with AI validation
- Currency detection (SEK/EUR/USD)
- Vendor categorization

**subscriptions**
- Detected subscriptions from receipts
- Monthly cost tracking

## Session Management (3-Layer System)

The chat client uses a sophisticated 3-layer session closing system to ensure conversation context is never lost:

### Layer 1: Browser Unload
- `beforeunload` event with `navigator.sendBeacon`
- Guarantees delivery even if window closes abruptly
- Located in: `app/chat/page.tsx`

### Layer 2: Inactivity Timer
- 30-minute timeout after last message
- Resets on every user interaction
- Gracefully closes session with AI summary
- Located in: `app/chat/page.tsx`

### Layer 3: Cronjob Safety Net
- **Every 15 minutes** cronjob finds orphaned sessions
- Closes sessions inactive for **>5 minutes**
- Runs even if frontend never closes
- Located in: `api/cron/close-inactive-sessions.js`
- Deployed on Render as cron job (✅ ACTIVE as of 2025-10-19)

**Session Lifecycle:**
1. `startSession()` creates new session in Supabase
2. Every message updates `messages` array and `message_count`
3. Tool calls (like email send) append to session messages
4. On close: AI generates summary, extracts topics, saves insights
5. Status changes from 'active' to 'completed'

## Email Memory

Gmail integration searches BOTH folders for complete memory:
- **INBOX**: Received emails
- **[Gmail]/Sent Mail**: Sent emails

When sending email via chat:
1. Email sent via Gmail API
2. Logged to current session's messages (if sessionId provided)
3. Also saved to `smart_memories` for long-term recall
4. Future sessions can find sent emails via gmail-direct-search

Located in: `api/gmail-send.js`, `api/gmail-direct-search.js`

## FLOW Dashboard Modes

The dashboard has 4 interactive modes (double-tap to cycle):

### 1. Magnetic Field
- Physics-based todo visualization
- Drag cards around with momentum
- Magnetic repulsion between cards
- Swipe gestures for global forces
- Isometric 3D cards with category colors
- **Files**: `MagneticField.tsx`, `MagneticCard.tsx`, `usePhysics.ts`
- **Physics**: Custom `requestAnimationFrame` loop with velocity/friction/repulsion

### 2. Flow Mode
- Geometric puzzle interface
- Minimalist design
- **File**: `FlowMode.tsx`

### 3. Focus Mode
- Zen focus interface
- Calm, distraction-free
- **File**: `FocusMode.tsx`

### 4. TODO DESTROYER (Shooter)
- Classic arcade shoot-em-up game
- Destroy todos = complete tasks
- **Controls**: Mouse, Touch (mobile), Keyboard (arrows/WASD, space/enter)
- **Features**:
  - Boss battles every 10 kills (10 HP, health bar)
  - Todo title explosions (animated with checkmark)
  - Combo system (3-second timer, +5 points per combo)
  - Encouragement texts ("NICE!", "CRUSHING IT!", "GODLIKE!")
  - 80 particles for boss kills, 40 for normal
  - Screen shake on hits
  - Web Audio API sound effects
  - Rapid fire powerup after boss kills
- **File**: `ShootEmUpMode.tsx` (602 lines, latest: v3.0)

## Task Categories

Auto-detected from todo/calendar content:

- **jobb** (Terracotta #D97757): Work-related tasks
- **familj** (Dusty blue #5B9AAA): Family, kids, personal
- **hälsa** (Sage green #7BA05B): Health, exercise, wellness

Detection logic in: `app/flow/utils/categoryStyles.ts`

## AI Models Used

- **Chat Assistant**: Claude 3.5 Sonnet via OpenRouter
- **Session Summaries**: Claude 3.5 Sonnet via OpenRouter
- **Receipt OCR**: GPT-4 Vision via OpenAI
- **Context Insights**: GPT-4 via OpenAI

## Key Technical Patterns

### Frontend
- **Framer Motion**: All animations and physics
- **React Hooks**: Custom hooks for tasks, physics
- **TypeScript**: Strict typing throughout
- **App Router**: Next.js 14 app directory
- **Fetch API**: Direct API calls to backend

### Backend
- **Express**: REST API framework
- **Supabase Client**: PostgreSQL access
- **IMAP**: Gmail inbox search
- **Gmail API**: Email sending
- **Google Calendar API**: Event fetching
- **Cron**: Scheduled jobs via render.yaml

### Physics Simulation
- `requestAnimationFrame` loop (60 FPS target)
- Velocity-based movement with friction
- Magnetic repulsion forces (1/distance falloff)
- Boundary collision with soft bounce
- PanInfo from Framer Motion for drag gestures

### Game Development (TODO DESTROYER)
- Web Audio API for procedural sound
- Collision detection (distance-based)
- Particle systems (radial explosions)
- Health/scoring/combo mechanics
- Multi-input support (mouse/touch/keyboard)

## ✅ Recent Fixes (2025-10-19)

### Calendar Connection Fixed (22:15)
**Problem**: Calendar worked via direct API call but not from chat interface
**Root Cause**: Parameter mismatch between frontend and backend
- **Frontend sent**: `timeMin`, `timeMax`, `maxResults`
- **Backend expected**: `days`

**Solution**: Updated `api/server.js:258-301` to accept both parameter formats
**Files Changed**: `api/server.js` (calendar endpoint)
**Status**: ✅ DEPLOYED to Render

### OpenRouter Credits
**Status**: ✅ RESOLVED ($7.36 available)

### Supabase Connection
**Status**: ✅ WORKING (sessions creating properly)

### Project Naming
**Status**: ✅ FIXED (folder renamed to `quant-show/`)

---

## Common Issues & Solutions

### Session Restart Loop
**Problem**: `useEffect` with `[sessionId, messages]` causes infinite loop
**Solution**: Split into two effects - one with `[]` for init, one for cleanup only

### Environment Variable Newlines
**Problem**: `SUPABASE_SERVICE_KEY` has `\n` causing "invalid header value"
**Solution**: Fix in Vercel DASHBOARD (CLI links to wrong project!), add without newlines

### CORS PATCH Method
**Problem**: "Method PATCH not allowed" in browser
**Solution**: Add `PATCH` to `Access-Control-Allow-Methods` in `api/server.js:11`

### Cards Not Draggable Without Opening
**Problem**: Tap event fires on drag end
**Solution**: Use `isDraggingRef` to differentiate drag from tap in `MagneticCard.tsx`

### Wrong Vercel Project Linked
**Problem**: `vercel link` defaults to `jonas-voice-assistant` (dead project with zero env vars)
**Solution**: ALWAYS set env vars via Vercel dashboard for `jonas-flow-dashboard`, NOT via CLI

### Tasks Not Loading
**Problem**: API returns empty array
**Solution**: Fallback to `getMockTasks()` in `useTasks.ts:71-74`

### Calendar Not Working From Chat
**Problem**: Calendar tool returns empty or errors when called from chat, but direct API call works
**Root Cause**: Frontend sends `timeMin`/`timeMax`/`maxResults`, backend only accepts `days`
**Solution**: Update `api/server.js` calendar endpoint to support both parameter formats (fixed 2025-10-19)

## Coding Preferences

- **Language**: Swedish for user-facing text, English for code/comments
- **Style**: Minimalist, clean, geometric designs
- **Colors**: Muted, professional (not neon/cheap)
- **Animations**: Smooth, purposeful (Framer Motion)
- **Sound**: Subtle, not annoying
- **Mobile**: Always consider touch/mobile UX
- **Performance**: Optimize for 60 FPS
- **Git**: Descriptive commits with Claude Code footer

## Development Workflow

1. Make changes locally
2. Test with local backend or production API
3. Commit with descriptive message + Claude Code footer
4. Push to `main` branch
5. Auto-deploys to Vercel (frontend) and Render (backend)
6. Monitor Vercel logs for errors: `vercel logs --follow`
7. Check Render logs in dashboard for backend issues

## Future Improvements

- ✅ ~~Rename local folder~~ - **DONE** (now `quant-show/`)
- ✅ ~~Fix Supabase key~~ - **WORKING**
- ✅ ~~Add OpenRouter credits~~ - **WORKING** ($7.36)
- **TODO**: Delete dead `jonas-voice-assistant` Vercel project
- More game modes in TODO DESTROYER (endless mode, leaderboards)
- Better mobile UX for Magnetic Field (current physics tuned for desktop)
- Voice input for chat assistant
- More health integrations beyond Apple Health

---

## Quick Reference for New AI Contexts

**ALWAYS REMEMBER**:
1. Local folder = `quant-show/` ✅ (renamed 2025-10-19)
2. Backend = `quant-show-api` on Render ✅
3. Frontend = `jonas-flow-dashboard` on Vercel ✅
4. NEVER use Vercel CLI for env vars (links to wrong project)
5. Always set env vars via Vercel dashboard

**System Status** (2025-10-19 22:15):
- ✅ All systems operational
- ✅ OpenRouter: $7.36 credits
- ✅ Supabase: Working
- ✅ Chat: Fully functional
- ✅ Calendar: Fixed (timeMin/timeMax params)
- ✅ Cron job: Deployed (15 min / 5 min timeout)
- ✅ Naming: Fixed!

**What's Working**:
- ✅ Backend API on Render
- ✅ Cron job (15 min, 5 min timeout)
- ✅ FLOW Dashboard (all 4 modes)
- ✅ Database structure
- ✅ Calendar connection (chat + API)

---

**Last Updated**: 2025-10-19 19:45
**Maintained By**: Jonas + Claude Code
