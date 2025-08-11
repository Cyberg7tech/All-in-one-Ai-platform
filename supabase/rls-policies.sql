-- Enable RLS on tables
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_models table
-- Allow all authenticated users to read ai_models
CREATE POLICY "Allow read access to ai_models" ON ai_models
FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to insert ai_models
CREATE POLICY "Allow insert access to ai_models" ON ai_models
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow all authenticated users to update ai_models
CREATE POLICY "Allow update access to ai_models" ON ai_models
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policies for chat_sessions table
-- Allow users to read their own chat sessions
CREATE POLICY "Allow users to read own chat sessions" ON chat_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to insert their own chat sessions
CREATE POLICY "Allow users to insert own chat sessions" ON chat_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own chat sessions
CREATE POLICY "Allow users to update own chat sessions" ON chat_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own chat sessions
CREATE POLICY "Allow users to delete own chat sessions" ON chat_sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for users table
-- Allow users to read their own profile
CREATE POLICY "Allow users to read own profile" ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to insert their own profile (for auth trigger)
CREATE POLICY "Allow users to insert own profile" ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- RLS Policies for user_dashboard_stats table
-- Allow users to read their own dashboard stats
CREATE POLICY "Allow users to read own dashboard stats" ON user_dashboard_stats
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to insert their own dashboard stats (for auth trigger)
CREATE POLICY "Allow users to insert own dashboard stats" ON user_dashboard_stats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own dashboard stats
CREATE POLICY "Allow users to update own dashboard stats" ON user_dashboard_stats
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Updated auth trigger function to handle subscription plan
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, subscription_plan, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'subscription_plan', 'free'),
    NEW.created_at,
    NEW.updated_at
  );
  
  -- Create initial dashboard stats
  INSERT INTO public.user_dashboard_stats (user_id, total_chats, total_images, total_videos, total_audio, total_tokens, total_cost, last_activity, updated_at)
  VALUES (NEW.id, 0, 0, 0, 0, 0, 0, NOW(), NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
