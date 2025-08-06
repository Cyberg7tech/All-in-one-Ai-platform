-- Update users table to include subscription fields
-- Run this after fresh-setup.sql to add subscription support

-- Add subscription fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_provider TEXT DEFAULT 'stripe',
ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS billing_email TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Create index for subscription queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_subscription_id ON users(subscription_id);

-- Update RLS policy to allow users to view their subscription info
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Update RLS policy to allow users to update their subscription info
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2) NOT NULL,
    stripe_price_id_monthly TEXT,
    stripe_price_id_yearly TEXT,
    lemonsqueezy_variant_id_monthly TEXT,
    lemonsqueezy_variant_id_yearly TEXT,
    features JSONB DEFAULT '[]',
    limits JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for subscription_plans (public read)
CREATE POLICY "All users can read subscription_plans" ON subscription_plans
    FOR SELECT USING (true);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, limits) VALUES
('Free', 'Basic features for getting started', 0, 0, 
 '["Basic AI Chat", "5 AI generations per month", "Community Support"]',
 '{"chat_messages": 100, "ai_generations": 5, "storage_mb": 100}'),
('Pro', 'Perfect for professionals and small teams', 29, 290,
 '["All AI Tools", "Unlimited AI generations", "Priority Support", "Advanced Analytics"]',
 '{"chat_messages": 10000, "ai_generations": -1, "storage_mb": 1000}'),
('Enterprise', 'For large organizations with custom needs', 99, 990,
 '["All Pro features", "Custom AI models", "Dedicated Support", "API Access", "White-label"]',
 '{"chat_messages": -1, "ai_generations": -1, "storage_mb": 10000}');

-- Create trigger for subscription_plans updated_at
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON subscription_plans TO authenticated;

-- Verify the setup
SELECT 'Users table updated with subscription fields successfully!' as status;
