-- Fix schema mismatch issues
-- Add missing columns that the frontend code expects

-- Add model_used column to chat_messages table
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS model_used TEXT;

-- Update the chat_messages table to match what the code expects
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS model_id TEXT REFERENCES ai_models(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_model_used ON chat_messages(model_used);
CREATE INDEX IF NOT EXISTS idx_chat_messages_model_id ON chat_messages(model_id);

-- Update RLS policy for chat_messages to include new columns
DROP POLICY IF EXISTS "Users can manage chat_messages from own sessions" ON chat_messages;

CREATE POLICY "Users can manage chat_messages from own sessions" ON chat_messages
    USING (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE chat_sessions.id = chat_messages.session_id 
            AND chat_sessions.user_id = auth.uid()
        )
    );

-- Verify the schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Schema mismatch fixed successfully!' as status;
