export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    return NextResponse.json({ success: true, message: 'PDF ingest endpoint ready' });
  } catch (e: any) {
    console.error('ingest error:', e?.message || e);
    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 });
  }
}
