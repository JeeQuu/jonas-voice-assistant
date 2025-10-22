# Quant Show - AI Assistant & FLOW Dashboard

## ⚠️ CRITICAL: READ THIS FIRST

**If you are a new AI context (Claude/GPT/etc), you MUST read these files BEFORE doing anything:**

1. **`/Users/jonasquantmusicab/Dropbox/PC SYNC/CURSOR SHARED/QUANT SHOW/SUPABASE_DATABASE_SCHEMA.md`**
   - THE definitive source of truth for all 19 Supabase tables
   - Contains table schemas, relationships, query examples, and common pitfalls
   - **DO NOT GUESS** how the database works - read this file first!

2. **This file (`agents.md`)**
   - Project structure, deployment info, API endpoints
   - Git workflow, environment variables, troubleshooting

**Why this matters**: Jonas has experienced months of issues with new LLM contexts constantly misunderstanding the Supabase structure. The database has 19 tables across 5 subsystems. ALWAYS refer to the schema doc when working with the database.

---

## ✅ Project Naming (FIXED 2025-10-19)
**Local folder**: `quant-show/` ✅ (renamed from jonas-voice-assistant)
- **Backend**: `quant-show-api` (Render) ✅ **100% OPERATIONAL**
- **Frontend**: `jonas-flow-dashboard` (Vercel) ✅ **100% OPERATIONAL**
- **Dead Project**: `jonas-voice-assistant` (Vercel) ❌ should be deleted

**Everything is now consistently named "quant-show"!**

## 🎉 System Status: FULLY OPERATIONAL (2025-10-20)

**All major issues resolved!** The system is now working exactly as intended:

✅ **Calendar**: Full read/write to BOTH calendars (personal + shared)
✅ **Memory**: Brainolf remembers conversations (4-source search)
✅ **Database**: Clean (1000 ghost sessions deleted)
✅ **Frontend**: Vercel deployment fixed
✅ **Backend**: All API endpoints working

**User Goal Achieved**: *"i just want my assistent to come as close to a real assistant with memory as possible"*

Brainolf now has **persistent memory** across sessions. No more "bathroom amnesia"! 🧠✨

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

### Backend (Render) - Complete Checklist

The system uses **25 different environment variables**. Here's the complete list organized by importance:

#### ✅ CRITICAL (Must Have)

**Database:**
- `SUPABASE_URL` - https://[project].supabase.co
- `SUPABASE_SERVICE_KEY` - eyJhbGc... (⚠️ NO `\n` characters!)

**AI Services:**
- `OPENAI_KEY` - Actually contains OpenRouter API key (confusing naming!)
  - Used for Claude 3.5 Sonnet via openrouter.ai
  - Alternative name in code: `OPENROUTER_API_KEY` (same value)

**Gmail:**
- `GMAIL_USER` - Gmail address (e.g., jonasquant@gmail.com)
- `GMAIL_APP_PASSWORD` - Gmail app-specific password (16 chars)

**Google Calendar:** ✅ FULLY WORKING 2025-10-20
- `SERVICE_ACCOUNT_JSON` - Full JSON credentials for Google Service Account
  - OR use `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` (OAuth)
- `GOOGLE_CALENDAR_ID` - Personal calendar (e.g., jonasquant@gmail.com)
- `GOOGLE_SHARED_CALENDAR_ID` - Shared calendar: `1np85dkiru57r752i9ssseuuic@group.calendar.google.com`
  - ⚠️ IMPORTANT: Service account must be added to shared calendar with "Make changes to events" permission!
  - Service account email: `quant-show-api@skillful-source-456119-b2.iam.gserviceaccount.com`

**Multiple Calendars**:
The system supports TWO calendars with full READ/WRITE access:
1. `GOOGLE_CALENDAR_ID` - Personal calendar (work, projects, Liseberg, etc.)
2. `GOOGLE_SHARED_CALENDAR_ID` - Shared "Lina och Jonas" calendar (family events with Lina)

**Calendar Write Access** (Added 2025-10-20):
All calendar endpoints (POST/PATCH/DELETE) now support a `calendarId` parameter:
- `calendarId: 'personal'` - Creates event in personal calendar (default)
- `calendarId: 'shared'` - Creates event in shared "Lina och Jonas" calendar
- `calendarId: '[explicit-id]'` - Creates event in any calendar by explicit ID

