-- =============================================================================
-- SIMPLE DATABASE RESET AND SETUP FOR ALL-IN-ONE AI PLATFORM
-- =============================================================================
-- This version avoids vector extension conflicts and provides a clean setup
-- =============================================================================

-- DANGER: This will DELETE ALL data! Backup first if needed!

-- Step 1: Clean reset (avoiding vector extension conflicts)
-- =============================================================================

-- Disable RLS first
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', r.tablename);
        EXCEPTION WHEN OTHERS THEN
            NULL; -- Ignore errors
        END;
    END LOOP;
END $$;

-- Drop policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- Drop views
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
        BEGIN
            EXECUTE format('DROP VIEW IF EXISTS %I CASCADE', r.viewname);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- Drop tables (this will handle most cleanup)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        BEGIN
            EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', r.tablename);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- Drop custom functions (excluding vector extension functions)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT routine_name, routine_type
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
        AND routine_name NOT LIKE 'vector_%'
        AND routine_name NOT LIKE '%vector%'
        AND routine_name NOT IN ('cosine_distance', 'inner_product', 'l1_distance', 'l2_distance')
    ) LOOP
        BEGIN
            EXECUTE format('DROP %s IF EXISTS %I CASCADE', r.routine_type, r.routine_name);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- Drop custom types
DROP TYPE IF EXISTS feature_type CASCADE;
DROP TYPE IF EXISTS content_type CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;

-- =============================================================================
-- Step 2: Create custom types and enums
-- =============================================================================

CREATE TYPE feature_type AS ENUM (
    'chat', 'image', 'video', 'audio', 'embedding', 'pdf', 'transcription', 
    'text_to_speech', 'music', 'qr_code', 'headshot', 'interior_design',
    'quiz', 'flashcard', 'youtube_content', 'content_writer'
);

CREATE TYPE content_type AS ENUM (
    'text', 'image', 'video', 'audio', 'pdf', 'qr_code', 'music',
    'headshot', 'interior_design', 'quiz', 'flashcard', 'transcript'
);

CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'trial');

-- =============================================================================
-- Step 3: Core tables
-- =============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    
    -- Subscription fields
    subscription_status subscription_status DEFAULT 'inactive',
    subscription_id TEXT,
    subscription_provider TEXT DEFAULT 'stripe',
    subscription_plan TEXT DEFAULT 'free',
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    billing_email TEXT,
    payment_method TEXT,
    
    -- Usage limits
    monthly_credits INTEGER DEFAULT 1000,
    used_credits INTEGER DEFAULT 0,
    
    -- Metadata
    preferences JSONB DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans table
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2) NOT NULL,
    stripe_price_id_monthly TEXT,
    stripe_price_id_yearly TEXT,
    lemonsqueezy_variant_id_monthly TEXT,
    lemonsqueezy_variant_id_yearly TEXT,
    features JSONB DEFAULT '[]',
    limits JSONB DEFAULT '{}',
    credits_per_month INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI models table (public reference data)
CREATE TABLE ai_models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    model_type TEXT NOT NULL,
    description TEXT,
    context_window INTEGER,
    max_tokens INTEGER,
    cost_per_token DECIMAL(10, 8),
    cost_per_image DECIMAL(10, 6),
    cost_per_minute DECIMAL(10, 6),
    supported_features TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- Step 4: AI Apps specific tables
-- =============================================================================

