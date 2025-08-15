// app/api/pdf/ingest/route.ts
export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import crypto from 'crypto';

// pdf-parse must run in Node
import pdfParse from 'pdf-parse';

function getSB() {
  const c = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => c.get(n)?.value, set() {}, remove() {} } }
  );
}

// simple character chunker (matches typical BuilderKit usage)
function chunkText(txt: string, max = 1000, overlap = 200) {
  const chunks: string[] = [];
  let i = 0;
  while (i < txt.length) {
    const end = Math.min(i + max, txt.length);
    chunks.push(txt.slice(i, end));
    i = end - overlap;
    if (i < 0) i = 0;
    if (i >= txt.length) break;
  }
  return chunks;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    // 1) Read PDF as Buffer
    const ab = await file.arrayBuffer();
    const buffer = Buffer.from(ab);

    // 2) Extract text
    const parsed = await pdfParse(buffer);
    const text = (parsed.text || '').trim();
    if (!text || text.length < 10) {
      return NextResponse.json(
        { error: 'No selectable text found (image-only or encrypted PDF). Upload a text-based PDF.' },
        { status: 422 }
      );
    }

    // 3) Chunk
    const chunks = chunkText(text);

    // 4) Embed with OpenAI (text-embedding-3-large → 3072-dim)
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const embedRes = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: chunks,
    });
    const vectors = embedRes.data.map((d) => d.embedding);

    // 5) Upsert to Pinecone
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pc.Index(process.env.PINECONE_INDEX_NAME!);
    const docId = crypto.randomUUID();

    await index.upsert(
      vectors.map((values, i) => ({
        id: `${docId}::${i}`,
        values,
        metadata: {
          docId,
          chunkIndex: i,
          text: chunks[i],
          filename: file.name,
        },
      }))
    );

    // 6) Save one supabase row in chat_with_file (BuilderKit does this)
    const sb = getSB();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error: insErr } = await sb.from('chat_with_file').insert({
      user_id: user.id,
      file: text, // full text (for reference/history)
      filename: file.name,
      history_metadata: JSON.stringify({ docId, chunks: chunks.length }),
    });
    if (insErr) {
      console.error('supabase insert error:', insErr);
      return NextResponse.json({ error: 'Failed to save metadata' }, { status: 500 });
    }

    return NextResponse.json({ success: true, docId, chunks: chunks.length });
  } catch (e: any) {
    console.error('ingest error:', e?.message || e);
    return NextResponse.json({ error: 'Failed to extract text from PDF' }, { status: 500 });
  }
}
