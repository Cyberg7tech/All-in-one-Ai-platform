import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function callLLM(system: string, user: string): Promise<string> {
  const openai = process.env.OPENAI_API_KEY;
  if (!openai) {
    throw new Error('OPENAI_API_KEY is required');
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openai}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 800,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return json?.choices?.[0]?.message?.content || 'No response';
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
    const { question } = await req.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }

    // Get the latest chat_with_file record for this user
    const { data: chatFile, error: chatError } = await supabase
      .from('chat_with_file')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (chatError || !chatFile) {
      return NextResponse.json({
        success: false,
        answer: 'No PDF file found. Please upload a PDF first.',
      });
    }

    // Get chat history
    const chatHistory = chatFile.chat_history || [];

    // For now, we'll use the file content directly
    // In a full RAG implementation, you would:
    // 1. Split the file into chunks
    // 2. Create embeddings for each chunk
    // 3. Store embeddings in Pinecone
    // 4. Search for relevant chunks based on the question

    const systemPrompt = `You are a helpful assistant that answers questions based on the provided PDF content.
    If the answer is not in the content, say you don't know.

    PDF Content:
    ${chatFile.file || 'No content available'}`;

    const answer = await callLLM(systemPrompt, question);

    // Update chat history
    const updatedHistory = [
      ...chatHistory,
      {
        role: 'user',
        content: question,
        timestamp: new Date().toISOString(),
      },
      {
        role: 'assistant',
        content: answer,
        timestamp: new Date().toISOString(),
      },
    ];

    // Update the chat_with_file record with new history
    await supabase
      .from('chat_with_file')
      .update({
        chat_history: updatedHistory,
        history_metadata: `Last updated: ${new Date().toISOString()}`,
      })
      .eq('id', chatFile.id);

    return NextResponse.json({
      success: true,
      answer,
      chatHistory: updatedHistory,
    });
  } catch (e: any) {
    console.error('PDF query error:', e);
    return NextResponse.json(
      {
        error: e?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
