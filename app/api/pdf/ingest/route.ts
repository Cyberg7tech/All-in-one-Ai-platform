// app/api/pdf/ingest/route.ts
export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// --- NEW: fallback extractor with pdfjs-dist ---
async function extractWithPdfJs(buffer: Buffer): Promise<string> {
  // lazy import keeps bundle smaller
  const pdfjs = await import('pdfjs-dist');
  // disable worker in Node
  (pdfjs as any).GlobalWorkerOptions.workerSrc = undefined;

  const loadingTask = (pdfjs as any).getDocument({ data: new Uint8Array(buffer) });
  const doc = await loadingTask.promise;
  let out = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((it: any) => it.str).join(' ');
    out += (out ? '\n' : '') + text;
  }
  return out.trim();
}

async function extractText(buffer: Buffer): Promise<string> {
  // try pdf-parse first
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const parsed = await pdfParse(buffer);
    if (parsed?.text && parsed.text.trim().length > 10) {
      return parsed.text.trim();
    }
  } catch (e) {
    // ignore, we'll try pdfjs next
    console.warn('pdf-parse failed, trying pdfjs-dist');
  }
  // fallback to pdfjs-dist
  try {
    const t = await extractWithPdfJs(buffer);
    return t;
  } catch (e) {
    console.error('pdfjs-dist extract failed:', (e as any)?.message || e);
    return '';
  }
}

function getSB() {
  const c = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => c.get(n)?.value, set() {}, remove() {} } }
  );
}

function chunkText(txt: string, max = 1000, overlap = 200) {
  const out: string[] = [];
  let i = 0;
  while (i < txt.length) {
    const end = Math.min(i + max, txt.length);
    out.push(txt.slice(i, end));
    i = end - overlap;
    if (i < 0) i = 0;
  }
  return out;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // 🔑 unified text extraction with fallback
    const text = await extractText(buffer);

    if (!text || text.length < 10) {
      return NextResponse.json(
        {
          error: 'no_text',
          details: {
            bytes: buffer.length,
            firstBytes: Array.from(buffer.slice(0, 8)),
            textLength: text?.length || 0,
            textPreview: text?.substring(0, 100) || 'none',
          },
        },
        { status: 422 }
      );
    }

    const chunks = chunkText(text);

    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const emb = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: chunks,
    });
    const vectors = emb.data.map((d) => d.embedding);

    const { Pinecone } = await import('@pinecone-database/pinecone');
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pc.Index(process.env.PINECONE_INDEX_NAME!);

    const docId = crypto.randomUUID();
    await index.upsert(
      vectors.map((values, i) => ({
        id: `${docId}::${i}`,
        values,
        metadata: { docId, chunkIndex: i, text: chunks[i], filename: file.name },
      }))
    );

    const sb = getSB();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error: insErr } = await sb.from('chat_with_file').insert({
      user_id: user.id,
      file: text,
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
