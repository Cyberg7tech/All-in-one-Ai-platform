-- Test script to verify chat_with_file table is working
-- Run this after setting up the table to verify everything works

-- Check if table exists
SELECT 
    'Table exists' as check_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'chat_with_file' 
AND table_schema = 'public';

-- Check table structure
SELECT 
    'Table structure' as check_type,
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
    'RLS policies' as check_type,
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
AND table_schema = 'public';

-- Test insert (this will only work if you're authenticated)
-- Uncomment the lines below to test actual insert/select operations
/*
-- Test insert
INSERT INTO chat_with_file (user_id, file, filename, chat_history, history_metadata)
VALUES (
    auth.uid(),
    'Test content for verification',
    'test-file.pdf',
    '[]'::jsonb,
    'Test upload: ' || now()::text
);

-- Test select
SELECT 
    'Test data' as check_type,
    id,
    filename,
    LENGTH(file) as content_length,
    created_at
FROM chat_with_file 
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;
*/
