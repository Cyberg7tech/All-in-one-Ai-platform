import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { width: string; height: string } }) {
  try {
    const { width, height } = params;

    // Validate dimensions
    const w = parseInt(width);
    const h = parseInt(height);

    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0 || w > 2000 || h > 2000) {
      return NextResponse.json({ error: 'Invalid dimensions' }, { status: 400 });
    }

    // Create a simple SVG placeholder
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1e293b"/>
        <rect x="2" y="2" width="${w - 4}" height="${h - 4}" fill="none" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8" font-family="Arial, sans-serif" font-size="14">
          ${w} × ${h}
        </text>
        <text x="50%" y="${h / 2 + 20}" text-anchor="middle" dominant-baseline="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="12">
          Placeholder
        </text>
      </svg>
    `;

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Placeholder image error:', error);
    return NextResponse.json({ error: 'Failed to generate placeholder' }, { status: 500 });
  }
}
