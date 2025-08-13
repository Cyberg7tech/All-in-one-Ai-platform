import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type EmbeddingProvider = 'openai';

async function embedTexts(texts: string[], provider: EmbeddingProvider = 'openai'): Promise<number[][]> {
  if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: texts }),
    });
    if (!res.ok) {
      throw new Error(`OpenAI embedding failed: ${res.status} ${await res.text()}`);
    }
    const json = await res.json();
    return json.data.map((d: any) => d.embedding as number[]);
  }
  throw new Error('Unsupported embedding provider');
}

function chunkText(text: string, target = 1200, overlap = 100): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const chunks: string[] = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(clean.length, i + target);
    const slice = clean.slice(i, end);
    chunks.push(slice);
    if (end >= clean.length) break;
    i = end - overlap;
    if (i < 0) i = 0;
  }
  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options: any) => {
            cookieStore.set({ name, value, ...options });
          },
          remove: (name: string, options: any) => {
            cookieStore.set({ name, value: '', ...options });
          },
        },
        cookieOptions: {
          name: 'sb-one-ai-auth',
          domain: undefined,
          path: '/',
          sameSite: 'lax',
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Accept multipart/form-data or JSON
    let title = 'Untitled Document';
    let rawText = '';
    let storagePath: string | null = null;

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('file') as File | null;
      title = (form.get('title') as string) || title;
      const textFromForm = (form.get('text') as string) || '';

      if (textFromForm) rawText = textFromForm;

      if (file) {
        // Upload file to storage (optional)
        const arrayBuffer = await file.arrayBuffer();
        const fileBytes = new Uint8Array(arrayBuffer);
        const ext = file.name.split('.').pop() || 'bin';
        const key = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('documents').upload(key, fileBytes, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        });
        if (!uploadError) storagePath = key;

        // Try parsing PDF text if possible
        if (!rawText && file.type === 'application/pdf') {
          try {
            // Attempt dynamic import of pdf-parse if available
            // @ts-expect-error: Optional dependency only present when installed
            const pdfParse = (await import('pdf-parse')).default as any;
            const buffer = Buffer.from(arrayBuffer);
            const parsed = await pdfParse(buffer);
            rawText = parsed?.text || '';
          } catch {
            // No parser installed; rely on text field fallback
          }
        }
      }
    } else {
      const json = await req.json().catch(() => ({}));
      title = json.title || title;
      rawText = json.text || '';
    }

    // NOTE: If text extraction failed, still create the document so the user can proceed,
    // and return success with 0 chunks. This avoids blocking with 400 errors on some hosts.
    // The document can be reprocessed later or used for metadata-only workflows.
    if (!rawText) {
      const { data: doc, error: docErr } = await supabase
        .from('documents')
        .insert({ user_id: userId, title, file_path: storagePath || null })
        .select()
        .single();
      if (docErr) {
        return NextResponse.json({ error: docErr.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, documentId: doc.id, chunks: 0, storagePath });
    }

    const chunks = chunkText(rawText);
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'Empty content after processing' }, { status: 400 });
    }

    // Create document row
    const { data: doc, error: docErr } = await supabase
      .from('documents')
      .insert({ user_id: userId, title, file_path: storagePath || null })
      .select()
      .single();
    if (docErr) {
      return NextResponse.json({ error: docErr.message }, { status: 500 });
    }

    // Embed chunks in batches
    const embeddings = await embedTexts(chunks);

    // Build rows for chunks
    const rows = chunks.map((content, i) => ({
      doc_id: doc.id,
      user_id: userId,
      chunk_index: i,
      content,
      embedding: embeddings[i],
    }));
    // Insert in pages of 100
    const pageSize = 100;
    for (let i = 0; i < rows.length; i += pageSize) {
      const slice = rows.slice(i, i + pageSize);
      const { error } = await supabase.from('document_chunks').insert(slice as any);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, documentId: doc.id, chunks: rows.length, storagePath });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