Example usage:
```javascript
// Create event in shared calendar
POST /api/calendar/events
{
  "summary": "Family dinner",
  "start": "2025-10-22T18:00:00",
  "end": "2025-10-22T20:00:00",
  "calendarId": "shared"  // Goes to "Lina och Jonas" calendar
}
```

#### 🔧 IMPORTANT (Feature-Specific)

**ElevenLabs (Text-to-Speech):**
- `ELEVENLABS_API_KEY` - ElevenLabs API key
  - Alternative name: `ELEVEN_LABS_KEY`
- `ELEVENLABS_VOICE_ID` - Voice ID for TTS (optional)

**Dropbox (Receipt Storage):**
- `DROPBOX_ACCESS_TOKEN` - OAuth access token
- `DROPBOX_REFRESH_TOKEN` - OAuth refresh token
- `DROPBOX_APP_KEY` - App key
- `DROPBOX_APP_SECRET` - App secret

#### 📋 OPTIONAL

- `API_KEY` - Auth key for API endpoints (default: `JeeQuuFjong`)
- `PORT` - Server port (Render sets automatically)
- `NODE_ENV` - Environment (Render sets to "production")
- `EMAIL_SENDER_NAME` - Name in sent emails (default: "Jonas Assistant")
- `YOUR_EMAIL` - Used by some cron jobs (usually same as `GMAIL_USER`)

#### 🗑️ DEPRECATED (Ignore These)

- `CLAUDE_KEY` - Old, replaced by `OPENAI_KEY`
- `CALENDAR_ID` - Old, replaced by `GOOGLE_CALENDAR_ID`
- `SUPABASE_ANON_KEY` - Not needed, using `SERVICE_KEY`

### How to Verify Env Vars

**Test via health endpoint:**
```bash
curl https://quant-show-api.onrender.com/api/health -H "x-api-key:JeeQuuFjong"
```

Should return all services as `true`:
```json
{
  "success": true,
  "services": {
    "google_calendar": true,
    "openrouter": true,
    "eleven_labs": true,
    "supabase": true
  }
}
```

If any service shows `false`, check that env var in Render Dashboard.

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

### Layer 3: Cronjob Safety Net (✅ FIXED 2025-10-20)
- **Every 15 minutes** cronjob finds orphaned sessions
- Closes sessions inactive for **>5 minutes** with messages
- **Ghost sessions** (0 messages) are DELETED instead of closed
- Runs even if frontend never closes
- Located in: `api/cron/close-inactive-sessions.js`
- Deployed on Render as cron job (curl-based, no env var issues)

**Session Lifecycle:**
1. `startSession()` creates new session in Supabase
2. Every message updates `messages` array and `message_count`
3. Tool calls (like email send) append to session messages
4. On close: AI generates summary, extracts topics, saves insights
5. Status changes from 'active' to 'completed'
6. **Ghost sessions** (0 messages, created by page loads/health checks) are auto-deleted

## Memory System & Conversation Recall (✅ FIXED 2025-10-20)

Brainolf can now remember past conversations through hierarchical memory:

### Memory Search (`/api/memory-search`)
Searches **4 sources** for complete memory:

1. **`smart_memories`** - Emails, calendar events, insights (unlimited)
2. **`conversation_sessions`** - Last 30 days of conversations (50 most recent)
3. **`daily_summaries`** - Last 90 days of daily summaries
4. **`weekly_summaries`** - Last year of weekly summaries

**Previous Issue**: Only searched `smart_memories`, so Brainolf couldn't remember conversations.
**Fixed**: 2025-10-20 - Now searches all 4 sources with relevance scoring.

### Automated Memory Cleanup (3 Cronjobs)

**1. close-inactive-sessions** (Every 15 minutes)
- Closes orphaned sessions
- Deletes ghost sessions (0 messages)
- Command: `curl -X POST .../api/cron/close-sessions`

**2. daily-memory-cleanup** (Every night 23:00 Stockholm time)
- Creates daily summary from completed sessions
- Extracts key insights and decisions
- Archives sessions older than 7 days
- Command: `curl -X POST .../api/cron/daily-cleanup`

