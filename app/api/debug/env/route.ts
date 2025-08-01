import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Debug route to check environment variables in production
  const envDebug = {
    NODE_ENV: process.env.NODE_ENV,
    hasTogetherKey: !!process.env.TOGETHER_API_KEY,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasSupabaseService: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasHeygenKey: !!process.env.HEYGEN_API_KEY,
    hasAimlKey: !!process.env.AIML_API_KEY,
    hasElevenLabsKey: !!process.env.ELEVENLABS_API_KEY,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    // Show first few characters to verify keys are loaded
    togetherKeyPreview: process.env.TOGETHER_API_KEY ? process.env.TOGETHER_API_KEY.substring(0, 8) + '...' : 'NOT_SET',
    supabaseUrlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + '...' : 'NOT_SET',
  };

  return NextResponse.json({
    success: true,
    environment: envDebug,
    timestamp: new Date().toISOString()
  });
}