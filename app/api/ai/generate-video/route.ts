import { NextRequest, NextResponse } from 'next/server';
import { AIAPIService } from '@/lib/ai/api-integration';

const apiService = AIAPIService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, imageUrl, duration = 4 } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const result = await apiService.generateVideoWithRunway(prompt, imageUrl);

    return NextResponse.json({
      success: true,
      video: result,
      prompt,
      metadata: {
        duration,
        imageUrl,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { 
        error: 'Video generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 