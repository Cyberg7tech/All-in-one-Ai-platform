import { NextRequest, NextResponse } from 'next/server';
import { AIAPIService } from '@/lib/ai/api-integration';

const apiService = AIAPIService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model = 'dall-e-3', size = '1024x1024', style = 'vivid', quality = 'standard' } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    let imageUrls: string[] = [];

    if (model === 'dall-e-3') {
      // Map frontend styles to DALL-E accepted values
      const dalleStyle = ['vivid', 'natural'].includes(style) ? style : 'vivid';
      
      imageUrls = await apiService.generateImageWithDALLE(prompt, {
        size,
        style: dalleStyle,
        quality,
        n: 1
      });
    } else if (model === 'stable-diffusion') {
      // Use Replicate for Stable Diffusion
      const output = await apiService.callReplicate(
        'stability-ai/stable-diffusion-xl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
        {
          prompt,
          width: parseInt(size.split('x')[0]),
          height: parseInt(size.split('x')[1]),
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50
        }
      );
      imageUrls = Array.isArray(output) ? output : [output];
    }

    return NextResponse.json({
      success: true,
      images: imageUrls,
      prompt,
      model,
      metadata: {
        size,
        style,
        quality,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { 
        error: 'Image generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 