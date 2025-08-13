import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function extractVideoId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  // If it's already an ID-like string
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) return urlOrId;
  try {
    const u = new URL(urlOrId);
    if (u.hostname.includes('youtube.com')) {
      return u.searchParams.get('v');
    }
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1);
    }
  } catch {
    // not a URL, maybe raw id
  }
  return null;
}

async function fetchTimedText(videoId: string, lang: string): Promise<string | null> {
  const res = await fetch(
    `https://video.google.com/timedtext?lang=${encodeURIComponent(lang)}&v=${encodeURIComponent(videoId)}`,
    {
      cache: 'no-store',
    }
  );
  if (!res.ok) return null;
  const xml = await res.text();
  if (!xml || !xml.includes('<text')) return null;
  // Extract text nodes and timestamps
  const lines: string[] = [];
  const regex = /<text[^>]*start="([0-9.]+)"[^>]*>([\s\S]*?)<\/text>/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(xml)) !== null) {
    const startSec = parseFloat(m[1] || '0');
    const content = m[2]
      .replace(/\n/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    const mm = String(Math.floor(startSec / 60)).padStart(2, '0');
    const ss = String(Math.floor(startSec % 60)).padStart(2, '0');
    lines.push(`[${mm}:${ss}] ${content}`);
  }
  return lines.join('\n');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url') || '';
    const id = extractVideoId(url || '');
    if (!id) return NextResponse.json({ error: 'Invalid YouTube URL or ID' }, { status: 400 });

    // Try english variants first
    const langs = ['en', 'en-US', 'en-GB'];
    let transcript: string | null = null;
    for (const lang of langs) {
      transcript = await fetchTimedText(id, lang);
      if (transcript) break;
    }

    if (!transcript) {
      return NextResponse.json(
        { error: 'No transcript available for this video (captions may be disabled).' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, videoId: id, transcript });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch transcript' }, { status: 500 });
  }
}
