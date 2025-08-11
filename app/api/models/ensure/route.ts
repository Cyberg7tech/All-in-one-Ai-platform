import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server' },
        { status: 500 }
      );
    }

    const { id, name, provider, category } = await req.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing model id' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const row = {
      id,
      name: name || id,
      provider: provider || inferProvider(id),
      category: category || 'chat',
    } as any;

    const { data, error } = await supabase
      .from('ai_models')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, model: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}

function inferProvider(modelId: string): string {
  const lower = modelId.toLowerCase();
  if (lower.includes('gpt')) return 'openai';
  if (lower.includes('claude')) return 'anthropic';
  if (lower.includes('gemini')) return 'google';
  if (lower.includes('deepseek')) return 'deepseek';
  if (lower.includes('llama') || lower.includes('qwen') || lower.includes('mistral')) return 'together';
  return 'together';
}
