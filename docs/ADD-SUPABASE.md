# Adding Supabase for Memory System

The memory system (memory-store, memory-search) uses Supabase to store conversations and context.

## What you need:

1. **Supabase Project**
   - Go to https://supabase.com
   - Create a project (or use existing)
   - Get your credentials

2. **Add to `.env.local`:**
   ```bash
   # Supabase for memory storage
   SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_KEY=eyJ... (optional, for server-side)

   # API Key for memory endpoints
   NEXT_PUBLIC_API_KEY=your-custom-api-key
   ```

3. **Create the table in Supabase:**
   ```sql
   CREATE TABLE smart_memories (
     id SERIAL PRIMARY KEY,
     type VARCHAR(50),
     data JSONB,
     importance INTEGER DEFAULT 3,
     metadata JSONB,
     is_archived BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

## Current Status:
- The app tries to call memory APIs at `https://quant-fast.vercel.app`
- These return 404 because they're not deployed
- Memory features are OPTIONAL - the chat works without them

## Options:

### Option 1: Deploy the memory API
- Deploy the `/api` folder to Vercel
- Add Supabase credentials there

### Option 2: Disable memory features
- The app works fine without them
- Conversations just won't be saved

### Option 3: Use local memory
- Store in localStorage instead
- No Supabase needed

The assistant works great even without the memory system!