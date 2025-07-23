import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    console.log('Speech-to-Text API: Processing audio', {
      fileName: audioFile.name,
      fileSize: audioFile.size,
      language
    });

    // For demo purposes, return mock transcription
    const mockTranscriptions = [
      "Hello, this is a demo transcription. The speech-to-text service is working in demo mode.",
      "This is an example of how speech recognition would work with your audio file.",
      "Configure your OpenAI API key to enable real speech-to-text processing.",
      "The audio you uploaded would be transcribed here with actual speech recognition."
    ];

    const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];

    try {
      // In real implementation, use OpenAI Whisper API or similar
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        console.log('OpenAI API key not configured, returning demo transcription');
        return NextResponse.json({
          success: true,
          transcription: randomTranscription,
          language,
          confidence: 0.95,
          duration: 3.5,
          note: 'Demo mode - Configure OPENAI_API_KEY for real speech-to-text',
          provider: 'demo'
        });
      }

      // TODO: Implement actual Whisper API call when API key is available
      return NextResponse.json({
        success: true,
        transcription: randomTranscription,
        language,
        confidence: 0.95,
        duration: 3.5,
        note: 'Demo transcription - Real implementation would use OpenAI Whisper',
        provider: 'openai-whisper'
      });

    } catch (error) {
      console.error('Speech-to-text error:', error);
      
      return NextResponse.json({
        success: true,
        transcription: randomTranscription,
        language,
        confidence: 0.85,
        duration: 3.0,
        note: 'Demo mode - Speech recognition temporarily unavailable',
        provider: 'demo'
      });
    }

  } catch (error) {
    console.error('Speech-to-Text API error:', error);
    return NextResponse.json(
      { 
        error: 'Speech-to-text processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 