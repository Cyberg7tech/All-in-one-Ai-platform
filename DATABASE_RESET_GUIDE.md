# Database Reset and Fresh Setup Guide

⚠️ **WARNING: This will delete ALL your data!** ⚠️

This guide will help you completely reset your Supabase database and set up a fresh, properly structured database for your All-in-One AI Platform.

## 🚨 Before You Start

1. **Backup any important data** - This process will permanently delete everything
2. **Make sure you have admin access** to your Supabase project
3. **Consider testing on a development database first**

## 📋 Step-by-Step Process

### Step 1: Reset the Database
1. Go to your Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase/reset-database.sql`
3. Click **Run** to execute
4. This will:
   - Drop all policies
   - Drop all indexes
   - Drop all tables and views
   - Delete all data
   - Reset the public schema

### Step 2: Set Up Fresh Database
1. In the same SQL Editor, clear the previous query
2. Copy and paste the contents of `supabase/fresh-setup.sql`
3. Click **Run** to execute
4. This will create:
   - All necessary tables with proper structure
   - Row Level Security policies
   - Performance indexes
   - Default AI models
   - Useful views and functions

## 🗃️ Database Structure Created

### Core Tables:
- **`users`** - User profiles (extends auth.users)
- **`ai_models`** - Available AI models (GPT, Claude, DALL-E, etc.)
- **`ai_agents`** - Custom AI agents created by users
- **`chat_sessions`** - Chat conversation sessions
- **`chat_messages`** - Individual messages in chats
- **`usage_tracking`** - Token usage and costs
- **`generated_content`** - Images, videos, audio created
- **`activities`** - User activity logs
- **`analytics_data`** - Analytics and metrics
- **`user_api_keys`** - Encrypted API keys for each user
- **`user_dashboard_stats`** - Dashboard statistics
- **`workspace_projects`** - User projects and workflows

### Security Features:
- ✅ Row Level Security enabled on all tables
- ✅ Users can only access their own data
- ✅ Proper UUID relationships
- ✅ Foreign key constraints
- ✅ Performance indexes

### Built-in Features:
- ✅ Auto-updating timestamps
- ✅ Default AI models pre-loaded
- ✅ Proper data types and constraints
- ✅ Useful views for common queries

## 🔧 What This Fixes

### From Your Previous Issues:
- ❌ **Type casting errors** → ✅ Proper UUID types throughout
- ❌ **Missing tables** → ✅ All tables defined and created
- ❌ **View RLS errors** → ✅ Views excluded from RLS
- ❌ **Inconsistent structure** → ✅ Clean, consistent schema

### New Benefits:
- 🚀 **Better performance** with proper indexes
- 🔒 **Stronger security** with comprehensive RLS
- 🏗️ **Scalable structure** for future features
- 📊 **Built-in analytics** capabilities

## 🧪 Testing Your Setup

After running both scripts:

1. **Check tables created**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' ORDER BY table_name;
   ```

2. **Verify RLS is enabled**:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE schemaname = 'public' AND rowsecurity = true;
   ```

3. **Test with your application**:
   - Create a test user
   - Try creating an AI agent
   - Start a chat session
   - Verify data isolation

## 🔄 Updating Your Application

After the database reset, you may need to update your application code:

1. **Update type definitions** in `types/supabase.ts`
2. **Check API routes** for any table name changes
3. **Test all features** to ensure compatibility
4. **Update any hardcoded table references**

## 🆘 If Something Goes Wrong

If you encounter issues:

1. **Check the error messages** in the SQL Editor
2. **Run queries one section at a time** to isolate issues
3. **Verify your Supabase permissions** (you need admin access)
4. **Contact support** if you need help with specific errors

## 📁 Files Included

- **`supabase/reset-database.sql`** - Completely clears the database
- **`supabase/fresh-setup.sql`** - Creates the new structure
- **`DATABASE_RESET_GUIDE.md`** - This guide

## ✅ Ready to Deploy

Once you've completed the database reset and setup:

1. Your database will be clean and properly structured
2. RLS will be working correctly
3. Your application should connect without type errors
4. You can proceed with testing and deployment

---

**Remember**: This is a destructive operation. Make sure you're ready to lose all existing data before proceeding!
