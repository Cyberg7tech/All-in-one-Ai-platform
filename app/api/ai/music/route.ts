import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { prompt, genre, mood, duration = 30, tempo = 120 } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    // Together currently focuses on text/image/audio processing; text-to-music availability varies.
    // Provide clear message if no music provider is configured.
    const hasProvider = !!process.env.TOGETHER_API_KEY;
    if (!hasProvider) {
      return NextResponse.json(
        {
          error:
            'No music generation provider configured. Please set TOGETHER_API_KEY or integrate a music model provider.',
          supported: [],
        },
        { status: 501 }
      );
    }

    // Placeholder: Return demo audio when Together music is not available in the environment
    const demoAudio =
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+f3xm8iBkPE2N+AOxAPU6zg5bNmGgU+ltryuWMdBD2a4vC2YxsEPZPY88p9KgUme8j13IQ7DhBYpuXp';

    return NextResponse.json({
      success: true,
      track: {
        url: demoAudio,
        title: `${prompt.slice(0, 20)} (${genre || 'general'})`,
        meta: { mood, duration, tempo, provider: 'demo' },
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Music generation failed' }, { status: 500 });
  }
}
