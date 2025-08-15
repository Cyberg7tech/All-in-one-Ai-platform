-- Check and update existing chat_with_file table
-- This script will add missing columns if they don't exist

-- First, let's see the current structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'chat_with_file' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add 'file' column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_with_file' 
        AND column_name = 'file' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_with_file ADD COLUMN file text;
    END IF;

    -- Add 'filename' column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_with_file' 
        AND column_name = 'filename' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_with_file ADD COLUMN filename text;
    END IF;

    -- Add 'chat_history' column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_with_file' 
        AND column_name = 'chat_history' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_with_file ADD COLUMN chat_history jsonb;
    END IF;

    -- Add 'history_metadata' column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_with_file' 
        AND column_name = 'history_metadata' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_with_file ADD COLUMN history_metadata text;
    END IF;

    RAISE NOTICE 'Table structure check completed';
END $$;

-- Check RLS policies
SELECT 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'chat_with_file';

-- Add missing RLS policies if they don't exist
DO $$
BEGIN
    -- Enable RLS if not already enabled
    ALTER TABLE chat_with_file ENABLE ROW LEVEL SECURITY;

    -- Add insert policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'chat_with_file' 
        AND policyname = 'Users can insert their own row.'
    ) THEN
        CREATE POLICY "Users can insert their own row." ON chat_with_file
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Add update policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'chat_with_file' 
        AND policyname = 'Users can update own row'
    ) THEN
        CREATE POLICY "Users can update own row" ON chat_with_file
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Add select policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'chat_with_file' 
        AND policyname = 'Users can read own row'
    ) THEN
        CREATE POLICY "Users can read own row" ON chat_with_file
        FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Add delete policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'chat_with_file' 
        AND policyname = 'Users can delete own row'
    ) THEN
        CREATE POLICY "Users can delete own row" ON chat_with_file
        FOR DELETE USING (auth.uid() = user_id);
    END IF;

    RAISE NOTICE 'RLS policies check completed';
END $$;
