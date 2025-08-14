import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type CountResult = { count: number };

function makeServerClient() {
  const cookieStore = cookies();
  return createServerClient(
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
}

function startOfDaysAgo(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export async function GET(_req: NextRequest) {
  const supabase = makeServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  async function safeCount(table: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      if (error) return 0;
      return count ?? 0;
    } catch {
      return 0;
    }
  }

  async function safeSum(table: string, column: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select(`${column}`)
        .eq('user_id', userId);
      if (error || !data) return 0;
      return (data as any[]).reduce((acc, row) => acc + (Number(row[column]) || 0), 0);
    } catch {
      return 0;
    }
  }

  async function eventsSince(days: number): Promise<Array<{ name: string; value: number }>> {
    const since = startOfDaysAgo(days);
    const buckets = new Map<string, number>();
    const push = (created_at?: string) => {
      if (!created_at) return;
      const day = new Date(created_at);
      day.setHours(0, 0, 0, 0);
      const key = day.toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) || 0) + 1);
    };

    async function fetchTable(table: string) {
      try {
        const { data } = await supabase
          .from(table)
          .select('created_at')
          .eq('user_id', userId)
          .gte('created_at', since);
        (data || []).forEach((row: any) => push(row.created_at));
      } catch {}
    }

    await Promise.all([
      fetchTable('chat_messages'),
      fetchTable('documents'),
      fetchTable('image_generations'),
      fetchTable('interior_designs'),
      fetchTable('image_enhancer_upscaler'),
      fetchTable('voice_transcriptions'),
      fetchTable('text_to_speech'),
      fetchTable('music_generations'),
    ]);

    // Build last N days array in order
    const out: Array<{ name: string; value: number }> = [];
    for (let i = days - 6; i <= days; i++) {
      // Always 7 points total
      const d = new Date();
      d.setDate(d.getDate() - (days - i));
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      out.push({ name: label, value: buckets.get(key) || 0 });
    }
    return out;
  }

  async function modelDistribution(): Promise<Array<{ name: string; value: number }>> {
    try {
      const { data } = await supabase
        .from('chat_messages')
        .select('model_used')
        .eq('user_id', userId);
      const counts = new Map<string, number>();
      (data || []).forEach((r: any) => {
        const key = r?.model_used || 'unknown';
        counts.set(key, (counts.get(key) || 0) + 1);
      });
      const total = Array.from(counts.values()).reduce((a, b) => a + b, 0) || 1;
      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, v]) => ({ name, value: Math.round((v / total) * 100) }));
    } catch {
      return [];
    }
  }

  const [messages, documents, images, interiors, upscales, voice, tts, music, tokens] = await Promise.all([
    safeCount('chat_messages'),
    safeCount('documents'),
    safeCount('image_generations'),
    safeCount('interior_designs'),
    safeCount('image_enhancer_upscaler'),
    safeCount('voice_transcriptions'),
    safeCount('text_to_speech'),
    safeCount('music_generations'),
    safeSum('chat_messages', 'tokens_used'),
  ]);

  const apiCalls = messages + documents + images + interiors + upscales + voice + tts + music;
  const usage = await eventsSince(7);
  const models = await modelDistribution();

  const payload = {
    metrics: {
      apiCalls,
      activeAgents: 0,
      successRate: 99,
      avgResponseMs: null,
      monthlyCost: 0,
      errorRate: 1,
      totalTokens: tokens,
    },
    usage,
    modelUsage: models,
    errorBreakdown: [
      { name: 'Auth Error', value: 0 },
      { name: 'Timeout', value: 0 },
      { name: 'Invalid Request', value: 0 },
    ],
  };

  return NextResponse.json({ success: true, data: payload });
}


