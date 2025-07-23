-- =====================================================
-- One AI Platform - Complete Database Schema
-- =====================================================
-- Run this in your Supabase SQL Editor to set up all tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'developer', 'premium')),
    subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
    credits_remaining INTEGER DEFAULT 1000,
    total_credits_used INTEGER DEFAULT 0,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- AI MODELS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_models (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    input_cost_per_token DECIMAL(10, 8) DEFAULT 0,
    output_cost_per_token DECIMAL(10, 8) DEFAULT 0,
    max_tokens INTEGER DEFAULT 4000,
    context_window INTEGER DEFAULT 4000,
    capabilities TEXT[] DEFAULT '{}',
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- AI AGENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL DEFAULT 'general',
    model VARCHAR(255) NOT NULL,
    system_prompt TEXT NOT NULL,
    tools TEXT[] DEFAULT '{}',
    model_config JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- CHAT SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    model_id VARCHAR(255) NOT NULL,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 6) DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- CHAT MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0,
    model_used VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- USAGE TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
    model_id VARCHAR(255) NOT NULL,
    feature_type VARCHAR(100) NOT NULL CHECK (feature_type IN ('chat', 'image', 'video', 'audio', 'embedding', 'text-to-speech', 'speech-to-text', 'music')),
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- GENERATED CONTENT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS generated_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL CHECK (type IN ('image', 'video', 'audio', 'music', 'document')),
    title VARCHAR(500),
    prompt TEXT,
    model_used VARCHAR(255),
    file_url TEXT,
    file_size INTEGER,
    duration INTEGER, -- for audio/video content
    metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- API KEYS TABLE (for user's own API keys)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(100) NOT NULL,
    key_name VARCHAR(255) NOT NULL,
    encrypted_key TEXT NOT NULL, -- Should be encrypted
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, provider, key_name)
);

-- =====================================================
-- WORKSPACE PROJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS workspace_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL DEFAULT 'general',
    settings JSONB DEFAULT '{}',
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- ANALYTICS DATA TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL(15, 4) NOT NULL,
    metric_type VARCHAR(100) NOT NULL,
    time_period VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_plan);

-- Chat sessions indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at);

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- AI agents indexes
CREATE INDEX IF NOT EXISTS idx_ai_agents_user_id ON ai_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_type ON ai_agents(type);
CREATE INDEX IF NOT EXISTS idx_ai_agents_public ON ai_agents(is_public);

-- Usage tracking indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON usage_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature_type ON usage_tracking(feature_type);

-- Generated content indexes
CREATE INDEX IF NOT EXISTS idx_generated_content_user_id ON generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_type ON generated_content(type);
CREATE INDEX IF NOT EXISTS idx_generated_content_created_at ON generated_content(created_at);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_api_keys_updated_at BEFORE UPDATE ON user_api_keys
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_workspace_projects_updated_at BEFORE UPDATE ON workspace_projects
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- AI Agents policies
CREATE POLICY "Users can view own agents or public agents" ON ai_agents
    FOR SELECT USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create own agents" ON ai_agents
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own agents" ON ai_agents
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own agents" ON ai_agents
    FOR DELETE USING (user_id = auth.uid());

-- Chat sessions policies
CREATE POLICY "Users can view own chat sessions" ON chat_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own chat sessions" ON chat_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own chat sessions" ON chat_sessions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own chat sessions" ON chat_sessions
    FOR DELETE USING (user_id = auth.uid());

-- Chat messages policies (inherit from session)
CREATE POLICY "Users can view messages from own sessions" ON chat_messages
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM chat_sessions 
        WHERE chat_sessions.id = chat_messages.session_id 
        AND chat_sessions.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert messages to own sessions" ON chat_messages
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM chat_sessions 
        WHERE chat_sessions.id = chat_messages.session_id 
        AND chat_sessions.user_id = auth.uid()
    ));

-- Usage tracking policies
CREATE POLICY "Users can view own usage" ON usage_tracking
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own usage" ON usage_tracking
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Generated content policies
CREATE POLICY "Users can view own content or public content" ON generated_content
    FOR SELECT USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create own content" ON generated_content
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own content" ON generated_content
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own content" ON generated_content
    FOR DELETE USING (user_id = auth.uid());

-- User API keys policies
CREATE POLICY "Users can view own API keys" ON user_api_keys
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own API keys" ON user_api_keys
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own API keys" ON user_api_keys
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own API keys" ON user_api_keys
    FOR DELETE USING (user_id = auth.uid());

-- Workspace projects policies
CREATE POLICY "Users can view own projects or shared projects" ON workspace_projects
    FOR SELECT USING (user_id = auth.uid() OR is_shared = true);

CREATE POLICY "Users can create own projects" ON workspace_projects
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects" ON workspace_projects
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own projects" ON workspace_projects
    FOR DELETE USING (user_id = auth.uid());

-- Analytics data policies
CREATE POLICY "Users can view own analytics" ON analytics_data
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own analytics" ON analytics_data
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- =====================================================
-- SEED DATA - POPULAR AI MODELS
-- =====================================================

