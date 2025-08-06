-- Fresh database setup for All-in-One AI Platform
-- Run this after reset-database.sql to create a clean setup

-- Create custom types first
CREATE TYPE feature_type AS ENUM ('chat', 'image', 'video', 'audio', 'embedding');

-- Create users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI models table (public reference data)
CREATE TABLE ai_models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    model_type TEXT NOT NULL, -- 'chat', 'image', 'audio', etc.
    description TEXT,
    context_window INTEGER,
    max_tokens INTEGER,
    cost_per_token DECIMAL(10, 8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI agents table
CREATE TABLE ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    system_prompt TEXT NOT NULL,
    tools JSONB DEFAULT '[]',
    model_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat sessions table
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
    model_id TEXT NOT NULL REFERENCES ai_models(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage tracking table
CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id TEXT NOT NULL REFERENCES ai_models(id),
    tokens_used INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    feature_type feature_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated content table
CREATE TABLE generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'image', 'video', 'audio', 'text', etc.
    title TEXT,
    content_url TEXT,
    metadata JSONB DEFAULT '{}',
    model_used TEXT,
    prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics data table
CREATE TABLE analytics_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15, 6) NOT NULL,
    metric_type TEXT NOT NULL,
    time_period TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user API keys table
CREATE TABLE user_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'openai', 'anthropic', 'google', etc.
    key_name TEXT NOT NULL,
    encrypted_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider, key_name)
);

-- Create user dashboard stats table
CREATE TABLE user_dashboard_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_chats INTEGER DEFAULT 0,
    total_images INTEGER DEFAULT 0,
    total_videos INTEGER DEFAULT 0,
    total_audio INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 6) DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create workspace projects table
CREATE TABLE workspace_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    project_type TEXT NOT NULL,
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create useful views
CREATE VIEW chat_messages_with_user AS
SELECT 
    cm.*,
    cs.user_id,
    cs.title as session_title,
    u.name as user_name,
    u.email as user_email
FROM chat_messages cm
JOIN chat_sessions cs ON cm.session_id = cs.id
JOIN users u ON cs.user_id = u.id;

-- Insert default AI models
INSERT INTO ai_models (id, name, provider, model_type, description, context_window, max_tokens) VALUES
('gpt-4', 'GPT-4', 'OpenAI', 'chat', 'Most capable GPT-4 model', 8192, 4096),
('gpt-3.5-turbo', 'GPT-3.5 Turbo', 'OpenAI', 'chat', 'Fast and efficient chat model', 4096, 4096),
('claude-3-opus', 'Claude 3 Opus', 'Anthropic', 'chat', 'Most powerful Claude model', 200000, 4096),
('claude-3-sonnet', 'Claude 3 Sonnet', 'Anthropic', 'chat', 'Balanced Claude model', 200000, 4096),
('dall-e-3', 'DALL-E 3', 'OpenAI', 'image', 'Advanced image generation', NULL, NULL),
('dall-e-2', 'DALL-E 2', 'OpenAI', 'image', 'Image generation model', NULL, NULL),
('whisper-1', 'Whisper', 'OpenAI', 'audio', 'Speech to text model', NULL, NULL),
('tts-1', 'TTS-1', 'OpenAI', 'audio', 'Text to speech model', NULL, NULL),
('text-embedding-ada-002', 'Ada Embeddings', 'OpenAI', 'embedding', 'Text embeddings model', NULL, NULL);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- AI models are publicly readable
CREATE POLICY "All users can read ai_models" ON ai_models
    FOR SELECT USING (true);

-- AI agents - users can manage their own agents
CREATE POLICY "Users can manage own ai_agents" ON ai_agents
    USING (auth.uid() = user_id);

-- Chat sessions - users can manage their own sessions
CREATE POLICY "Users can manage own chat_sessions" ON chat_sessions
    USING (auth.uid() = user_id);

-- Chat messages - users can manage messages from their own sessions
CREATE POLICY "Users can manage chat_messages from own sessions" ON chat_messages
    USING (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE chat_sessions.id = chat_messages.session_id 
            AND chat_sessions.user_id = auth.uid()
        )
    );

-- Usage tracking - users can view and insert their own usage data
CREATE POLICY "Users can view own usage_tracking" ON usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage_tracking" ON usage_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Generated content - users can manage their own content
CREATE POLICY "Users can manage own generated_content" ON generated_content
    USING (auth.uid() = user_id);

-- Activities - users can manage their own activities
CREATE POLICY "Users can manage own activities" ON activities
    USING (auth.uid() = user_id);

-- Analytics data - users can manage their own analytics
CREATE POLICY "Users can manage own analytics_data" ON analytics_data
    USING (auth.uid() = user_id);

-- User API keys - users can manage their own API keys
CREATE POLICY "Users can manage own user_api_keys" ON user_api_keys
    USING (auth.uid() = user_id);

-- User dashboard stats - users can manage their own stats
CREATE POLICY "Users can manage own user_dashboard_stats" ON user_dashboard_stats
    USING (auth.uid() = user_id);

-- Workspace projects - users can manage their own projects
CREATE POLICY "Users can manage own workspace_projects" ON workspace_projects
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_ai_agents_user_id ON ai_agents(user_id);
CREATE INDEX idx_ai_agents_created_at ON ai_agents(created_at);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_created_at ON usage_tracking(created_at);
CREATE INDEX idx_generated_content_user_id ON generated_content(user_id);
CREATE INDEX idx_generated_content_created_at ON generated_content(created_at);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_timestamp ON activities(timestamp);
CREATE INDEX idx_analytics_data_user_id ON analytics_data(user_id);
CREATE INDEX idx_analytics_data_recorded_at ON analytics_data(recorded_at);
CREATE INDEX idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX idx_user_dashboard_stats_user_id ON user_dashboard_stats(user_id);
CREATE INDEX idx_workspace_projects_user_id ON workspace_projects(user_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_api_keys_updated_at BEFORE UPDATE ON user_api_keys 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_dashboard_stats_updated_at BEFORE UPDATE ON user_dashboard_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_projects_updated_at BEFORE UPDATE ON workspace_projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Final verification
SELECT 'Fresh database setup completed successfully!' as status;

-- Show created tables
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Show RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
ORDER BY tablename;
