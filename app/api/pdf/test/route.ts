import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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
    console.log('Testing database connection for user:', userId);

    // Get all documents for this user
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, original_name, content, created_at, filename')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Found documents:', documents?.length);

    const documentsWithContent = documents?.filter((d) => d.content && d.content.trim().length > 0) || [];
    console.log('Documents with content:', documentsWithContent.length);

    // Attempt on-the-fly extraction for latest if empty content
    let latestDocContentLength = documents?.[0]?.content?.length || 0;
    let triedOnTheFly = false;
    if (latestDocContentLength === 0 && documents?.[0]?.filename) {
      triedOnTheFly = true;
      try {
        const bucket = process.env.SUPABASE_STORAGE_BUCKET_NAME || 'documents';
        const { data: fileData, error: dlErr } = await supabase.storage
          .from(bucket)
          .download(documents[0].filename);
        if (!dlErr && fileData) {
          const arrayBuffer = await fileData.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          let extracted = '';
          try {
            // @ts-expect-error pdf-parse types are not provided in this environment; dynamic import
            const pdfParse = (await import('pdf-parse')).default as any;
            const parsed = await pdfParse(buffer);
            extracted = parsed?.text || '';
          } catch (e) {
            console.error('test: pdf-parse failed', e);
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
            } catch (e) {
              console.error('test: pdfjs extraction failed', e);
            }
          }
          latestDocContentLength = extracted.length;
        }
      } catch (e) {
        console.error('test: on-the-fly extraction error', e);
      }
    }

    return NextResponse.json({
      success: true,
      userId,
      totalDocuments: documents?.length || 0,
      documentsWithContent: documentsWithContent.length,
      latestDocument: documents?.[0]
        ? {
            id: documents[0].id,
            name: documents[0].original_name,
            contentLength: documents[0].content?.length || 0,
            contentPreview: documents[0].content?.substring(0, 200) || 'No content',
            createdAt: documents[0].created_at,
            filename: (documents[0] as any).filename || null,
            triedOnTheFly,
            onTheFlyContentLength: latestDocContentLength,
          }
        : null,
      allDocuments:
        documents?.map((d) => ({
          id: d.id,
          name: d.original_name,
          contentLength: d.content?.length || 0,
          createdAt: d.created_at,
          filename: (d as any).filename || null,
        })) || [],
    });
  } catch (e: any) {
    console.error('Test endpoint error:', e);
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
