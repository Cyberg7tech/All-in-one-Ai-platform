// cspell:ignore intfloat
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { togetherEmbeddings, TOGETHER_BASE } from '@/lib/ai/providers/together';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function embedQuery(text: string): Promise<number[]> {
  const json = await togetherEmbeddings(text, 'intfloat/multilingual-e5-large-instruct');
  return json.data[0].embedding as number[];
}

async function callLLM(system: string, user: string): Promise<string> {
  // Prefer Anthropic Claude Sonnet if available; then OpenAI; then Together
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    try {
      const client = new Anthropic({ apiKey: anthropicKey });
      const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
      const msg = await client.messages.create({
        model,
        max_tokens: 800,
        temperature: 0.2,
        system,
        messages: [{ role: 'user', content: user }],
      });
      const content = msg?.content?.[0];
      if (content && content.type === 'text') return content.text;
      // Fallback: stringify
      return JSON.stringify(msg?.content ?? '');
    } catch (e) {
      // Fall through to next provider
      console.warn('Anthropic call failed, falling back to OpenAI/Together', e);
    }
  }

  // Prefer OpenAI next if available; otherwise use Together
  const openai = process.env.OPENAI_API_KEY;
  if (openai) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openai}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        max_tokens: 800,
        temperature: 0.2,
      }),
    });
    const json = await res.json().catch(() => ({}));
    return json?.choices?.[0]?.message?.content || 'No response';
  }

  const together = process.env.TOGETHER_API_KEY;
  if (together) {
    const res = await fetch(`${TOGETHER_BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${together}` },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        max_tokens: 800,
        temperature: 0.2,
      }),
    });
    const json = await res.json().catch(() => ({}));
    return json?.choices?.[0]?.message?.content || 'No response';
  }

  throw new Error('Neither OPENAI_API_KEY nor TOGETHER_API_KEY is configured');
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
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    const { question, k = 5 } = await req.json();
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }

    // Try vector similarity first
    try {
      const embedding = await embedQuery(question);
      const { data: matches, error } = await supabase
        .rpc('match_document_chunks', {
          p_user_id: userId,
          p_embedding: embedding,
          p_match_count: Math.min(Math.max(Number(k) || 5, 1), 20),
        })
        .select();
      if (!error && matches && matches.length > 0) {
        const top = (matches || [])
          .filter((m: any) => m?.content)
          .map((m: any) => `- (${(m.similarity * 100).toFixed(1)}%) ${m.content}`)
          .join('\n');
        const systemPrompt = `You are a helpful assistant that answers strictly based on the provided document context. If the answer is not in the context, say you don't know.\nContext:\n${top}`;
        const answer = await callLLM(systemPrompt, question);
        return NextResponse.json({ success: true, answer, matches });
      }
    } catch (err) {
      // Vector search path failed (e.g., function/table missing). Fallback to documents.content
      console.warn('match_document_chunks failed; falling back to documents.content', err);
    }

    // Fallback: use latest document that has non-null content
    console.log('Querying documents for user:', userId);

    // First, let's check if there are any documents at all for this user
    const { data: allDocs, error: allDocsError } = await supabase
      .from('documents')
      .select('id, content, original_name, created_at')
      .eq('user_id', userId);

    if (allDocsError) {
      console.error('Error querying all documents:', allDocsError);
    } else {
      console.log('Total documents for user:', allDocs?.length);
      console.log(
        'Documents with content:',
        allDocs?.filter((d) => d.content && d.content.trim().length > 0).length
      );
    }

    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('id, content, original_name, created_at, filename')
      .eq('user_id', userId)
      .not('content', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (docError) {
      console.error('Error querying documents:', docError);
    }

    console.log('Retrieved document:', {
      id: doc?.id,
      contentLength: doc?.content?.length,
      originalName: doc?.original_name,
      createdAt: doc?.created_at,
    });
    console.log('Content preview:', doc?.content?.substring(0, 200));

    // If no content, try to fetch latest document by created_at regardless of content and extract on the fly
    let workingDoc = doc;
    const debug: Record<string, any> = {};
    if (!workingDoc?.content || workingDoc.content.trim().length === 0) {
      console.log('No inline content found. Attempting on-the-fly extraction from storage...');
      const { data: latestDoc } = await supabase
        .from('documents')
        .select('id, content, original_name, created_at, filename')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestDoc?.filename) {
        try {
          // Download the file from storage
          const bucket = process.env.SUPABASE_STORAGE_BUCKET_NAME || 'documents';
          debug.bucket = bucket;
          debug.filename = latestDoc.filename;
          const { data: fileData, error: dlErr } = await supabase.storage
            .from(bucket)
            .download(latestDoc.filename);
          if (dlErr) {
            console.error('Error downloading PDF from storage:', dlErr);
            debug.downloadError = String(dlErr.message || dlErr.name || dlErr);
          } else if (fileData) {
            const arrayBuffer = await fileData.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Two-step extraction similar to ingest
            let extracted = '';
            try {
              // @ts-expect-error: Optional dependency only present when installed
              const pdfParse = (await import('pdf-parse')).default as any;
              const parsed = await pdfParse(buffer);
              extracted = parsed?.text || '';
              console.log('On-the-fly pdf-parse length:', extracted.length);
              debug.pdfParseLength = extracted.length;
            } catch (e) {
              console.warn('On-the-fly pdf-parse failed:', e);
              debug.pdfParseError = String((e as Error).message || e);
            }

            if (!extracted) {
              try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
                pdfjs.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/legacy/build/pdf.worker.js');
                const loadingTask = pdfjs.getDocument({
                  data: buffer,
                  useSystemFonts: true,
                  isEvalSupported: false,
                });
                const pdf = await loadingTask.promise;
                let text = '';
                for (let i = 1; i <= (pdf.numPages || 0); i++) {
                  const page = await pdf.getPage(i);
                  const content = await page.getTextContent();
                  const pageText = content.items.map((it: any) => (it.str ?? '') as string).join(' ');
                  text += `\n\n${pageText}`;
                }
                extracted = text.trim();
                console.log('On-the-fly pdfjs length:', extracted.length);
                debug.pdfjsLength = extracted.length;
              } catch (e) {
                console.warn('On-the-fly pdfjs failed:', e);
                debug.pdfjsError = String((e as Error).message || e);
              }
            }

            if (extracted && extracted.trim().length > 0) {
              // Persist extracted text for future queries
              const { error: updErr } = await supabase
                .from('documents')
                .update({ content: extracted })
                .eq('id', latestDoc.id);
              if (updErr) console.error('Failed to update document content after extraction:', updErr);
              if (updErr) debug.updateError = String(updErr.message || updErr.name || updErr);

              workingDoc = { ...latestDoc, content: extracted } as typeof latestDoc & { content: string };
            }
          }
        } catch (e) {
          console.error('On-the-fly extraction overall failure:', e);
          debug.extractionError = String((e as Error).message || e);
        }
      }
    }

    if (!workingDoc?.content || workingDoc.content.trim().length === 0) {
      return NextResponse.json({
        success: true,
        answer: 'No document content found. Please re-upload your PDF.',
        debug,
      });
    }

    const MAX_CHARS = 12000;
    const content = workingDoc.content;
    const context = content.length > MAX_CHARS ? content.slice(0, MAX_CHARS) : content;
    const systemPrompt = `You are a helpful assistant that answers strictly based on the provided document content. If the answer is not in the content, say you don't know.\nContent:\n${context}`;
    const answer = await callLLM(systemPrompt, question);
    return NextResponse.json({ success: true, answer, matches: [], debug });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
