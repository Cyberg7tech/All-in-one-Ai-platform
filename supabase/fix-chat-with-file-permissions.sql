-- Comprehensive fix for chat_with_file table permissions
-- This script will ensure the table works for all users including free users

-- Step 1: Drop existing table and recreate it properly
DROP TABLE IF EXISTS chat_with_file CASCADE;

-- Step 2: Create the table with proper structure
CREATE TABLE chat_with_file (
   id uuid NOT NULL DEFAULT gen_random_uuid(),
   created_at timestamp with time zone NOT NULL DEFAULT now(),
   user_id uuid NOT NULL,
   file text NOT NULL,
   filename text NOT NULL,
   chat_history jsonb DEFAULT '[]'::jsonb,
   history_metadata text,
   CONSTRAINT chat_with_file_pkey PRIMARY KEY (id),
   CONSTRAINT chat_with_file_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Step 3: Enable RLS
ALTER TABLE chat_with_file ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own row." ON chat_with_file;
DROP POLICY IF EXISTS "Users can update own row" ON chat_with_file;
DROP POLICY IF EXISTS "Users can read own row" ON chat_with_file;
DROP POLICY IF EXISTS "Users can delete own row" ON chat_with_file;
DROP POLICY IF EXISTS "Users insert own row (chat_with_file)" ON chat_with_file;
DROP POLICY IF EXISTS "Users read own row (chat_with_file)" ON chat_with_file;
DROP POLICY IF EXISTS "Users update own row (chat_with_file)" ON chat_with_file;

-- Step 5: Create new policies with exact BuilderKit naming
CREATE POLICY "Users can insert their own row." ON chat_with_file
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own row" ON chat_with_file
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own row" ON chat_with_file
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own row" ON chat_with_file
FOR DELETE USING (auth.uid() = user_id);

-- Step 6: Grant all necessary permissions
GRANT ALL ON chat_with_file TO authenticated;
GRANT ALL ON chat_with_file TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Step 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS chat_with_file_user_id_idx ON chat_with_file (user_id);
CREATE INDEX IF NOT EXISTS chat_with_file_created_at_idx ON chat_with_file (created_at);

-- Step 8: Verify the setup
SELECT 
    'Table verification' as check_type,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'chat_with_file' 
AND table_schema = 'public';

SELECT 
    'RLS policies verification' as check_type,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'chat_with_file';

SELECT 
    'Permissions verification' as check_type,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'chat_with_file' 
AND table_schema = 'public'
AND grantee IN ('authenticated', 'anon')
ORDER BY grantee, privilege_type;

-- Step 9: Test insert (uncomment to test)
/*
INSERT INTO chat_with_file (user_id, file, filename, chat_history, history_metadata)
VALUES (
    auth.uid(),
    'Test content for verification',
    'test-file.pdf',
    '[]'::jsonb,
    'Test upload: ' || now()::text
);

SELECT 
    'Test data verification' as check_type,
    id,
    filename,
    LENGTH(file) as content_length,
    created_at
FROM chat_with_file 
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;
*/
