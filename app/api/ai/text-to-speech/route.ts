import { NextRequest, NextResponse } from 'next/server';
import { AIAPIService } from '@/lib/ai/api-integration';

const apiService = AIAPIService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice = 'alloy', voiceId, speed = 1.0, pitch = 1.0 } = body;

    // Handle both 'voice' and 'voiceId' parameter names
    const selectedVoice = voiceId || voice;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    console.log('Text-to-Speech API: Generating speech', {
      textLength: text.length,
      voice,
      speed,
      pitch,
    });

    try {
      const result = await apiService.generateSpeechWithElevenLabs(text, selectedVoice);

      // Check if the result is an error response
      if (result && typeof result === 'object' && 'error' in result && result.error) {
        // Return demo response instead of error
        return NextResponse.json({
          success: true,
          audioUrl: '/api/demo-audio',
          text,
          voice,
          note:
            result.content ||
            'Demo mode - Text-to-speech temporarily unavailable. Configure ELEVENLABS_API_KEY for real synthesis.',
          duration: Math.ceil(text.length / 10),
          provider: 'demo',
        });
      }

      return NextResponse.json({
        success: true,
        audioUrl: result.audio_url,
        text: result.text,
        voice: result.voice,
        note: result.note,
        duration: Math.ceil(text.length / 10), // Approximate duration
        provider: 'elevenlabs',
      });
    } catch (error) {
      console.error('Text-to-Speech generation error:', error);

      // Return demo response instead of error
      return NextResponse.json({
        success: true,
        audioUrl: '/api/demo-audio',
        text,
        voice,
        note: 'Demo mode - Text-to-speech temporarily unavailable. Configure ELEVENLABS_API_KEY for real synthesis.',
        duration: Math.ceil(text.length / 10),
        provider: 'demo',
      });
    }
  } catch (error) {
    console.error('Text-to-Speech API error:', error);
    return NextResponse.json(
      {
        error: 'Text-to-speech generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
