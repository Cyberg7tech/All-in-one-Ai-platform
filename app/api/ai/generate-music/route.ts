import { NextRequest, NextResponse } from 'next/server';

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

    console.log('Music Generation API: Request received', {
      promptLength: prompt.length,
      genre,
      mood,
      duration
    });

    // Music generation is not available in the simplified OpenAI + Together AI setup
    // Return a demo response with information about alternatives
    return NextResponse.json({
      success: true,
      id: `music_demo_${Date.now()}`,
      status: 'completed',
      audio_url: '/api/demo-audio', // Use demo audio endpoint
      audioUrl: '/api/demo-audio', // Also provide audioUrl for frontend compatibility
      title: `Music Concept: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`,
      genre,
      duration,
      prompt,
      note: `Demo music track for your concept. 

**Your music concept**: "${prompt}"
**Genre**: ${genre} | **Mood**: ${mood} | **Duration**: ${duration}s

**To enable real AI music generation:**
1. **Suno AI**: Advanced AI music creation (suno.com)
2. **Mubert API**: AI-generated background music 
3. **AIVA**: AI composition platform (aiva.ai)
4. **Soundraw**: AI music generation tools
5. **Boomy**: Create original songs with AI
6. **Amper Music**: AI music composition
7. **Jukebox (OpenAI)**: Text-to-music generation

**API Integration Options:**
- **Suno API**: For professional music generation
- **Mubert API**: For background music and soundtracks
- **AIVA API**: For classical and cinematic music
- **Custom AI Models**: Using Replicate or Hugging Face`,
      provider: 'demo',
      metadata: {
        simplified_setup: true,
        available_providers: ['OpenAI', 'Together AI'],
        music_generation_available: false,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Music Generation API error:', error);
    return NextResponse.json(
      { 
        error: 'Music generation request failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        note: 'Music generation is not available in the simplified OpenAI + Together AI setup.'
      },
      { status: 500 }
    );
  }
} 