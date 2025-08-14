// cspell:ignore intfloat
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// No chunk embeddings path anymore; we persist extracted text into documents.content only

async function extractPdfWithPdfjs(buffer: Buffer): Promise<string> {
  try {
    console.log('pdfjs: Starting extraction...');
    // Lazy import to keep cold starts smaller
    // pdfjs-dist works in Node if we use the legacy build
    // and disable workers (Next.js server runtime)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
    // Disable workers in server runtime
    pdfjs.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/legacy/build/pdf.worker.js');
    
    console.log('pdfjs: Loading document...');
    const loadingTask = pdfjs.getDocument({ data: buffer, useSystemFonts: true, isEvalSupported: false });
    const doc = await loadingTask.promise;
    
    console.log('pdfjs: Document loaded, pages:', doc.numPages);
    let text = '';
    const numPages = doc.numPages || 0;
    
    for (let i = 1; i <= numPages; i++) {
      console.log(`pdfjs: Processing page ${i}/${numPages}`);
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((it: any) => (it.str ?? '') as string).join(' ');
      text += `\n\n${pageText}`;
      console.log(`pdfjs: Page ${i} text length:`, pageText.length);
    }
    
    const result = text.trim();
    console.log('pdfjs: Total extracted text length:', result.length);
    return result;
  } catch (error) {
    console.log('pdfjs: Extraction failed with error:', error);
    return '';
  }
}

// Embeddings removed per new requirement (no document_chunks usage)

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
    let uploadedFileMeta: { name?: string; size?: number; type?: string } | null = null;

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
        uploadedFileMeta = { name: file.name, size: file.size, type: file.type };

        // Try parsing PDF text if possible
        if (!rawText && file.type === 'application/pdf') {
          console.log('Starting PDF text extraction for file:', file.name, 'Size:', file.size);
          const buffer = Buffer.from(arrayBuffer);
          
          // Method 1: Try pdf-parse
          try {
            console.log('Attempting pdf-parse extraction...');
            // @ts-expect-error: Optional dependency only present when installed
            const pdfParse = (await import('pdf-parse')).default as any;
            const parsed = await pdfParse(buffer);
            rawText = parsed?.text || '';
            console.log('pdf-parse result length:', rawText.length);
            console.log('pdf-parse first 200 chars:', rawText.substring(0, 200));

            if (!rawText) {
              console.log('pdf-parse returned empty text, trying pdfjs fallback...');
              rawText = await extractPdfWithPdfjs(buffer);
              console.log('pdfjs fallback result length:', rawText.length);
              console.log('pdfjs first 200 chars:', rawText.substring(0, 200));
            }
          } catch (error) {
            console.log('pdf-parse failed with error:', error);
            console.log('Trying pdfjs as fallback...');
            try {
              rawText = await extractPdfWithPdfjs(buffer);
              console.log('pdfjs result length:', rawText.length);
              console.log('pdfjs first 200 chars:', rawText.substring(0, 200));
            } catch (pdfjsError) {
              console.log('pdfjs also failed with error:', pdfjsError);
              rawText = '';
            }
          }
          
          console.log('Final extracted text length:', rawText.length);
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
      console.log('No text extracted from PDF, creating document with empty content');
      const { data: doc, error: docErr } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          filename: storagePath || null,
          original_name: uploadedFileMeta?.name || title,
          file_size: uploadedFileMeta?.size || null,
          file_type: uploadedFileMeta?.type || 'application/pdf',
          content: '',
        })
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
    console.log('Creating document with extracted text, length:', rawText.length);
    const { data: doc, error: docErr } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        filename: storagePath || null,
        original_name: uploadedFileMeta?.name || title,
        file_size: uploadedFileMeta?.size || null,
        file_type: uploadedFileMeta?.type || 'application/pdf',
        content: rawText,
      })
      .select()
      .single();
    if (docErr) {
      return NextResponse.json({ error: docErr.message }, { status: 500 });
    }

    // No document_chunks insertion anymore; return the number of logical chunks we produced
    console.log('Document created successfully with ID:', doc.id);
    return NextResponse.json({ success: true, documentId: doc.id, chunks: chunks.length, storagePath });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
