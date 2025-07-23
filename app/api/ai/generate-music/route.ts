import { NextRequest, NextResponse } from 'next/server';
import { AIAPIService } from '@/lib/ai/api-integration';

const apiService = AIAPIService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, genre = 'pop', mood = 'upbeat', duration = 30 } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('Music Generation API: Creating music', {
      promptLength: prompt.length,
      genre,
      mood,
      duration
    });

    try {
      const result = await apiService.generateMusicWithSuno(prompt, genre, duration);

      return NextResponse.json({
        success: true,
        id: result.id,
        status: result.status,
        audio_url: result.audio_url,
        title: result.title,
        genre: result.genre,
        duration: result.duration,
        prompt: result.prompt,
        note: result.note,
        provider: 'suno'
      });

    } catch (error) {
      console.error('Music generation error:', error);
      
      // Return demo response instead of error
      return NextResponse.json({
        success: true,
        id: `music_demo_${Date.now()}`,
        status: 'completed',
        audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        title: `Demo Music: ${prompt.substring(0, 30)}`,
        genre,
        duration,
        prompt,
        note: 'Demo mode - Music generation temporarily unavailable. Configure SUNO_API_KEY for real music creation.',
        provider: 'demo'
      });
    }

  } catch (error) {
    console.error('Music Generation API error:', error);
    return NextResponse.json(
      { 
        error: 'Music generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 