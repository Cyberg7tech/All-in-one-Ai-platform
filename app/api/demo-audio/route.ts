import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Generate a simple WAV file with a beep sound
    const sampleRate = 44100;
    const duration = 1; // 1 second
    const frequency = 440; // A4 note
    const samples = sampleRate * duration;

    // Create WAV file buffer
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);

    // Generate audio samples
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * 0.3;
      view.setInt16(44 + i * 2, sample * 32767, true);
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Demo audio generation error:', error);
    return NextResponse.json({ error: 'Failed to generate demo audio' }, { status: 500 });
  }
}