**3. weekly-memory-cleanup** (Sundays 23:30 Stockholm time)
- Creates weekly summary from daily summaries
- Compresses memory for long-term storage
- Command: `curl -X POST .../api/cron/weekly-cleanup`

All cronjobs use curl-based approach (no env var sync issues with Render).

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

## ✅ Recent Fixes (2025-10-21)

### HeyGen Interactive Avatar Integration (2025-10-21)
**Problem**: User wanted face-to-face voice conversations with Brainolf instead of just typing
**User Feedback**: "it would be so nice if i had an avatar i could discuss everything with"
**Solution**: Integrated HeyGen Streaming Avatar SDK with Katya avatar
**Implementation**:
- Created `/app/chat/components/HeyGenAvatar.tsx` component
- Added `/app/api/heygen/token/route.ts` for secure token generation
- Installed `@heygen/streaming-avatar` NPM package
- Connected avatar to existing Brainolf backend
**Features**:
- Real-time video streaming (WebRTC)
- Voice input: Speak → Katya transcribes → Brainolf responds
- Voice output: Brainolf's text responses spoken by Katya
- Full access to memory/calendar/emails during voice conversations
- Session management (start/stop avatar)
**Configuration**:
- Avatar ID: `Katya_ProfessionalLook2_public`
- Quality: Low (for testing, can be upgraded to High)
- Knowledge Base: Disabled (uses Brainolf instead of HeyGen's default)
**How It Works**:
1. User clicks "Starta Avatar" → Fetches session token
2. Initializes HeyGen SDK with token
3. Starts avatar session with voice chat enabled
4. User speaks → HeyGen STT transcribes
5. Transcript sent to Brainolf → Full context response
6. Katya speaks Brainolf's response
**Files Changed**:
- `app/chat/components/HeyGenAvatar.tsx` - Avatar component
- `app/chat/page.tsx` - Integrated avatar into chat UI
- `app/api/heygen/token/route.ts` - Token endpoint
- `.env.local` - Added HEYGEN_API_KEY and HEYGEN_AVATAR_ID
**Commits**:
- `5c276d1` - Initial HeyGen integration
- `365412d` - Authentication fix (session token)
- `7ce1d50` - Error logging improvements
- `03bd5dc` - Connected to Brainolf with voice input
**Status**: ✅ Working (voice loop operational)
**Note**: Katya may need knowledge base override to prevent HeyGen default responses

### Email Sync Cronjob Fixes (2025-10-21)
**Problem**: `email-sync-frequent` and `email_sync_evening` cronjobs failing with timeouts
**Root Cause**: Cronjobs called `/api/trigger-sync` which runs FULL daily-sync (Gmail + Calendar + Receipt extraction + Cleanup + Summary). Receipt extraction has 180s timeout, but cronjobs only waited 60s.
**Solution**: Changed to call `/api/sync-gmail-to-memory` instead
- Only syncs Gmail → smart_memories (no receipts, no cleanup)
- Faster and more appropriate for frequent syncs
- Increased timeout to 120s
- Added `daysBack: 7` parameter
**Files Changed**: `cron/email-sync-frequent.js`
**Commit**: `1ad13f0 fix: Email sync cronjobs now use sync-gmail-to-memory`
**Test**: Manually tested - successfully synced 183 emails
**Status**: ✅ FIXED - Cronjobs now complete successfully

### Receipt Extraction Automation (2025-10-21)
**Problem**: Receipts stopped being extracted automatically after Oct 8, despite receipt emails arriving
**User Feedback**: "theres been emails with receipts after 10th... hmmmm can we do a check from here to investigate that?"
**Root Cause**: Cronjobs only called `/api/trigger-sync` (Gmail → smart_memories), NOT `/api/extract-receipts` (Gmail → receipts table)
**Solution**:
- Added Step 2.5 to `api/cron/daily-sync.js` for automatic receipt extraction
- Runs every morning at 07:00 UTC after calendar sync
- Extracts from last 14 days with 180s timeout (OCR can be slow)
- Manual test: Successfully extracted 171 receipts (now up to Oct 21)
**Files Changed**: `api/cron/daily-sync.js:88-115`
**Commit**: `83b90ae feat: Add automatic receipt extraction to daily sync`
**Status**: ✅ DEPLOYED to Render

### Daily Summary Email Statistics (2025-10-21)
**Problem**: Daily summary email always showed zeros for email counts (synced: 0, deleted: 0, receipts: 0)
**User Feedback**: "shows that same 'nya mail synkade etc and its always the same numbers and doesnt summarize any emails'"
**Root Cause**: `daily-sync.js` only passed `cleanupResult` to summary, which doesn't include Gmail sync counts
**Solution**:
- Built `completeSummary` object aggregating results from ALL sync steps
- Extracts `synced` count from gmail_sync step
- Extracts `receiptsExtracted` from receipt_extraction step
- Passes complete data to `sendDailySummary(completeSummary)`
**Files Changed**: `api/cron/daily-sync.js:150-160`
**Commit**: `28de686 fix: Daily summary now shows actual email sync stats`
**Test**: Triggered test email - received successfully with all sections working
**Status**: ✅ DEPLOYED to Render

## ✅ Previous Fixes (2025-10-20)

### Calendar Write Access Added (2025-10-20)
**Problem**: System could only READ from shared calendar, not CREATE/UPDATE/DELETE events
**User Feedback**: "why not make changes?? i want to be able to add too"
**Solution**:
- Updated POST/PATCH/DELETE calendar endpoints to accept `calendarId` parameter
- Supports 'personal', 'shared', or explicit calendar ID
- Added service account to shared calendar with "Make changes to events" permission
**Files Changed**: `api/server.js:330-450` (calendar endpoints)
**Status**: ✅ DEPLOYED to Render

### Memory System Fixed - Conversation Recall (2025-10-20)
**Problem**: Brainolf couldn't remember past conversations, only emails/calendar
**User Feedback**: "imagine a human assistant that forgets what you talked about after he/she came back from the bathroom"
**Root Cause**: `/api/memory-search` only searched `smart_memories` table
**Solution**:
- Updated `memory-search-fixed.js` to search 4 sources:
  1. smart_memories (emails, calendar, insights)
  2. conversation_sessions (last 30 days)
  3. daily_summaries (last 90 days)
  4. weekly_summaries (last year)
- Added relevance scoring across all sources
**Files Changed**: `api/memory-search-fixed.js`
**Status**: ✅ DEPLOYED to Render

### Ghost Session Cleanup (2025-10-20)
**Problem**: 1000 empty sessions (0 messages) being "closed" every 15 minutes, wasting API credits
**User Feedback**: "those 1000 sessions keep haunting me"
**Root Cause**: Cronjob tried to summarize sessions with 0 messages
**Solution**:
- Updated `close-inactive-sessions.js` to filter by `message_count > 0`
- Ghost sessions (0 messages) now get DELETED instead of closed
- Prevents wasting OpenRouter credits on empty summaries
**Files Changed**: `api/cron/close-inactive-sessions.js`
**Status**: ✅ DEPLOYED to Render

---

## ✅ Previous Fixes (2025-10-19)

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

**System Status** (2025-10-20 19:00 UTC) - 🎉 **FULLY OPERATIONAL**:
- ✅ All systems operational (backend + frontend)
- ✅ OpenRouter: Credits available (no longer wasted on ghost sessions)
- ✅ Supabase: Connected and working perfectly
- ✅ Chat: Fully functional with persistent memory
- ✅ Calendar: Full READ + WRITE access to BOTH calendars
  - Personal calendar: `jonasquant@gmail.com`
  - Shared calendar: `1np85dkiru57r752i9ssseuuic@group.calendar.google.com` (Lina och Jonas)
- ✅ Memory: **4-source search** - Brainolf remembers everything!
  - Conversation sessions (last 30 days)
  - Daily summaries (last 90 days)
  - Weekly summaries (last year)
  - Smart memories (emails, calendar, insights - unlimited)
- ✅ Ghost Sessions: Deleted (1000 sessions removed, auto-cleanup working)
- ✅ Vercel Frontend: Fixed (SUPABASE_SERVICE_KEY applied to all environments)
- ✅ Cron job: Deployed (15 min / 5 min timeout)
- ✅ Naming: Fixed!

**What's Working**:
- ✅ **Backend API** (Render): All endpoints operational
  - Health check: All services green
  - Calendar CRUD: Create/Read/Update/Delete in both calendars
  - Memory search: 4 sources with AI query expansion
  - Session management: 3-layer cleanup system
  - Ghost session deletion: Automatic cleanup
- ✅ **Frontend** (Vercel): All features operational
  - Session start: Full context loading (economy, projects, insights, conversations)
  - Supabase connection: No more "Invalid API key" errors
  - Chat interface: Working with persistent sessions
  - Context layers: 6 layers of memory loaded on each session
- ✅ **FLOW Dashboard**: All 4 modes working
  - Magnetic Field (physics-based todos)
  - Flow Mode (geometric puzzle)
  - Focus Mode (zen interface)
  - TODO DESTROYER (arcade shooter)
- ✅ **Database**: Clean and optimized
  - No ghost sessions
  - Proper session cleanup
  - Conversation history preserved
- ✅ **Memory System**: Complete and working
  - Past conversations recalled
  - Email memory (sent + received)
  - Calendar event memory
  - Daily/weekly summaries
  - Recent insights (last 7 days)

---

**Last Updated**: 2025-10-21 23:00 UTC
**Major Changes**:
- HeyGen Interactive Avatar integration (Katya)
- Voice conversations with Brainolf
- Email sync cronjob fixes
- Receipt extraction automation
- Daily summary email statistics fix

**Previous Updates**: Calendar write access, 4-source conversation memory, ghost session cleanup, Vercel frontend fix
**Status**: 🎉 **FULLY OPERATIONAL** - All systems working perfectly!
**Maintained By**: Jonas + Claude Code

---

## 📅 Latest Updates - 2025-10-22

### HeyGen Avatar Integration (Katya)
- ✅ **Video Avatar**: Katya speaks all Brainolf responses with TTS
- ✅ **TaskType.REPEAT**: No HeyGen AI - only Brainolf's responses
- ✅ **Voice Chat**: DISABLED on HeyGen side (we use our own STT)
- ✅ **Integration**: `/chat` page with video + text-to-speech

**Files changed**:
- `app/chat/components/HeyGenAvatar.tsx` - Main avatar component
- `app/api/heygen/token/route.ts` - Session token endpoint
- `app/chat/page.tsx` - Integrated avatar into chat UI

**How it works**:
1. User types or speaks (via mic button)
2. Brainolf processes with all 32 tools
3. Katya speaks Brainolf's response (video + TTS)
4. No HeyGen AI interference - pure Brainolf

### Voice Input with Whisper
- ✅ **Microphone button**: Click to record, release to transcribe
- ✅ **OpenAI Whisper**: Swedish language STT
- ✅ **Integration**: Works with or without HeyGen avatar

**Files changed**:
- `app/api/voice-simple/route.ts` - Whisper transcription endpoint
- `app/chat/page.tsx` - Mic button implementation

**How to test**:
1. Go to /chat
2. Click microphone button 🎤
3. Speak in Swedish
4. Release button → Whisper transcribes → Brainolf responds

### Contacts System (32 Tools → 34 Tools)
- ✅ **get_contacts**: Look up email addresses, roles, phone numbers
- ✅ **create_contact**: Save new contacts with role categorization
- ✅ **Proactive saving**: Brainolf suggests saving when you mention new people
- ✅ **Auto-lookup**: Searches Gmail for email addresses if needed

**Current contacts**:
- Joel Borg (joel@borglundell.se) - manager
- Karl Nissfeldt (karl@eker.se) - ekonomi

**Files changed**:
- `lib/tools-config.ts` - Added 2 new contact tools
- `lib/tool-executor.ts` - Contact tool execution
- `app/api/chat/route.ts` - Proactive contact saving rules

**How it works**:
```
User: "Jag fick mail från Emma Andersson"
→ Brainolf: search_gmail för Emma
→ Hittar: emma@startup.se
→ "Vill du spara Emma som kontakt? Vilken roll har hon?"
User: "Ja, klient"
→ Brainolf: create_contact → Sparad!
```

### Mail Safety Rules (Critical!)
- ⚠️ **NEVER send without approval**: Must show draft + ask first
- ⚠️ **NEVER guess emails**: Use get_contacts or ask user
- ⚠️ **Must confirm**: Only send when user says "skicka" / "send"

**Updated system prompt** with:
1. Explicit "help me write" vs "send this" distinction
2. Always use get_contacts to look up addresses
3. Show (a) To, (b) Subject, (c) Full text, (d) Ask permission
4. Example workflow in prompt

---

## 📖 User Manual

**NEW**: Complete user manual created at `USER_MANUAL.md`

**What it contains**:
- ✅ Snabbstart & URL
- ✅ Snabbkommandon för alla features
- ✅ 8-step testplan (verifiera att allt fungerar)
- ✅ Felsökningsguide
- ✅ Alla 34 tools förklarade
- ✅ HeyGen Avatar guide
- ✅ Säkerhetsregler
- ✅ Dataflöden (morning routine, chat, session end)
- ✅ Best practices
- ✅ Changelog med alla fixes

**How to use**:
- Jonas: Read USER_MANUAL.md for feature overview & troubleshooting
- New AI: Read agents.md (this file) + SUPABASE_DATABASE_SCHEMA.md first

---

## 🔧 Recent Fixes Summary

### 2025-10-22 (This Session)
1. **HeyGen Avatar** - Katya now speaks Brainolf's responses
2. **Voice Input** - Whisper STT via microphone button
3. **Contacts** - get_contacts + create_contact tools
4. **Proactive Contacts** - Auto-suggest saving new people
5. **Mail Safety** - Critical rules to prevent accidental sends
6. **Karl's Email** - Updated to karl@eker.se (was wrong placeholder)
7. **User Manual** - Complete guide for Jonas

### 2025-10-21 (Previous Session)
1. **Receipt Extraction** - Auto-extract in daily sync (14 days lookback)
2. **Daily Summary Email** - Fixed to show real stats (was showing zeros)
3. **Email Sync Cronjobs** - Fixed timeouts + endpoint issues

### 2025-10-20 (Previous Session)
1. **Calendar Write Access** - Both calendars (personal + shared)
2. **4-Source Memory** - Conversation memory across sessions
3. **Ghost Session Cleanup** - 1000 sessions deleted
4. **Vercel Frontend** - Deployment fixed

---

## 🎯 Current System Capabilities

**Total Tools**: 34 (was 30, added contacts x2)

**What Brainolf Can Do** (test with USER_MANUAL.md):
- ✅ Remember conversations (persistent memory)
- ✅ Manage calendar (read + write, both calendars)
- ✅ Search & send email (with safety checks)
- ✅ Save & lookup contacts (auto-suggest when mentioning people)
- ✅ Handle todos (create, update, delete)
- ✅ Extract & analyze receipts (OCR + AI)
- ✅ Track subscriptions (monthly costs)
- ✅ Work with Dropbox files
- ✅ Speak responses via HeyGen Avatar (Katya)
- ✅ Listen via voice input (Whisper STT)
- ✅ Provide daily context briefings
- ✅ Track health (mood, energy, stress)

**What's New Today**:
- 🆕 Visual avatar (Katya) with TTS
- 🆕 Voice input (microphone button)
- 🆕 Contact management (save & lookup)
- 🆕 Proactive contact saving suggestions

---

## 🚀 Testing Checklist

**After deployment, verify these work**:

1. **Calendar**:
   - [ ] "Vad har jag för möten idag?" → Shows events
   - [ ] "Boka testmöte imorgon kl 10" → Creates event

2. **Mail**:
   - [ ] "Sök mail från Joel" → Shows emails
   - [ ] "Hjälp mig formulera mail till Joel" → Shows draft, asks permission

3. **Contacts**:
   - [ ] "Vem är min manager?" → Joel Borg (joel@borglundell.se)
   - [ ] "Spara testperson, test@example.com som other" → Saved

4. **Memory**:
   - [ ] "Kom ihåg att jag gillar pizza" → wait 10s → "Vad gillar jag?" → pizza

5. **HeyGen Avatar**:
   - [ ] Start Katya → Type question → Katya speaks answer
   - [ ] No HeyGen comments, only Brainolf responses

6. **Voice Input**:
   - [ ] Click mic → Speak → Release → Transcribed → Brainolf responds

7. **Proactive Contacts**:
   - [ ] "Jag fick mail från Emma" → Suggests saving Emma

8. **Mail Safety**:
   - [ ] "Hjälp mig formulera mail" → Shows draft, does NOT send automatically

---