-- Chat-related tables
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    model_id TEXT NOT NULL REFERENCES ai_models(id),
    system_prompt TEXT,
    temperature DECIMAL(3, 2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2000,
    app_type TEXT DEFAULT 'chat', -- 'chat', 'multillm', 'gemini', 'deepseek', 'llama'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document and PDF processing (without vector embeddings for now)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    content TEXT,
    content_url TEXT,
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    chunk_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    embedding_data JSONB, -- Store embeddings as JSON array for now
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated content (for all AI apps)
CREATE TABLE generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type content_type NOT NULL,
    title TEXT,
    content TEXT,
    content_url TEXT,
    thumbnail_url TEXT,
    prompt TEXT,
    model_used TEXT,
    app_type TEXT NOT NULL, -- 'image_generator', 'headshot', 'interior_design', etc.
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0,
    is_public BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice and audio processing
CREATE TABLE audio_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    duration_seconds INTEGER,
    file_url TEXT NOT NULL,
    transcript TEXT,
    app_type TEXT NOT NULL, -- 'transcription', 'text_to_speech', 'music_generator'
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- YouTube content processing
CREATE TABLE youtube_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    video_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    transcript TEXT,
    summary TEXT,
    key_points JSONB DEFAULT '[]',
    duration_seconds INTEGER,
    thumbnail_url TEXT,
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz and flashcard system
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    topic TEXT,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    question_count INTEGER DEFAULT 0,
    source_content TEXT, -- Original content used to generate quiz
    is_public BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'short_answer')),
    options JSONB DEFAULT '[]', -- Array of answer options
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    difficulty TEXT DEFAULT 'medium',
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    max_score INTEGER NOT NULL,
    percentage DECIMAL(5, 2),
    time_taken_seconds INTEGER,
    answers JSONB DEFAULT '{}', -- Store user answers
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Flashcards
CREATE TABLE flashcard_decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    topic TEXT,
    card_count INTEGER DEFAULT 0,
    source_content TEXT,
    is_public BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    front_content TEXT NOT NULL,
    back_content TEXT NOT NULL,
    card_type TEXT DEFAULT 'text' CHECK (card_type IN ('text', 'image', 'audio')),
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    order_index INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User API keys management
CREATE TABLE user_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'openai', 'anthropic', 'google', 'together', etc.
    key_name TEXT NOT NULL,
    encrypted_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_used TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider, key_name)
);

-- Usage tracking and analytics
CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id TEXT REFERENCES ai_models(id),
    feature_type feature_type NOT NULL,
    app_type TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0,
    credits_used INTEGER DEFAULT 0,
    request_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_dashboard_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_chats INTEGER DEFAULT 0,
    total_images INTEGER DEFAULT 0,
    total_videos INTEGER DEFAULT 0,
    total_audio INTEGER DEFAULT 0,
    total_documents INTEGER DEFAULT 0,
    total_quizzes INTEGER DEFAULT 0,
    total_flashcards INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 6) DEFAULT 0,
    total_credits_used INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Activity logging
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    app_type TEXT,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics data
CREATE TABLE analytics_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15, 6) NOT NULL,
    metric_type TEXT NOT NULL,
    time_period TEXT NOT NULL,
    app_type TEXT,
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- Step 5: Insert default data
-- =============================================================================

-- Insert subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, credits_per_month, features, limits) VALUES
('Free', 'Basic access to AI tools', 0.00, 0.00, 1000, 
 '["Chat with AI", "Basic image generation", "Text-to-speech (limited)", "Quiz generation"]',
 '{"images_per_day": 5, "audio_minutes_per_day": 10, "documents_per_month": 3}'),
('Pro', 'Advanced AI features', 19.99, 199.99, 10000,
 '["Unlimited chat", "Advanced image generation", "Video generation", "Voice transcription", "PDF processing", "Custom models"]',
 '{"images_per_day": 100, "audio_minutes_per_day": 120, "documents_per_month": 50}'),
('Enterprise', 'Full access + priority support', 49.99, 499.99, 50000,
 '["Everything in Pro", "Priority processing", "Custom integrations", "Advanced analytics", "API access"]',
 '{"images_per_day": -1, "audio_minutes_per_day": -1, "documents_per_month": -1}');

