-- Check your current database structure
-- Run this first to see what we're working with

-- List all tables in the public schema
SELECT 'TABLES:' as type, tablename as name FROM pg_tables WHERE schemaname = 'public'
UNION ALL
-- List all views in the public schema  
SELECT 'VIEWS:' as type, viewname as name FROM pg_views WHERE schemaname = 'public'
ORDER BY type, name;

-- Show which objects have RLS enabled
SELECT 
    'TABLE' as object_type,
    schemaname,
    tablename as object_name,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'VIEW' as object_type,
    schemaname,
    viewname as object_name,
    'N/A' as rls_enabled
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY object_type, object_name;
