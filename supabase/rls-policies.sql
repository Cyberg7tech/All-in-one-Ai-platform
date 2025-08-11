-- Enable RLS on tables
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

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
