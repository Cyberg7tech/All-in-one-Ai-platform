import { NextRequest, NextResponse } from 'next/server';
import { AIAPIService } from '@/lib/ai/api-integration';

const apiService = AIAPIService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, duration = 30, genre, mood } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const result = await apiService.generateMusicWithSuno(prompt, {
      duration,
      genre,
      mood
    });

    return NextResponse.json({
      success: true,
      music: result,
      prompt,
      metadata: {
        duration,
        genre,
        mood,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Music generation error:', error);
    return NextResponse.json(
      { 
        error: 'Music generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 