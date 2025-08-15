// app/api/pdf/query/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

async function embedQuery(q: string, openai: OpenAI) {
  const r = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: q,
  });
  return r.data[0].embedding;
}

function buildPrompt(contexts: string, question: string) {
  const system = `You are a helpful assistant that answers QUESTIONS using only the CONTEXT.
- If the answer is not in the context, say "I don't know" briefly.
- Cite relevant snippets when helpful.`;
  const user = `CONTEXT:
${contexts}

QUESTION: ${question}`;
  return { system, user };
}

export async function POST(req: Request) {
  try {
    const { query, docId, topK = 5, model = 'gpt-4o-mini' } = await req.json();

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const qEmb = await embedQuery(query, openai);

    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pc.Index(process.env.PINECONE_INDEX_NAME!);

    const res = await index.query({
      vector: qEmb,
      topK,
      includeMetadata: true,
      filter: docId ? { docId: { $eq: docId } } : undefined,
    });

    const matches = res.matches ?? [];
    const contexts = matches
      .map((m: any) => (m.metadata?.text as string) || '')
      .filter(Boolean)
      .join('\n---\n');

    const { system, user } = buildPrompt(contexts, query);

    const chat = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });

    const answer = chat.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({
      answer,
      sources: matches.map((m: any) => ({
        id: m.id,
        score: m.score,
        chunkIndex: m.metadata?.chunkIndex,
        filename: m.metadata?.filename,
      })),
    });
  } catch (e: any) {
    console.error('query error:', e?.message || e);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
}
