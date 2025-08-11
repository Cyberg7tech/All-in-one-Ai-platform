-- Fix auth trigger to properly sync with users table
-- This script fixes the RLS issue with auth trigger

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved auth trigger function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
SET search_path = public
AS $$
BEGIN
    -- Insert into users table
    INSERT INTO public.users (
        id, 
        email, 
        name, 
        avatar_url, 
        subscription_plan, 
        created_at, 
        updated_at
    )
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
    INSERT INTO public.user_dashboard_stats (user_id, updated_at)
    VALUES (NEW.id, NOW());
    
    RETURN NEW;
EXCEPTION 
    WHEN OTHERS THEN
        -- Log error but don't fail the auth process
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION handle_new_user();

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;

-- Add special RLS policy for auth service to insert users
CREATE POLICY "Allow auth service to insert users" ON users
    FOR INSERT 
    WITH CHECK (true);

-- Add special RLS policy for auth service to insert dashboard stats  
CREATE POLICY "Allow auth service to insert dashboard stats" ON user_dashboard_stats
    FOR INSERT 
    WITH CHECK (true);

-- Verify the trigger is created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

SELECT 'Auth trigger fixed successfully!' as status;
