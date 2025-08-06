-- DANGER: This script will DELETE ALL your data and reset the database
-- Only run this if you want to completely start fresh
-- Make sure to backup any important data first!

-- Disable RLS on actual tables only (not views)
-- We'll discover what's actually a table vs view and handle accordingly

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Disable RLS on all actual tables (not views)
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', r.tablename);
    END LOOP;
END $$;

-- Drop all views first (they depend on tables)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Drop all views dynamically
    FOR r IN (
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I CASCADE', r.viewname);
    END LOOP;
END $$;

-- Drop all policies first
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Drop all policies
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Drop all indexes (except system ones)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT indexname, tablename 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname LIKE 'idx_%'
    ) LOOP
        EXECUTE format('DROP INDEX IF EXISTS %I', r.indexname);
    END LOOP;
END $$;

-- Drop all functions in public schema
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT routine_name, routine_type
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
    ) LOOP
        EXECUTE format('DROP %s IF EXISTS %I CASCADE', 
                      r.routine_type, r.routine_name);
    END LOOP;
END $$;

-- Drop all tables dynamically (this will delete all your data!)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Drop all tables in the public schema
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', r.tablename);
    END LOOP;
END $$;

-- Drop any custom types
DROP TYPE IF EXISTS feature_type CASCADE;

-- Reset sequences if any exist
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
    ) LOOP
        EXECUTE format('DROP SEQUENCE IF EXISTS %I CASCADE', r.sequence_name);
    END LOOP;
END $$;

-- Clean up any remaining objects
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Confirm reset
SELECT 'Database has been completely reset!' as status;
