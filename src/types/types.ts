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

// IMAGE GENERATOR
export type TypeImageGeneration = Database['public']['Tables']['image_generations']['Row'];

// QR CODE GENERATOR
export type TypeQrCodeGeneration = Database['public']['Tables']['qr_code_generations']['Row'];

// INTERIOR DESIGN
export type TypeInteriorDesign = Database['public']['Tables']['interior_designs']['Row'];

// TEXT TO SPEECH
export type TypeTTS = Database['public']['Tables']['text_to_speech']['Row'];

// MUSIC GENERATOR
export type TypeMusic = Database['public']['Tables']['music_generations']['Row'];

// LLAMA 3.1 CHATGPT
export type TypeLlamaGPT = Database['public']['Tables']['llamagpt']['Row'];

export type TypeSaveLlamaChat = Database['public']['Tables']['llamagpt']['Update'];

// IMAGE ENHANCER UPSCALER
export type TypeImageEnhancerUpscaler = Database['public']['Tables']['image_enhancer_upscaler']['Row'];

// YOUTUBE CONTENT GENERATOR
export type TypeYoutubeContent = Database['public']['Tables']['youtube_content_generator']['Row'];

// CHAT WITH YOUTUBE
export type TypeYoutubeChat = Database['public']['Tables']['chat_with_youtube']['Row'];
