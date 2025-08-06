# Row Level Security (RLS) Setup Guide

This guide will help you re-enable Row Level Security (RLS) for your Supabase database and recreate the necessary security policies.

## Overview

Row Level Security (RLS) ensures that users can only access their own data. When RLS is enabled, policies define which rows a user can see, insert, update, or delete.

## Step 1: Access Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `All-in-one-Ai-platform`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

## Step 2: Run the Essential RLS Script

Copy and paste the contents of `supabase/essential-rls.sql` into the SQL Editor and execute it:

```sql
-- This script enables RLS on all core tables and creates basic policies
-- See supabase/essential-rls.sql for the full script
```

**OR** if you want comprehensive policies, use `supabase/rls-policies.sql` instead.

## Step 3: Verify RLS is Enabled

After running the script, verify that RLS is enabled by running this query:

```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

You should see all your tables listed with `rowsecurity = true`.

## Step 4: Test the Policies

1. Go to **Authentication** > **Users** in your Supabase dashboard
2. Create a test user or use an existing one
3. Try accessing data through your application to ensure:
   - Users can only see their own data
   - Users cannot access other users' data
   - All CRUD operations work correctly

## Core Tables and Their Policies

### 1. `ai_agents`
- **Policy**: Users can only manage their own AI agents
- **Key Field**: `user_id`

### 2. `chat_sessions`
- **Policy**: Users can only manage their own chat sessions
- **Key Field**: `user_id`

### 3. `chat_messages`
- **Policy**: Users can only manage messages from their own sessions
- **Key Field**: Linked via `session_id` to `chat_sessions.user_id`

### 4. `usage_tracking`
- **Policy**: Users can view and insert their own usage data
- **Key Field**: `user_id`

### 5. `user_subscriptions`
- **Policy**: Users can only manage their own subscription
- **Key Field**: `user_id`

### 6. `workflows`
- **Policy**: Users can only manage their own workflows
- **Key Field**: `user_id`

### 7. `forecasting_models`
- **Policy**: Users can only manage their own forecasting models
- **Key Field**: `user_id`

### 8. `anomaly_detections`
- **Policy**: Users can only manage their own anomaly detections
- **Key Field**: `user_id`

### 9. `documents`
- **Policy**: Users can only manage their own documents
- **Key Field**: `user_id` (stored in metadata JSON)

## Troubleshooting

### If you get "permission denied" errors:

1. **Check user authentication**: Ensure `auth.uid()` returns the correct user ID
2. **Verify policies**: Make sure the policies match your data structure
3. **Check service role**: Some operations might need to use the service role key

### If some tables don't exist:

The scripts include policies for tables that might not exist yet. This is normal - the policies will be created when the tables are created.

### Common issues:

1. **Policies too restrictive**: Users can't access their own data
   - Check that `user_id` fields are correctly set
   - Verify that `auth.uid()` matches the stored `user_id`

2. **Policies too permissive**: Users can access other users' data
   - Review and tighten the policy conditions
   - Test with multiple user accounts

## Testing Your Setup

1. **Create two test users** in Supabase Auth
2. **Insert test data** for each user through your application
3. **Verify isolation**: Each user should only see their own data
4. **Test all operations**: Create, read, update, delete

## Performance Considerations

The RLS scripts include indexes on `user_id` fields to ensure good performance:

- `idx_ai_agents_user_id`
- `idx_chat_sessions_user_id`
- `idx_chat_messages_session_id`
- `idx_usage_tracking_user_id`
- And more...

These indexes are crucial for RLS performance as they allow Postgres to efficiently filter rows by user.

## Next Steps

After enabling RLS:

1. **Test your application thoroughly**
2. **Monitor performance** - RLS can impact query performance
3. **Update your application code** if needed to handle RLS restrictions
4. **Consider backup strategies** for your secured data

## Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