-- Insert AI models
INSERT INTO ai_models (id, name, provider, model_type, description, context_window, max_tokens, cost_per_token, supported_features) VALUES
-- Chat models
('gpt-4o', 'GPT-4o', 'OpenAI', 'chat', 'Most advanced GPT-4 model with vision', 128000, 4096, 0.000005, ARRAY['chat', 'vision', 'function_calling']),
('gpt-4-turbo', 'GPT-4 Turbo', 'OpenAI', 'chat', 'Fast and capable GPT-4 model', 128000, 4096, 0.00001, ARRAY['chat', 'vision', 'function_calling']),
('gpt-3.5-turbo', 'GPT-3.5 Turbo', 'OpenAI', 'chat', 'Fast and efficient chat model', 16385, 4096, 0.0000015, ARRAY['chat', 'function_calling']),
('claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 'Anthropic', 'chat', 'Most intelligent Claude model', 200000, 8192, 0.000003, ARRAY['chat', 'vision', 'function_calling']),
('claude-3-opus-20240229', 'Claude 3 Opus', 'Anthropic', 'chat', 'Most powerful Claude model', 200000, 4096, 0.000015, ARRAY['chat', 'vision']),
('gemini-1.5-pro', 'Gemini 1.5 Pro', 'Google', 'chat', 'Advanced Google AI model', 2000000, 8192, 0.0000035, ARRAY['chat', 'vision', 'function_calling']),
('meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', 'Llama 3.1 70B', 'Together AI', 'chat', 'Open source chat model', 131072, 4096, 0.0000009, ARRAY['chat']),
('deepseek-chat', 'DeepSeek Chat', 'DeepSeek', 'chat', 'Advanced reasoning model', 64000, 4096, 0.0000002, ARRAY['chat', 'reasoning']),

-- Image models  
('dall-e-3', 'DALL-E 3', 'OpenAI', 'image', 'Advanced image generation', NULL, NULL, NULL, ARRAY['image_generation']),
('dall-e-2', 'DALL-E 2', 'OpenAI', 'image', 'Image generation model', NULL, NULL, NULL, ARRAY['image_generation']),
('stable-diffusion-xl', 'Stable Diffusion XL', 'Stability AI', 'image', 'High quality image generation', NULL, NULL, NULL, ARRAY['image_generation']),

-- Audio models
('whisper-1', 'Whisper', 'OpenAI', 'audio', 'Speech to text model', NULL, NULL, NULL, ARRAY['transcription']),
('tts-1', 'TTS-1', 'OpenAI', 'audio', 'Text to speech model', NULL, NULL, NULL, ARRAY['text_to_speech']),
('tts-1-hd', 'TTS-1 HD', 'OpenAI', 'audio', 'High quality text to speech', NULL, NULL, NULL, ARRAY['text_to_speech']),

-- Embedding models
('text-embedding-3-large', 'Text Embeddings 3 Large', 'OpenAI', 'embedding', 'Advanced text embeddings', NULL, NULL, 0.00000013, ARRAY['embedding']),
('text-embedding-ada-002', 'Ada Embeddings', 'OpenAI', 'embedding', 'Text embeddings model', NULL, NULL, 0.0000001, ARRAY['embedding']);

-- =============================================================================
-- Step 6: Create indexes for performance
-- =============================================================================

-- Core indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_users_subscription_plan ON users(subscription_plan);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_app_type ON chat_sessions(app_type);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_generated_content_user_id ON generated_content(user_id);
CREATE INDEX idx_generated_content_app_type ON generated_content(app_type);
CREATE INDEX idx_audio_files_user_id ON audio_files(user_id);
CREATE INDEX idx_youtube_content_user_id ON youtube_content(user_id);
CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_flashcard_decks_user_id ON flashcard_decks(user_id);
CREATE INDEX idx_flashcards_deck_id ON flashcards(deck_id);
CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);

-- =============================================================================
-- Step 7: Create utility functions
-- =============================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, name, avatar_url, subscription_plan, created_at, updated_at)
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
    INSERT INTO user_dashboard_stats (user_id, updated_at)
    VALUES (NEW.id, NOW());
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================================================
-- Step 8: Create triggers
-- =============================================================================

