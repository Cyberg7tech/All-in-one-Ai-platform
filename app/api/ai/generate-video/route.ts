import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      imageUrl,
      style,
      duration = 5,
      resolution = '1280x720',
      aspectRatio = '16:9',
      userId,
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log('Video Generation API: Request received', {
      promptLength: prompt.length,
      hasImageUrl: !!imageUrl,
      style,
      duration,
      resolution,
      aspectRatio,
    });

    // Check if we have AI/ML API key for Runway
    const aimlApiKey = process.env.AIML_API_KEY;

    if (!aimlApiKey) {
      console.log('Video Generation: No AIML API key found, returning demo response');
      return NextResponse.json({
        success: true,
        id: `video_demo_${Date.now()}`,
        status: 'completed',
        video_url: null,
        thumbnail_url: 'https://via.placeholder.com/320x180/3B82F6/FFFFFF?text=Video+Concept',
        title: `Video Concept: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`,
        prompt,
        duration: duration || 5,
        created_at: new Date().toISOString(),
        note: `Video generation requires AIML_API_KEY environment variable.

**To enable real video generation:**
1. Get an API key from aimlapi.com
2. Add AIML_API_KEY to your .env.local file
3. Restart your application

**Your video concept**: "${prompt}"
${imageUrl ? `**Source image**: Provided` : '**Type**: Text-to-video'}

**Alternative Solutions:**
- **Runway ML**: Visit runwayml.com for AI video creation
- **Pika Labs**: Visit pika.art for AI video tools  
- **Luma AI**: Visit lumalabs.ai for Dream Machine`,
        provider: 'demo',
        metadata: {
          needs_aiml_api_key: true,
          available_providers: ['OpenAI', 'Together AI'],
          video_generation_available: false,
          input_image_provided: !!imageUrl,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Generate video with Runway Gen-4 Turbo
    console.log('Video Generation: Using Runway Gen-4 Turbo API');

    const requestBody: any = {
      model: 'runway/gen4_turbo',
      prompt: prompt.trim(),
      duration: duration || 5,
      ratio: aspectRatio || '16:9',
      seed: Math.floor(Math.random() * 1000000),
      watermark: false,
    };

    // Add image URL if provided
    if (imageUrl) {
      requestBody.image_url = imageUrl;
    }

    const runwayResponse = await fetch('https://api.aimlapi.com/v1/video/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${aimlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!runwayResponse.ok) {
      const errorText = await runwayResponse.text();
      console.error('Runway API Error:', runwayResponse.status, errorText);

      return NextResponse.json(
        {
          success: false,
          error: `Video generation failed: ${runwayResponse.status}`,
          details: errorText,
          note: 'Check your AIML API key and credits',
        },
        { status: 500 }
      );
    }

    const runwayData = await runwayResponse.json();
    console.log('Runway API Response:', runwayData);

    // Handle different response formats
    let videoUrl = runwayData.url || runwayData.video_url || runwayData.data?.url;
    let thumbnailUrl = runwayData.thumbnail_url || runwayData.data?.thumbnail_url;

    // If still processing, return status
    if (runwayData.status === 'processing' || runwayData.status === 'pending') {
      return NextResponse.json({
        success: true,
        id: runwayData.id || `runway_${Date.now()}`,
        status: 'processing',
        video_url: null,
        thumbnail_url: thumbnailUrl || 'https://via.placeholder.com/320x180/3B82F6/FFFFFF?text=Processing...',
        title: `Processing: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`,
        prompt,
        duration: duration || 5,
        created_at: new Date().toISOString(),
        provider: 'runway',
        metadata: {
          runway_id: runwayData.id,
          model: 'gen4_turbo',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      id: runwayData.id || `runway_${Date.now()}`,
      status: 'completed',
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl || 'https://via.placeholder.com/320x180/3B82F6/FFFFFF?text=Video+Ready',
      title: `AI Video: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`,
      prompt,
      duration: duration || 5,
      created_at: new Date().toISOString(),
      provider: 'runway',
      metadata: {
        model: 'gen4_turbo',
        runway_id: runwayData.id,
        input_image_provided: !!imageUrl,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Video Generation API error:', error);
    return NextResponse.json(
      {
        error: 'Video generation request failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        note: 'Check your AIML API key configuration and network connection.',
      },
      { status: 500 }
    );
  }
}
