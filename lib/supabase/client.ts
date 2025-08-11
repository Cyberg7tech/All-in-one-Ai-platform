'use client';

import { createBrowserClient } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';

// Singleton client instance to prevent multiple GoTrueClient instances
let _client: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('Supabase client called on server');
  }

  // Return existing client if available
  if (_client) {
    return _client;
  }

  // Create new client only if one doesn't exist
  _client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Store reference for debugging
  if (typeof window !== 'undefined') {
    (window as any).__supabaseInstance = _client;
  }

  return _client;
};

// Admin operations must be performed via server routes; no service role client in browser

// Enhanced database helpers for the One AI platform
export const dbHelpers = {
  // User Management
  async createUser(userData: { email: string; name: string; role?: string; subscription_plan?: string }) {
    const res = await fetch('/api/models/ensure', { method: 'HEAD' }).catch(() => null);
    if (!res) {
      console.warn('Admin operations are not available on client; create user via server API');
    }
    const { data, error } = await getSupabaseClient().from('users').insert(userData).select().single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    return data;
  },

  async getUserById(userId: string) {
    const { data, error } = await getSupabaseClient().from('users').select('*').eq('id', userId).single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    return data;
  },

  // Chat Sessions
  async ensureModelExists(modelId: string) {
    try {
      // Check if model exists
      const { data: existing } = await getSupabaseClient()
        .from('ai_models')
        .select('id')
        .eq('id', modelId)
        .single();

      if (existing?.id) return existing;

      // Try to infer provider from id
      const lower = modelId.toLowerCase();
      const inferredProvider = lower.includes('gpt')
        ? 'openai'
        : lower.includes('claude')
          ? 'anthropic'
          : lower.includes('gemini')
            ? 'google'
            : lower.includes('deepseek')
              ? 'deepseek'
              : lower.includes('llama') || lower.includes('qwen') || lower.includes('mistral')
                ? 'together'
                : 'together';

      // Insert minimal row; if RLS blocks, try admin client
      let insertError: any = null;
      let inserted: any = null;
      try {
        const { data, error } = await getSupabaseClient()
          .from('ai_models')
          .insert({ id: modelId, name: modelId, provider: inferredProvider })
          .select()
          .single();
        inserted = data;
        insertError = error;
      } catch (e) {
        insertError = e;
      }

      if (insertError) {
        // Fallback to admin client when available (project already exposes admin client)
        // Fallback to server endpoint to ensure model (uses service role on server)
        const ensureRes = await fetch('/api/models/ensure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: modelId }),
        }).catch(() => null);
        if (ensureRes && ensureRes.ok) {
          const json = await ensureRes.json();
          return json.model || null;
        }
        throw insertError;
      }

      return inserted;
    } catch (error) {
      console.error('ensureModelExists error:', error);
      // Best-effort; continue even if we could not insert
      return null;
    }
  },

  async createChatSession(sessionData: {
    user_id: string;
    title: string;
    model_id: string;
    agent_id?: string;
  }) {
    // Make sure referenced model exists to satisfy FK constraint
    // First try server ensure endpoint (avoids RLS issues on client)
    try {
      await fetch('/api/models/ensure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sessionData.model_id }),
      });
    } catch {
      // No-op if offline
    }
    await dbHelpers.ensureModelExists(sessionData.model_id);

    const { data, error } = await getSupabaseClient()
      .from('chat_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      // Retry once if FK violation occurs by ensuring model again
      if ((error as any)?.code === '23503') {
        await dbHelpers.ensureModelExists(sessionData.model_id);
        const retry = await getSupabaseClient().from('chat_sessions').insert(sessionData).select().single();
        if (retry.error) {
          console.error('Error creating chat session (retry):', retry.error);
          throw retry.error;
        }
        return retry.data as any;
      }
      console.error('Error creating chat session:', error);
      throw error;
    }
    return data;
  },

  async getChatSessions(userId: string) {
    try {
      // First get the chat sessions
      const { data: sessions, error: sessionsError } = await getSupabaseClient()
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (sessionsError) {
        console.error('Error fetching chat sessions:', sessionsError);
        return [];
      }

      // Then get messages for each session
      const sessionsWithMessages = await Promise.all(
        (sessions || []).map(async (session: any) => {
          const { data: messages, error: messagesError } = await getSupabaseClient()
            .from('chat_messages')
            .select('*')
            .eq('session_id', String(session.id))
            .order('created_at', { ascending: true });

          if (messagesError) {
            console.error('Error fetching messages for session:', String(session.id), messagesError);
            return {
              ...session,
              chat_messages: [],
            };
          }

          return {
            ...session,
            chat_messages: messages || [],
          };
        })
      );

      return sessionsWithMessages;
    } catch (error) {
      console.error('Error in getChatSessions:', error);
      return [];
    }
  },

  async deleteChatSession(sessionId: string) {
    const { data, error } = await getSupabaseClient()
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .select()
      .single();
    if (error) {
      console.error('Error deleting chat session:', error);
      throw error;
    }
    return data;
  },

  async updateChatSession(
    sessionId: string,
    updates: {
      title?: string;
      model_id?: string;
      agent_id?: string;
    }
  ) {
    const { data, error } = await getSupabaseClient()
      .from('chat_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();
    if (error) {
      console.error('Error updating chat session:', error);
      throw error;
    }
    return data;
  },

  // AI Models
  async getAIModels() {
    const { data, error } = await getSupabaseClient()
      .from('ai_models')
      .select('*')
      .order('provider')
      .order('name');
    if (error) {
      console.error('Error fetching AI models:', error);
      throw error;
    }
    return data;
  },

  // Chat Messages
  async addChatMessage(messageData: {
    session_id: string;
    user_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    tokens_used?: number;
    model_used?: string;
    cost?: number;
    metadata?: any;
  }) {
    const { data, error } = await getSupabaseClient()
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
    const { data, error } = await getSupabaseClient().from('ai_agents').insert(agentData).select().single();

    if (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
    return data;
  },

  async updateAgent(
    agentId: string,
    agentData: Partial<{
      name: string;
      description: string;
      type: string;
      model: string;
      system_prompt: string;
      tools: string[];
      model_config: any;
    }>
  ) {
    const { data, error } = await getSupabaseClient()
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
    const { data, error } = await getSupabaseClient()
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
    const { data, error } = await getSupabaseClient()
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
    const { data, error } = await getSupabaseClient()
      .from('generated_content')
      .insert({
        user_id: docData.user_id,
        type: 'document',
        title: docData.title,
        metadata: {
          content: docData.content,
          embedding: docData.embedding,
          ...docData.metadata,
        },
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
    const { data, error } = await getSupabaseClient()
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
    const { data, error } = await getSupabaseClient()
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
          results: anomalyData.results,
        },
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
    const { data, error } = await getSupabaseClient()
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
    const { data, error } = await getSupabaseClient()
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
          predictions: forecastData.predictions,
        },
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
    const { data, error } = await getSupabaseClient()
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
    const { data, error } = await getSupabaseClient()
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

    const { data, error } = await getSupabaseClient()
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

  // Get user activities
  async getUserActivities(userId: string, limit: number = 10) {
    const { data, error } = await getSupabaseClient()
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
    return data;
  },

  // Add activity
  async addActivity(
    userId: string,
    type: string,
    name: string,
    description?: string,
    icon?: string,
    metadata?: any
  ) {
    const { data, error } = await getSupabaseClient()
      .from('activities')
      .insert({
        user_id: userId,
        type,
        name,
        description,
        icon,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding activity:', error);
      return null;
    }
    return data;
  },

  // Get analytics data
  async getAnalyticsData(userId: string, timeRange: string = '7d') {
    const { data, error } = await getSupabaseClient()
      .from('analytics_data')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', new Date(Date.now() - this.getTimeRangeMs(timeRange)).toISOString())
      .order('recorded_at', { ascending: true });

    if (error) {
      console.error('Error fetching analytics:', error);
      return [];
    }
    return data;
  },

  // Add analytics data point
  async addAnalyticsData(
    userId: string,
    metricName: string,
    metricValue: number,
    metricType: string,
    timePeriod: string,
    metadata?: any
  ) {
    const { data, error } = await getSupabaseClient()
      .from('analytics_data')
      .insert({
        user_id: userId,
        metric_name: metricName,
        metric_value: metricValue,
        metric_type: metricType,
        time_period: timePeriod,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding analytics data:', error);
      return null;
    }
    return data;
  },

  // Helper function to convert time range to milliseconds
  getTimeRangeMs(timeRange: string): number {
    switch (timeRange) {
      case '7d':
        return 7 * 24 * 60 * 60 * 1000;
      case '30d':
        return 30 * 24 * 60 * 60 * 1000;
      case '90d':
        return 90 * 24 * 60 * 60 * 1000;
      case '1y':
        return 365 * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
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
  },
};
