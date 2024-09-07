import { Database } from './supabase';

// CONTENT WRITER
export type TypeContent = Database['public']['Tables']['content_creations']['Row'];

// MULTILLM CHATGPT
export type TypeMultiLLmChatGPT = Database['public']['Tables']['multillm_chatgpt']['Row'];

export type TypeSaveChat = Database['public']['Tables']['multillm_chatgpt']['Update'];

// CHAT WITH PDF
export type TypeChat = Database['public']['Tables']['chat_with_file']['Row'];

export type TypeUpdateChat = Database['public']['Tables']['chat_with_file']['Update'];

// HEADSHOT GENERATOR
export type TypeHeadshotModel = Database['public']['Tables']['headshot_models']['Row'];

export type TypeHeadshotGeneration = Database['public']['Tables']['headshot_generations']['Row'];

// HEADSHOT GENERATOR
export type TypeAudio = Database['public']['Tables']['voice_transcriptions']['Row'];