-- Update timestamp triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_content_updated_at BEFORE UPDATE ON generated_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_dashboard_stats_updated_at BEFORE UPDATE ON user_dashboard_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auth trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- Step 9: Enable Row Level Security (RLS) and create policies
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Public access tables
CREATE POLICY "Everyone can read subscription plans" ON subscription_plans FOR SELECT USING (true);
CREATE POLICY "Everyone can read ai_models" ON ai_models FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert ai_models" ON ai_models FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update ai_models" ON ai_models FOR UPDATE TO authenticated USING (true);

-- Chat sessions and messages
CREATE POLICY "Users can manage own chat_sessions" ON chat_sessions USING (auth.uid() = user_id);
CREATE POLICY "Users can manage chat_messages from own sessions" ON chat_messages
    USING (EXISTS (SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()));

-- Documents
CREATE POLICY "Users can manage own documents" ON documents USING (auth.uid() = user_id);
CREATE POLICY "Users can manage document_chunks from own documents" ON document_chunks
    USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_chunks.document_id AND documents.user_id = auth.uid()));

-- Generated content  
CREATE POLICY "Users can read own or public generated_content" ON generated_content 
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own generated_content" ON generated_content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own generated_content" ON generated_content FOR UPDATE USING (auth.uid() = user_id);

-- Audio files
CREATE POLICY "Users can manage own audio_files" ON audio_files USING (auth.uid() = user_id);

-- YouTube content
CREATE POLICY "Users can manage own youtube_content" ON youtube_content USING (auth.uid() = user_id);

-- Quizzes
CREATE POLICY "Users can read public or own quizzes" ON quizzes FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own quizzes" ON quizzes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quizzes" ON quizzes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quizzes" ON quizzes FOR DELETE USING (auth.uid() = user_id);

-- Quiz questions and attempts
CREATE POLICY "Users can manage quiz_questions from accessible quizzes" ON quiz_questions
    USING (EXISTS (SELECT 1 FROM quizzes WHERE quizzes.id = quiz_questions.quiz_id AND (quizzes.user_id = auth.uid() OR quizzes.is_public = true)));
CREATE POLICY "Users can view own quiz_attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz_attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Flashcards
CREATE POLICY "Users can read public or own flashcard_decks" ON flashcard_decks FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own flashcard_decks" ON flashcard_decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flashcard_decks" ON flashcard_decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flashcard_decks" ON flashcard_decks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage flashcards from accessible decks" ON flashcards
    USING (EXISTS (SELECT 1 FROM flashcard_decks WHERE flashcard_decks.id = flashcards.deck_id AND (flashcard_decks.user_id = auth.uid() OR flashcard_decks.is_public = true)));

-- Other user-specific tables
CREATE POLICY "Users can manage own user_api_keys" ON user_api_keys USING (auth.uid() = user_id);
CREATE POLICY "Users can view own usage_tracking" ON usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage_tracking" ON usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own user_dashboard_stats" ON user_dashboard_stats USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own activities" ON activities USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own analytics_data" ON analytics_data USING (auth.uid() = user_id OR user_id IS NULL);

-- =============================================================================
-- Step 10: Grant permissions
-- =============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =============================================================================
-- Final verification
-- =============================================================================

SELECT 'Simple database reset and setup completed successfully!' as status;

SELECT 
    'Database ready for all AI apps: Content Writer, MultiLLM ChatGPT, Chat with PDF,' ||
    ' Voice Transcription, Headshot Generator, Image Generator, QR Generator,' ||
    ' Interior Design, YouTube Content, Image Upscaler, Chat with YouTube,' ||
    ' Text to Speech, Llama ChatGPT, Music Generator, DeepSeek Chat,' ||
    ' Gemini Chat, Ghibli Generator, Quiz & Flashcard Generator' as ready_message;

-- Show table count
SELECT COUNT(*) || ' tables created' as tables_status FROM information_schema.tables WHERE table_schema = 'public';

-- Show AI models count  
SELECT COUNT(*) || ' AI models installed' as models_status FROM ai_models;

-- Show subscription plans
SELECT COUNT(*) || ' subscription plans available' as plans_status FROM subscription_plans;
