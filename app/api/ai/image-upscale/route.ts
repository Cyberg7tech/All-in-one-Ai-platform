import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const togetherKey = process.env.TOGETHER_API_KEY;
    if (!togetherKey) {
      return NextResponse.json({ error: 'TOGETHER_API_KEY not configured' }, { status: 500 });
    }

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Send multipart/form-data with image file' }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get('file') as File | null;
    const scale = Number(form.get('scale') || 2);
    const enhanceType = String(form.get('enhanceType') || 'general');
    if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Together image edit/upscale surrogate using SDXL based pipelines
    const res = await fetch('https://api.together.xyz/v1/images/edits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${togetherKey}`,
      },
      body: JSON.stringify({
        // Common SD models exposed by Together; adjust as needed
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        image: base64,
        prompt: `upscale ${scale}x and enhance (${enhanceType}) while preserving natural details`,
        size: '1024x1024',
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ error: json?.error || 'Upscale failed' }, { status: 500 });
    }

    const imageUrl = json?.data?.[0]?.url || json?.image_url || null;
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image returned from Together' }, { status: 500 });
    }

    return NextResponse.json({ success: true, imageUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
