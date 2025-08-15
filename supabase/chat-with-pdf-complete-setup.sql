-- Complete Chat with PDF Setup for BuilderKit
-- This single file contains everything needed to set up the chat_with_file table
-- Run this in your Supabase SQL Editor to fix all permission issues

-- =====================================================
-- STEP 1: DROP AND RECREATE TABLE
-- =====================================================

-- Drop existing table and recreate it properly
DROP TABLE IF EXISTS chat_with_file CASCADE;

-- Create the table with proper structure (following BuilderKit documentation)
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

-- =====================================================
-- STEP 2: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE chat_with_file ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 3: DROP ANY EXISTING POLICIES TO AVOID CONFLICTS
-- =====================================================

DROP POLICY IF EXISTS "Users can insert their own row." ON chat_with_file;
DROP POLICY IF EXISTS "Users can update own row" ON chat_with_file;
DROP POLICY IF EXISTS "Users can read own row" ON chat_with_file;
DROP POLICY IF EXISTS "Users can delete own row" ON chat_with_file;
DROP POLICY IF EXISTS "Users insert own row (chat_with_file)" ON chat_with_file;
DROP POLICY IF EXISTS "Users read own row (chat_with_file)" ON chat_with_file;
DROP POLICY IF EXISTS "Users update own row (chat_with_file)" ON chat_with_file;

-- =====================================================
-- STEP 4: CREATE RLS POLICIES (WORKS FOR ALL USERS INCLUDING FREE)
-- =====================================================

-- Insert policy
CREATE POLICY "Users can insert their own row." ON chat_with_file
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update policy
CREATE POLICY "Users can update own row" ON chat_with_file
FOR UPDATE USING (auth.uid() = user_id);

-- Select policy
CREATE POLICY "Users can read own row" ON chat_with_file
FOR SELECT USING (auth.uid() = user_id);

-- Delete policy
CREATE POLICY "Users can delete own row" ON chat_with_file
FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- STEP 5: GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT ALL ON chat_with_file TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions to anonymous users (if needed)
GRANT ALL ON chat_with_file TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- =====================================================
-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS chat_with_file_user_id_idx ON chat_with_file (user_id);
CREATE INDEX IF NOT EXISTS chat_with_file_created_at_idx ON chat_with_file (created_at);

-- =====================================================
-- STEP 7: VERIFICATION QUERIES
-- =====================================================

-- Check table structure
SELECT 
    'Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'chat_with_file' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
    'RLS Policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'chat_with_file';

-- Check permissions
SELECT 
    'Permissions' as check_type,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'chat_with_file' 
AND table_schema = 'public'
AND grantee IN ('authenticated', 'anon')
ORDER BY grantee, privilege_type;

-- =====================================================
-- STEP 8: TEST DATA (UNCOMMENT TO TEST)
-- =====================================================

/*
-- Test insert (this will only work if you're authenticated)
INSERT INTO chat_with_file (user_id, file, filename, chat_history, history_metadata)
VALUES (
    auth.uid(),
    'Test content for verification - This is a sample PDF content that will be used to test the chat functionality.',
    'test-file.pdf',
    '[]'::jsonb,
    'Test upload: ' || now()::text
);

-- Test select
SELECT 
    'Test Data' as check_type,
    id,
    filename,
    LENGTH(file) as content_length,
    created_at,
    chat_history
FROM chat_with_file 
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;
*/

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 
    '✅ Setup Complete!' as status,
    'chat_with_file table is ready for use' as message,
    'All users (including free users) can now upload PDFs and chat with them' as details;
