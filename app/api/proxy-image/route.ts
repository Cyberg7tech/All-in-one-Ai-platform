import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const filename = searchParams.get('filename');

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    console.log('Proxying image download:', imageUrl);

    // Fetch the image from the external URL
    const response = await fetch(imageUrl);

    if (!response.ok) {
      console.error('Failed to fetch image:', response.status, response.statusText);
      return NextResponse.json({ error: 'Failed to fetch image from source' }, { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    // Create filename from URL if not provided
    const downloadFilename = filename || `image_${Date.now()}.png`;

    // Return the image with proper headers for download
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${downloadFilename}"`,
        'Content-Length': imageBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Internal server error while proxying image' }, { status: 500 });
  }
}
