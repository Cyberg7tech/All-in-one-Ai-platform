import { NextRequest, NextResponse } from 'next/server';

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
    console.log('PDF parse test started');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type);

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    // Extract text from PDF
    let extractedText = '';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('Buffer created, size:', buffer.length);

    let parseMethod = 'none';
    let parseError = null;

    try {
      // Try pdf-parse first
      console.log('Trying pdf-parse...');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse');
      const parsed = await pdfParse(buffer);
      extractedText = parsed?.text || '';
      parseMethod = 'pdf-parse';
      console.log('PDF parse successful, extracted length:', extractedText.length);
    } catch (error) {
      console.log('PDF parse failed, trying pdfjs fallback:', error);
      parseError = error;
      
      try {
        console.log('Trying pdfjs...');
        extractedText = await extractPdfWithPdfjs(buffer);
        parseMethod = 'pdfjs';
        console.log('PDFjs fallback successful, extracted length:', extractedText.length);
      } catch (pdfjsError) {
        console.error('Both PDF parsers failed:', pdfjsError);
        return NextResponse.json(
          {
            error: 'Failed to extract text from PDF',
            details: {
              pdfParseError: parseError?.message,
              pdfjsError: pdfjsError?.message,
            },
          },
          { status: 500 }
        );
      }
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        {
          error: 'No text content found in PDF',
          parseMethod,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'PDF parsed successfully',
      parseMethod,
      contentLength: extractedText.length,
      contentPreview: extractedText.substring(0, 200) + '...',
    });
  } catch (e: any) {
    console.error('PDF parse test error:', e);
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
