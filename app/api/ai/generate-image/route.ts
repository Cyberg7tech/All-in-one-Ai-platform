import { NextRequest, NextResponse } from 'next/server';
// Together-only implementation; legacy OpenAI path removed

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const {
      prompt,
      model = 'dall-e-3',
      size = '1024x1024',
      style = 'vivid',
      quality = 'standard',
    } = await request.json();

    console.log('Image Generation API: Request received', {
      promptLength: prompt?.length,
      model,
      size,
      style,
      quality,
    });

    if (!prompt || typeof prompt !== 'string') {
      console.error('Image Generation API: Invalid prompt', { prompt });
      return NextResponse.json(
        {
          success: false,
          error: 'Prompt is required and must be a string',
          images: [],
          metadata: {
            model,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    if (prompt.length > 4000) {
      console.error('Image Generation API: Prompt too long', { length: prompt.length });
      return NextResponse.json(
        {
          success: false,
          error: 'Prompt is too long. Please keep it under 4000 characters.',
          images: [],
          metadata: {
            model,
            prompt: prompt.substring(0, 100) + '...',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Together-only implementation; no OpenAI result variable

    if (model !== 'dall-e-3' && model !== 'dall-e-2') {
      // Try Together images endpoint
      if (!process.env.TOGETHER_API_KEY) {
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported model "${model}" and TOGETHER_API_KEY not configured.`,
            images: [],
          },
          { status: 400 }
        );
      }

      const togetherRes = await fetch('https://api.together.xyz/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        },
        body: JSON.stringify({ model, prompt, size }),
      });
      const tj = await togetherRes.json().catch(() => ({}));
      if (!togetherRes.ok) {
        return NextResponse.json(
          {
            success: false,
            error: tj?.error || `Together image generation failed for model ${model}`,
            images: [],
          },
          { status: 500 }
        );
      }
      const imageUrl = tj?.data?.[0]?.url || tj?.image_url || null;
      if (!imageUrl) {
        return NextResponse.json(
          { success: false, error: 'No image returned from Together', images: [] },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        images: [imageUrl],
        metadata: { model, provider: 'together' },
      });
    }

    // If user explicitly chose DALL·E, but we are Together-only, return a helpful message
    return NextResponse.json(
      {
        success: false,
        error:
          'DALL·E models are disabled in Together-only mode. Please choose a Together image model (e.g., black-forest-labs/FLUX.1-dev).',
        images: [],
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Image Generation API: Unexpected error', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate image. Please try again.',
        images: [],
        metadata: {
          timestamp: new Date().toISOString(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
