# Vercel Environment Variables Setup

## 🚨 CRITICAL: Missing API Keys in Production

Your Vercel deployment is failing because the API keys are not configured in Vercel's environment variables. GitHub `.env` files are **NOT** automatically used by Vercel for security reasons.

## ⚡ Quick Fix Steps

### 1. Go to Vercel Dashboard
1. Open [vercel.com](https://vercel.com)
2. Go to your project: `All-in-one-Ai-platform`
3. Click **Settings** tab
4. Click **Environment Variables** in the sidebar

### 2. Add Required API Keys

Add these environment variables in Vercel:

```bash
# Together AI (Primary LLM Provider)
TOGETHER_API_KEY=your_together_ai_key_here

# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=https://ttnkomdxbkmfmkaycjao.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bmtvbWR4YmttZm1rYXljamFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTcwMTgsImV4cCI6MjA2ODczMzAxOH0.ZpedifMgWW0XZzqq-CCkdHeiQb2HnzLZ8wXN03cjh7g
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bmtvbWR4YmttZm1rYXljamFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE1NzAxOCwiZXhwIjoyMDY4NzMzMDE4fQ.UOE8fFmFYqnCHKiA-MlfHEfxDxViasspD64trjmsMLI

# AI/ML API (Video & Image Generation)
AIML_API_KEY=your_aiml_api_key_here

# HeyGen (Talking Videos)
HEYGEN_API_KEY=ZmM3NGJmNTlkZmFkNDgwZWFjYjdmZDY3NTcyOTZmZWYtMTcyODk3MjEwNA==

# ElevenLabs (Text-to-Speech)
ELEVENLABS_API_KEY=your_elevenlabs_key_here

# OpenAI (Fallback)
OPENAI_API_KEY=your_openai_key_here
```

### 3. Set Environment Scope
- For each variable, select: **Production**, **Preview**, and **Development**
- This ensures the keys work in all environments

### 4. Redeploy
After adding the environment variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Wait for build to complete

## 🔑 Getting API Keys

### Together AI (REQUIRED)
1. Go to [api.together.ai](https://api.together.ai)
2. Sign up/Login
3. Go to API Keys section
4. Create new API key
5. Copy the key and add to Vercel env vars

### AI/ML API (Optional)
1. Go to [aimlapi.com](https://aimlapi.com)
2. Sign up for account
3. Get API key from dashboard

### ElevenLabs (Optional)
1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Sign up for account
3. Get API key from settings

## 🚨 Current Issues Fixed

1. **Multiple GoTrueClient instances** - Fixed with improved singleton pattern
2. **Loading timeout** - Reduced from 10 minutes to 30 seconds
3. **Authentication flow** - Improved with better error handling
4. **Performance** - Optimized Supabase client initialization

## ✅ After Setup

Once you add the API keys to Vercel:
1. Chat will work in production ✅
2. All AI tools will function ✅
3. Loading issues will be resolved ✅
4. No more "Invalid API key" errors ✅

## 📞 Need Help?

If you need the specific API keys:
1. Check your local `.env` file (if you have one)
2. Or sign up for new accounts with the providers above
3. The Together AI key is the most critical for chat functionality