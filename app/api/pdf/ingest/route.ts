// cspell:ignore intfloat
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function extractPdfWithPdfjs(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pdfjs = require('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = false;

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

  return text.trim();
}

export async function POST(req: NextRequest) {
  try {
    console.log('PDF ingest started');

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
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('User ID:', userId);

    const formData = await req.formData();
    const file = formData.get('file') as File;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const title = formData.get('title') as string;

    if (!file) {
      console.log('No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type);

    if (file.type !== 'application/pdf') {
      console.log('Invalid file type:', file.type);
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    // Extract text from PDF
    let extractedText = '';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('Buffer created, size:', buffer.length);

    try {
      // Try pdf-parse first
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse');
      const parsed = await pdfParse(buffer);
      extractedText = parsed?.text || '';
      console.log('PDF parse successful, extracted length:', extractedText.length);
    } catch (error) {
      console.log('PDF parse failed, trying pdfjs fallback:', error);
      try {
        extractedText = await extractPdfWithPdfjs(buffer);
        console.log('PDFjs fallback successful, extracted length:', extractedText.length);
      } catch (pdfjsError) {
        console.error('Both PDF parsers failed:', pdfjsError);
        return NextResponse.json(
          {
            error: 'Failed to extract text from PDF',
          },
          { status: 500 }
        );
      }
    }

    if (!extractedText.trim()) {
      console.log('No text content extracted');
      return NextResponse.json(
        {
          error: 'No text content found in PDF',
        },
        { status: 400 }
      );
    }

    console.log('About to insert into chat_with_file table...');

    // Store in chat_with_file table (following BuilderKit documentation)
    const { data: chatFile, error: insertError } = await supabase
      .from('chat_with_file')
      .insert({
        user_id: userId,
        file: extractedText,
        filename: file.name,
        chat_history: [],
        history_metadata: `Uploaded: ${new Date().toISOString()}`,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting into chat_with_file:', insertError);
      console.error('Insert error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });
      return NextResponse.json(
        {
          error: `Failed to store PDF content: ${insertError.message}`,
          details: insertError.details,
        },
        { status: 500 }
      );
    }

    console.log('Successfully stored PDF in chat_with_file table:', chatFile.id);

    return NextResponse.json({
      success: true,
      message: 'PDF uploaded and processed successfully',
      fileId: chatFile.id,
      filename: file.name,
      contentLength: extractedText.length,
    });
  } catch (e: any) {
    console.error('PDF ingest error:', e);
    console.error('Error stack:', e.stack);
    return NextResponse.json(
      {
        error: e?.message || 'Unknown error',
        stack: e?.stack,
      },
      { status: 500 }
    );
  }
}
