import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ttnkomdxbkmfmkaycjao.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bmtvbWR4YmttZm1rYXljamFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTcwMTgsImV4cCI6MjA2ODczMzAxOH0.ZpedifMgWW0XZzqq-CCkdHeiQb2HnzLZ8wXN03cjh7g'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bmtvbWR4YmttZm1rYXljamFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE1NzAxOCwiZXhwIjoyMDY4NzMzMDE4fQ.UOE8fFmFYqnCHKiA-MlfHEfxDxViasspD64trjmsMLI'

// Client for frontend operations
export const supabase = createClient(supabaseUrl, supabaseKey)

// Admin client for backend operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Enhanced database helpers for the One AI platform
export const dbHelpers = {
  // User Management
  async createUser(userData: {
    email: string;
    name: string;
    role?: string;
    subscription_plan?: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    return data;
  },

  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    return data;
  },

  // Chat Sessions
  async createChatSession(sessionData: {
    user_id: string;
    title: string;
    model_id: string;
    agent_id?: string;
  }) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
    return data;
  },

  async getChatSessions(userId: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select(`
        *,
        chat_messages (
          id,
          role,
          content,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat sessions:', error);
      return [];
    }
    return data;
  },

  // Chat Messages
  async addChatMessage(messageData: {
    session_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: any;
  }) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error('Error adding chat message:', error);
      throw error;
    }
    return data;
  },

  // AI Agents
  async createAgent(agentData: {
    user_id: string;
    name: string;
    description: string;
    type: string;
    model: string;
    system_prompt: string;
    tools?: string[];
    model_config?: any;
  }) {
    const { data, error } = await supabase
      .from('ai_agents')
      .insert(agentData)
      .select()
      .single();

    if (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
    return data;
  },

  async updateAgent(agentId: string, agentData: Partial<{
    name: string;
    description: string;
    type: string;
    model: string;
    system_prompt: string;
    tools: string[];
    model_config: any;
  }>) {
    const { data, error } = await supabase
      .from('ai_agents')
      .update(agentData)
      .eq('id', agentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
    return data;
  },

  async deleteAgent(agentId: string) {
    const { data, error } = await supabase
      .from('ai_agents')
      .delete()
      .eq('id', agentId)
      .select()
      .single();

    if (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
    return data;
  },

  async getUserAgents(userId: string) {
    const { data, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching agents:', error);
      return [];
    }
    return data;
  },

  // Document Embeddings Management
  async insertDocument(docData: {
    user_id: string;
    title: string;
    content: string;
    embedding: number[];
    metadata?: any;
  }) {
    // Note: This would require a documents table in the database
    // For now, we'll use generated_content table as a placeholder
    const { data, error } = await supabase
      .from('generated_content')
      .insert({
        user_id: docData.user_id,
        type: 'document',
        title: docData.title,
        metadata: {
          content: docData.content,
          embedding: docData.embedding,
          ...docData.metadata
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting document:', error);
      throw error;
    }
    return data;
  },

  async searchDocuments(userId: string, query: string, embedding: number[], limit: number = 10) {
    // This is a simplified implementation
    // In a real scenario, you'd use vector similarity search
    const { data, error } = await supabase
      .from('generated_content')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'document')
      .textSearch('title', query)
      .limit(limit);

    if (error) {
      console.error('Error searching documents:', error);
      return [];
    }
    return data;
  },

  // Anomaly Detection
  async createAnomalyDetection(anomalyData: {
    user_id: string;
    dataset_name: string;
    algorithm: string;
    config: any;
    results?: any;
  }) {
    // Store anomaly detection data in analytics_data table
    const { data, error } = await supabase
      .from('analytics_data')
      .insert({
        user_id: anomalyData.user_id,
        metric_name: 'anomaly_detection',
        metric_value: 1,
        metric_type: 'detection',
        time_period: 'custom',
        metadata: {
          dataset_name: anomalyData.dataset_name,
          algorithm: anomalyData.algorithm,
          config: anomalyData.config,
          results: anomalyData.results
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating anomaly detection:', error);
      throw error;
    }
    return data;
  },

  async getAnomalyDetections(userId: string) {
    const { data, error } = await supabase
      .from('analytics_data')
      .select('*')
      .eq('user_id', userId)
      .eq('metric_name', 'anomaly_detection')
      .order('recorded_at', { ascending: false });

    if (error) {
      console.error('Error fetching anomaly detections:', error);
      return [];
    }
    return data;
  },

  // Forecasting
  async createForecast(forecastData: {
    user_id: string;
    dataset_name: string;
    model_type: string;
    config: any;
    predictions?: any;
  }) {
    const { data, error } = await supabase
      .from('analytics_data')
      .insert({
        user_id: forecastData.user_id,
        metric_name: 'forecast',
        metric_value: 1,
        metric_type: 'prediction',
        time_period: 'future',
        metadata: {
          dataset_name: forecastData.dataset_name,
          model_type: forecastData.model_type,
          config: forecastData.config,
          predictions: forecastData.predictions
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating forecast:', error);
      throw error;
    }
    return data;
  },

  async getForecasts(userId: string) {
    const { data, error } = await supabase
      .from('analytics_data')
      .select('*')
      .eq('user_id', userId)
      .eq('metric_name', 'forecast')
      .order('recorded_at', { ascending: false });

    if (error) {
      console.error('Error fetching forecasts:', error);
      return [];
    }
    return data;
  },

  // Usage Tracking
  async trackUsage(usageData: {
    user_id: string;
    model_id: string;
    tokens_used: number;
    cost: number;
    feature_type: 'chat' | 'image' | 'video' | 'audio' | 'embedding';
  }) {
    const { data, error } = await supabase
      .from('usage_tracking')
      .insert(usageData)
      .select()
      .single();

    if (error) {
      console.error('Error tracking usage:', error);
      // Don't throw error for usage tracking to avoid breaking main flow
      return null;
    }
    return data;
  },

  async getUserUsage(userId: string, timeframe: 'day' | 'week' | 'month' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error('Error fetching usage:', error);
      return [];
    }
    return data;
  },

  // Initialize Database Schema (run once)
  async initializeSchema() {
    try {
      console.log('Initializing database schema...');
      
      // This would be better handled through Supabase migrations
      // For now, we'll create tables if they don't exist
      
      // Enable Row Level Security and create policies through Supabase dashboard
      // The actual table creation should be done through Supabase SQL Editor
      
      console.log('Schema initialization requires manual setup through Supabase dashboard');
      console.log('Please run the SQL in supabase/schema.sql through your Supabase SQL Editor');
      
      return true;
    } catch (error) {
      console.error('Error initializing schema:', error);
      return false;
    }
  }
}

export default supabase 