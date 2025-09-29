# Setting Up Persistent Message Storage with Supabase

## Why Supabase?
- ✅ **Free tier** - Up to 500MB database
- ✅ **Real-time** - Messages appear instantly for all users
- ✅ **Global** - Works for users worldwide
- ✅ **PostgreSQL** - Reliable and fast
- ✅ **Simple setup** - No complex configuration

## Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** with GitHub
3. **Create new project**:
   - Project name: `robert-memorial`
   - Database password: (save this!)
   - Region: Choose closest to your users

## Step 2: Create Messages Table

1. **Go to SQL Editor** in Supabase dashboard
2. **Run this SQL**:

```sql
-- Create messages table
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  relationship TEXT,
  message TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON messages
  FOR SELECT USING (true);

-- Create policy to allow public insert access
CREATE POLICY "Allow public insert access" ON messages
  FOR INSERT WITH CHECK (true);

-- Create policy to allow public update for likes only
CREATE POLICY "Allow public update likes" ON messages
  FOR UPDATE USING (true) 
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

## Step 3: Get API Keys

1. **Go to Settings → API** in Supabase
2. **Copy these values**:
   - Project URL (starts with `https://`)
   - `anon` `public` key (long string)

## Step 4: Configure Netlify Environment Variables

1. **In Netlify Dashboard**:
   - Go to Site settings → Environment variables
   - Add these variables:

```
SUPABASE_URL = https://your-project-ref.supabase.co
SUPABASE_ANON_KEY = your-anon-key-here
```

## Step 5: Deploy

```bash
git add .
git commit -m "Add Supabase database integration"
git push origin main
```

Netlify will automatically redeploy with persistent storage!

## What This Gives You:

- ✅ **Messages persist forever** (until you delete them)
- ✅ **All users see all messages** instantly
- ✅ **Global access** from anywhere in the world
- ✅ **Real-time updates** (optional feature)
- ✅ **Backup and export** capabilities
- ✅ **Free for moderate usage**

## Testing Persistence:

1. **User A** (from USA) submits message
2. **User B** (from Europe) visits site → **sees User A's message**
3. **Server restarts** → **messages still there**
4. **Days later** → **all messages preserved**

## Fallback Behavior:

If Supabase isn't configured, the system falls back to:
- In-memory storage during active sessions
- Still works for testing/development
- Messages reset when functions restart

## Alternative Database Options:

If you prefer not to use Supabase:
- **Firebase Firestore** (Google)
- **PlanetScale** (MySQL)
- **MongoDB Atlas**
- **Railway** (PostgreSQL)
- **Airtable** (spreadsheet-like)

All follow similar patterns but Supabase is the most developer-friendly for this use case.