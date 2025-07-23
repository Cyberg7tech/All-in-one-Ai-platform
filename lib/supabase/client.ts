import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Client-side Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service key
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database helper functions
export const dbHelpers = {
  // Vector similarity search
  async searchDocuments(
    query_embedding: number[],
    match_count: number = 10,
    filter: Record<string, any> = {}
  ) {
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding,
      match_count,
      filter
    });

    if (error) throw error;
    return data;
  },

  // Insert document with embedding
  async insertDocument(content: string, metadata: Record<string, any>, embedding: number[]) {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        content,
        metadata,
        embedding
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // AI Agents CRUD
  async createAgent(agent: {
    name: string;
    description: string;
    system_prompt: string;
    tools: any[];
    model_config: Record<string, any>;
    user_id: string;
  }) {
    const { data, error } = await supabase
      .from('ai_agents')
      .insert(agent)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserAgents(userId: string) {
    const { data, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateAgent(id: string, updates: Partial<{
    name: string;
    description: string;
    system_prompt: string;
    tools: any[];
    model_config: Record<string, any>;
  }>) {
    const { data, error } = await supabase
      .from('ai_agents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAgent(id: string) {
    const { error } = await supabase
      .from('ai_agents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Forecasting Models CRUD
  async createForecastingModel(model: {
    name: string;
    type: string;
    config: Record<string, any>;
    training_data: any;
    user_id: string;
  }) {
    const { data, error } = await supabase
      .from('forecasting_models')
      .insert(model)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserForecastingModels(userId: string) {
    const { data, error } = await supabase
      .from('forecasting_models')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Anomaly Detection CRUD
  async createAnomalyDetection(detection: {
    name: string;
    data_source: string;
    threshold_config: Record<string, any>;
    user_id: string;
  }) {
    const { data, error } = await supabase
      .from('anomaly_detections')
      .insert(detection)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserAnomalyDetections(userId: string) {
    const { data, error } = await supabase
      .from('anomaly_detections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Chat Sessions CRUD
  async createChatSession(session: {
    title: string;
    agent_id?: string;
    model_id: string;
    user_id: string;
  }) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserChatSessions(userId: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Chat Messages CRUD
  async addChatMessage(message: {
    session_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: Record<string, any>;
  }) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getChatMessages(sessionId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // User Usage Tracking
  async trackUsage(usage: {
    user_id: string;
    model_id: string;
    tokens_used: number;
    cost: number;
    feature_type: 'chat' | 'image' | 'video' | 'audio' | 'embedding';
  }) {
    const { data, error } = await supabase
      .from('usage_tracking')
      .insert(usage)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserUsage(userId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}; 