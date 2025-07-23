export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: number
          content: string
          metadata: Json
          embedding: number[]
          created_at: string
        }
        Insert: {
          id?: number
          content: string
          metadata?: Json
          embedding: number[]
          created_at?: string
        }
        Update: {
          id?: number
          content?: string
          metadata?: Json
          embedding?: number[]
          created_at?: string
        }
      }
      ai_agents: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          system_prompt: string
          tools: Json
          model_config: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          system_prompt: string
          tools?: Json
          model_config?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          system_prompt?: string
          tools?: Json
          model_config?: Json
          created_at?: string
          updated_at?: string
        }
      }
      forecasting_models: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          config: Json
          training_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          config?: Json
          training_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          config?: Json
          training_data?: Json
          created_at?: string
        }
      }
      anomaly_detections: {
        Row: {
          id: string
          user_id: string
          name: string
          data_source: string
          threshold_config: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          data_source: string
          threshold_config?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          data_source?: string
          threshold_config?: Json
          created_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          agent_id: string | null
          model_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          agent_id?: string | null
          model_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          agent_id?: string | null
          model_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          model_id: string
          tokens_used: number
          cost: number
          feature_type: 'chat' | 'image' | 'video' | 'audio' | 'embedding'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          model_id: string
          tokens_used: number
          cost: number
          feature_type: 'chat' | 'image' | 'video' | 'audio' | 'embedding'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          model_id?: string
          tokens_used?: number
          cost?: number
          feature_type?: 'chat' | 'image' | 'video' | 'audio' | 'embedding'
          created_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: 'free' | 'pro' | 'enterprise'
          status: 'active' | 'cancelled' | 'past_due'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          stripe_subscription_id: string | null
          lemon_squeezy_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: 'free' | 'pro' | 'enterprise'
          status?: 'active' | 'cancelled' | 'past_due'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          stripe_subscription_id?: string | null
          lemon_squeezy_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: 'free' | 'pro' | 'enterprise'
          status?: 'active' | 'cancelled' | 'past_due'
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          stripe_subscription_id?: string | null
          lemon_squeezy_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workflows: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          nodes: Json
          edges: Json
          triggers: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          nodes?: Json
          edges?: Json
          triggers?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          nodes?: Json
          edges?: Json
          triggers?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_documents: {
        Args: {
          query_embedding: number[]
          match_count?: number
          filter?: Json
        }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Additional utility types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific entity types
export type AIAgent = Tables<'ai_agents'>
export type Document = Tables<'documents'>
export type ForecastingModel = Tables<'forecasting_models'>
export type AnomalyDetection = Tables<'anomaly_detections'>
export type ChatSession = Tables<'chat_sessions'>
export type ChatMessage = Tables<'chat_messages'>
export type UsageTracking = Tables<'usage_tracking'>
export type UserSubscription = Tables<'user_subscriptions'>
export type Workflow = Tables<'workflows'> 