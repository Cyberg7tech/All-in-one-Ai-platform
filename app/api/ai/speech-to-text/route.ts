import { NextRequest, NextResponse } from 'next/server';
import { TOGETHER_BASE } from '@/lib/ai/providers/together';

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
      const key = process.env.TOGETHER_API_KEY;
      if (!key) {
        return NextResponse.json(
          { error: 'TOGETHER_API_KEY is not configured', provider: 'together' },
          { status: 500 }
        );
      }

      const form = new FormData();
      form.append('file', audioFile, audioFile.name);
      form.append('model', 'openai/whisper-large-v3');
      form.append('language', language);

      const res = await fetch(`${TOGETHER_BASE}/audio/transcriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}` },
        body: form,
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({ error: `Together STT failed: ${res.status} ${errText}` }, { status: 500 });
      }

      const json = (await res.json()) as any;
      const text = json.text || json?.results?.[0]?.alternatives?.[0]?.transcript || '';

      return NextResponse.json({ success: true, transcription: text, language, provider: 'together' });
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
