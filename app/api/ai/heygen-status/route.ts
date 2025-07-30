import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('video_id');

    if (!videoId) {
      return NextResponse.json(
        { error: 'video_id parameter is required' },
        { status: 400 }
      );
    }

    const heygenApiKey = process.env.HEYGEN_API_KEY;
    
    if (!heygenApiKey) {
      return NextResponse.json(
        { error: 'HeyGen API key not configured' },
        { status: 500 }
      );
    }

    console.log('Checking HeyGen video status:', videoId);

    // Check status with HeyGen API
    const statusResponse = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      method: 'GET',
      headers: {
        'X-API-KEY': heygenApiKey
      }
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error('HeyGen Status API Error:', statusResponse.status, errorText);
      return NextResponse.json(
        { 
          error: `Failed to check video status: ${statusResponse.status}`,
          details: errorText 
        },
        { status: statusResponse.status }
      );
    }

    const statusData = await statusResponse.json();
    console.log('HeyGen Status Response:', statusData);

    // Map HeyGen status to our format
    const status = statusData.data?.status;
    let ourStatus = 'processing';
    let videoUrl = null;
    let thumbnailUrl = null;

    switch (status) {
      case 'completed':
        ourStatus = 'completed';
        videoUrl = statusData.data?.video_url;
        thumbnailUrl = statusData.data?.thumbnail_url;
        break;
      case 'processing':
      case 'pending':
        ourStatus = 'processing';
        break;
      case 'failed':
      case 'error':
        ourStatus = 'failed';
        break;
      default:
        ourStatus = 'processing';
    }

    return NextResponse.json({
      success: true,
      video_id: videoId,
      status: ourStatus,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      progress: statusData.data?.progress || 0,
      estimated_time: statusData.data?.estimated_time,
      error_message: statusData.data?.error_message,
      provider: 'heygen',
      raw_status: statusData.data
    });

  } catch (error) {
    console.error('HeyGen status check error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check video status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}