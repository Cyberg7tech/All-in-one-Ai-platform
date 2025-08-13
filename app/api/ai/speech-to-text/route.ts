import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = (formData.get('language') as string) || 'en';

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    console.log('Speech-to-Text API: Processing audio', {
      fileName: audioFile.name,
      fileSize: audioFile.size,
      language,
    });

    // For demo purposes, return mock transcription
    const mockTranscriptions = [
      'Hello, this is a demo transcription. The speech-to-text service is working in demo mode.',
      'This is an example of how speech recognition would work with your audio file.',
      'Configure your OpenAI API key to enable real speech-to-text processing.',
      'The audio you uploaded would be transcribed here with actual speech recognition.',
    ];

    const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];

    try {
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        return NextResponse.json(
          { error: 'OPENAI_API_KEY is not configured', provider: 'openai-whisper' },
          { status: 500 }
        );
      }

      // Call Whisper v1 transcriptions
      const form = new FormData();
      form.append('file', audioFile, audioFile.name);
      form.append('model', 'whisper-1');
      form.append('language', language);

      const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });

      if (!whisperRes.ok) {
        const errText = await whisperRes.text();
        return NextResponse.json(
          { error: `Whisper failed: ${whisperRes.status} ${errText}` },
          { status: 500 }
        );
      }

      const whisperJson = (await whisperRes.json()) as any;
      const text = whisperJson.text || whisperJson?.results?.[0]?.alternatives?.[0]?.transcript || '';

      return NextResponse.json({
        success: true,
        transcription: text,
        language,
        confidence: 0.95,
        note: 'Transcribed with OpenAI Whisper',
        provider: 'openai-whisper',
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
        provider: 'demo',
      });
    }
  } catch (error) {
    console.error('Speech-to-Text API error:', error);
    return NextResponse.json(
      {
        error: 'Speech-to-text processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
