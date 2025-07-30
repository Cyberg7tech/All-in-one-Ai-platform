import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const filename = searchParams.get('filename') || 'image';

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Validate that it's a valid URL
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    console.log('Image Proxy: Fetching', imageUrl);

    // Fetch the image from the external URL
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error('Image Proxy: Failed to fetch', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    
    // Determine file extension from content type
    let extension = 'png';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) {
      extension = 'jpg';
    } else if (contentType.includes('webp')) {
      extension = 'webp';
    } else if (contentType.includes('gif')) {
      extension = 'gif';
    }

    console.log('Image Proxy: Success', { 
      size: imageBuffer.byteLength, 
      contentType, 
      extension 
    });

    // Return the image with proper headers for download
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}.${extension}"`,
        'Content-Length': imageBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Image Proxy Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to download image',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 