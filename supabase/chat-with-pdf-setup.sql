-- Chat with PDF Table Setup (following BuilderKit documentation exactly)
-- Source: https://docs.builderkit.ai/ai-apps/chat-with-pdf

-- Drop the table if it exists and recreate it fresh
DROP TABLE IF EXISTS chat_with_file CASCADE;

-- Create a table for Chat with File
CREATE TABLE chat_with_file (
   id uuid NOT NULL DEFAULT uuid_generate_v4(),
   created_at timestamp with time zone NOT NULL DEFAULT now(),
   user_id uuid NULL,
   file text NOT NULL,
   filename text NOT NULL,
   chat_history jsonb NULL,
   history_metadata text NULL,
   CONSTRAINT chat_with_file_pkey PRIMARY KEY (id),
   CONSTRAINT chat_with_file_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Set up Row Level Security (RLS)
ALTER TABLE chat_with_file ENABLE ROW LEVEL SECURITY;

-- Create policies that work for ALL users (including free users)
CREATE POLICY "Users can insert their own row." ON chat_with_file
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own row" ON chat_with_file
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own row" ON chat_with_file
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own row" ON chat_with_file
FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS chat_with_file_user_id_idx ON chat_with_file (user_id);
CREATE INDEX IF NOT EXISTS chat_with_file_created_at_idx ON chat_with_file (created_at);

-- Grant necessary permissions
GRANT ALL ON chat_with_file TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify the setup
SELECT 
    'Table created successfully' as status,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'chat_with_file' 
AND table_schema = 'public';

SELECT 
    'RLS policies created' as status,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'chat_with_file';
