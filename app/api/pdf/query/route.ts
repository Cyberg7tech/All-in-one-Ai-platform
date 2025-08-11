import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function embedQuery(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  });
  if (!res.ok) throw new Error(`OpenAI embedding failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.data[0].embedding as number[];
}

async function callLLM(system: string, user: string): Promise<string> {
  // Prefer Together (chat) if available; else OpenAI
  const together = process.env.TOGETHER_API_KEY;
  if (together) {
    const res = await fetch('https://api.together.xyz/v1/chat/completions', {
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

  const openai = process.env.OPENAI_API_KEY;
  if (!openai) throw new Error('No LLM provider configured');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openai}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.2,
      max_tokens: 800,
    }),
  });
  const json = await res.json().catch(() => ({}));
  return json?.choices?.[0]?.message?.content || 'No response';
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
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

    const embedding = await embedQuery(question);

    // Call similarity function
    const { data: matches, error } = await supabase
      .rpc('match_document_chunks', {
        p_user_id: userId,
        p_embedding: embedding,
        p_match_count: Math.min(Math.max(Number(k) || 5, 1), 20),
      })
      .select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const top = (matches || [])
      .filter((m: any) => m?.content)
      .map((m: any) => `- (${(m.similarity * 100).toFixed(1)}%) ${m.content}`)
      .join('\n');

    const systemPrompt = `You are a helpful assistant that answers strictly based on the provided document context. If the answer is not in the context, say you don't know.
Context:\n${top}`;
    const answer = await callLLM(systemPrompt, question);

    return NextResponse.json({ success: true, answer, matches: matches || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
