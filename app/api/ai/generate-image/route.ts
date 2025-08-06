import { NextRequest, NextResponse } from 'next/server';
import { AIAPIService } from '@/lib/ai/api-integration';

const apiService = AIAPIService.getInstance();

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

    let result;

    if (model === 'dall-e-3' || model === 'dall-e-2') {
      console.log('Image Generation API: Using DALL-E', { model, prompt: prompt.substring(0, 100) });

      // Use OpenAI DALL-E for image generation
      const dalleStyle = model === 'dall-e-3' && ['vivid', 'natural'].includes(style) ? style : undefined;

      result = await apiService.generateImageWithDALLE(prompt, {
        model,
        size,
        style: dalleStyle,
        quality: model === 'dall-e-3' ? quality : undefined,
      });

      console.log('Image Generation API: DALL-E result', {
        success: !result.error,
        hasImageUrl: !!result.image_url,
        error: result.error,
      });

      // Handle the API response format
      if (result.error) {
        return NextResponse.json(
          {
            success: false,
            error: result.content,
            images: [],
            metadata: {
              model,
              prompt,
              provider: 'openai',
              timestamp: new Date().toISOString(),
            },
          },
          { status: 500 }
        );
      }

      // Return successful response
      return NextResponse.json({
        success: true,
        images: [result.image_url],
        metadata: {
          model: result.model,
          prompt: result.prompt,
          provider: result.provider,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      // Unsupported model
      console.error('Image Generation API: Unsupported model', { model });
      return NextResponse.json(
        {
          success: false,
          error: `Image generation model "${model}" is not supported. Please use "dall-e-3" or "dall-e-2".`,
          images: [],
          availableModels: ['dall-e-3', 'dall-e-2'],
          metadata: {
            model,
            prompt,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }
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
