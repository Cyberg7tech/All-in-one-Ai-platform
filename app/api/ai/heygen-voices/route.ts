import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const heygenApiKey = process.env.HEYGEN_API_KEY;

    if (!heygenApiKey) {
      return NextResponse.json({ error: 'HeyGen API key not configured' }, { status: 500 });
    }

    console.log('Fetching HeyGen voices and avatars...');

    // Fetch voices and avatars in parallel
    const [voicesResponse, avatarsResponse] = await Promise.all([
      fetch('https://api.heygen.com/v2/voices', {
        method: 'GET',
        headers: {
          'X-API-KEY': heygenApiKey,
        },
      }),
      fetch('https://api.heygen.com/v2/avatars', {
        method: 'GET',
        headers: {
          'X-API-KEY': heygenApiKey,
        },
      }),
    ]);

    if (!voicesResponse.ok) {
      const errorText = await voicesResponse.text();
      console.error('HeyGen Voices API Error:', voicesResponse.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch voices: ${voicesResponse.status}` },
        { status: voicesResponse.status }
      );
    }

    if (!avatarsResponse.ok) {
      const errorText = await avatarsResponse.text();
      console.error('HeyGen Avatars API Error:', avatarsResponse.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch avatars: ${avatarsResponse.status}` },
        { status: avatarsResponse.status }
      );
    }

    const voicesData = await voicesResponse.json();
    const avatarsData = await avatarsResponse.json();

    console.log('HeyGen API Success:', {
      voicesCount: voicesData.data?.length || 0,
      avatarsCount: avatarsData.data?.length || 0,
    });

    // Extract voice IDs and avatar IDs for mapping
    const voices =
      voicesData.data && Array.isArray(voicesData.data)
        ? voicesData.data.slice(0, 10).map((voice: any) => ({
            id: voice.voice_id,
            name: voice.name,
            gender: voice.gender,
            language: voice.language,
            language_code: voice.language_code,
            preview_audio: voice.preview_audio,
          }))
        : [];

    const avatars =
      avatarsData.data && Array.isArray(avatarsData.data)
        ? avatarsData.data.slice(0, 10).map((avatar: any) => ({
            id: avatar.avatar_id,
            name: avatar.name,
            gender: avatar.gender,
            preview_image: avatar.preview_image_url || avatar.thumbnail_image_url,
          }))
        : [];

    return NextResponse.json({
      success: true,
      voices,
      avatars,
      message: `Found ${voices.length} voices and ${avatars.length} avatars`,
    });
  } catch (error) {
    console.error('HeyGen API fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch HeyGen data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