INSERT INTO ai_models (id, name, provider, category, description, input_cost_per_token, output_cost_per_token, max_tokens, context_window, capabilities, is_premium) VALUES
-- OpenAI Models
('gpt-4o', 'GPT-4o', 'OpenAI', 'Chat', 'Most advanced multimodal model', 0.000005, 0.000015, 4096, 128000, ARRAY['text', 'vision', 'function_calling'], true),
('gpt-4o-mini', 'GPT-4o Mini', 'OpenAI', 'Chat', 'Fast and efficient GPT-4 level model', 0.00000015, 0.0000006, 16384, 128000, ARRAY['text', 'vision', 'function_calling'], false),
('gpt-4-turbo', 'GPT-4 Turbo', 'OpenAI', 'Chat', 'Latest GPT-4 with 128k context', 0.00001, 0.00003, 4096, 128000, ARRAY['text', 'vision', 'function_calling'], true),
('o1-preview', 'o1 Preview', 'OpenAI', 'Reasoning', 'Advanced reasoning model', 0.000015, 0.00006, 32768, 128000, ARRAY['reasoning', 'problem_solving'], true),
('o1-mini', 'o1 Mini', 'OpenAI', 'Reasoning', 'Faster reasoning model', 0.000003, 0.000012, 65536, 128000, ARRAY['reasoning', 'coding'], true),

-- Anthropic Models
('claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 'Anthropic', 'Chat', 'Most capable Claude model', 0.000003, 0.000015, 8192, 200000, ARRAY['text', 'vision', 'function_calling'], true),
('claude-3-5-haiku-20241022', 'Claude 3.5 Haiku', 'Anthropic', 'Chat', 'Fast and cost-effective Claude', 0.0000008, 0.000004, 8192, 200000, ARRAY['text', 'vision'], false),
('claude-3-opus-20240229', 'Claude 3 Opus', 'Anthropic', 'Chat', 'Most powerful Claude 3 model', 0.000015, 0.000075, 4096, 200000, ARRAY['text', 'vision', 'analysis'], true),

-- Together.ai Models
('meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', 'Llama 3.1 8B Turbo', 'Together.ai', 'Chat', 'Fast and efficient Llama model', 0.0000002, 0.0000002, 8192, 128000, ARRAY['text', 'instruction_following'], false),
('meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', 'Llama 3.1 70B Turbo', 'Together.ai', 'Chat', 'Large context Llama model', 0.0000009, 0.0000009, 8192, 128000, ARRAY['text', 'reasoning'], true),
('meta-llama/Llama-3.3-70B-Instruct-Turbo', 'Llama 3.3 70B Turbo', 'Together.ai', 'Chat', 'Latest Llama with enhanced capabilities', 0.0000009, 0.0000009, 8192, 128000, ARRAY['text', 'reasoning'], true),
('mistralai/Mixtral-8x7B-Instruct-v0.1', 'Mixtral 8x7B Instruct', 'Together.ai', 'Chat', 'Mixture of experts model', 0.0000007, 0.0000007, 32768, 32768, ARRAY['text', 'multilingual'], true),
('deepseek-ai/DeepSeek-R1', 'DeepSeek R1', 'Together.ai', 'Reasoning', 'Advanced reasoning model', 0.0000005, 0.0000005, 8192, 64000, ARRAY['reasoning', 'mathematics'], true),
('Qwen/Qwen2.5-72B-Instruct-Turbo', 'Qwen 2.5 72B Turbo', 'Together.ai', 'Chat', 'Alibaba flagship multilingual model', 0.0000009, 0.0000009, 8192, 128000, ARRAY['text', 'multilingual', 'coding'], true),

-- Google Models
('gemini-1.5-pro', 'Gemini 1.5 Pro', 'Google', 'Chat', 'Google most capable model', 0.000002, 0.000006, 8192, 1000000, ARRAY['text', 'vision', 'audio'], true),
('gemini-1.5-flash', 'Gemini 1.5 Flash', 'Google', 'Chat', 'Fast and versatile Gemini', 0.00000015, 0.0000006, 8192, 1000000, ARRAY['text', 'vision'], false),

-- xAI Models
('grok-3', 'Grok 3', 'xAI', 'Chat', 'Elon Musk xAI flagship model', 0.000005, 0.000015, 8192, 128000, ARRAY['text', 'reasoning'], true),

-- DeepSeek Models
('deepseek-v3', 'DeepSeek V3', 'DeepSeek', 'Chat', 'Advanced Chinese AI model', 0.000001, 0.000002, 8192, 64000, ARRAY['text', 'coding', 'mathematics'], true),

-- Kimi Models
('kimi-k2', 'Kimi K2', 'Kimi', 'Chat', 'Moonshot AI large context model', 0.000001, 0.000002, 8192, 200000, ARRAY['text', 'long_context'], false);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Create a simple view for dashboard analytics
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.subscription_plan,
    u.credits_remaining,
    COUNT(DISTINCT cs.id) as total_sessions,
    COUNT(DISTINCT cm.id) as total_messages,
    COUNT(DISTINCT aa.id) as total_agents,
    COALESCE(SUM(ut.cost), 0) as total_cost,
    COALESCE(SUM(ut.tokens_used), 0) as total_tokens
FROM users u
LEFT JOIN chat_sessions cs ON u.id = cs.user_id
LEFT JOIN chat_messages cm ON cs.id = cm.session_id
LEFT JOIN ai_agents aa ON u.id = aa.user_id
LEFT JOIN usage_tracking ut ON u.id = ut.user_id
GROUP BY u.id, u.name, u.email, u.subscription_plan, u.credits_remaining;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE '🎉 One AI Platform Database Schema Created Successfully!';
    RAISE NOTICE '✅ Tables: % created', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE');
    RAISE NOTICE '✅ Indexes: Created for optimal performance';
    RAISE NOTICE '✅ RLS Policies: Enabled for data security';
    RAISE NOTICE '✅ Triggers: Set up for automatic timestamps';
    RAISE NOTICE '✅ Sample AI Models: % models inserted', (SELECT COUNT(*) FROM ai_models);
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your One AI Platform database is ready for production!';
END $$; 