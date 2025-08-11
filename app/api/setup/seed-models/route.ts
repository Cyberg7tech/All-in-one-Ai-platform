import { NextResponse } from 'next/server';
import { AIAPIService } from '@/lib/ai/api-integration';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Build a consolidated model list
    const api = AIAPIService.getInstance();
    let fetched: any[] = [];

    // Try Together API directly when key exists
    if (process.env.TOGETHER_API_KEY) {
      try {
        const res = await fetch('https://api.together.xyz/v1/models', {
          headers: { Authorization: `Bearer ${process.env.TOGETHER_API_KEY}` },
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          fetched = (json?.data || []).map((m: any) => ({
            id: m.id,
            name: m.display_name || m.id,
            provider: 'together',
            category: 'chat',
          }));
        }
      } catch {
        // Ignore and fall back
      }
    }

    // Merge with curated list as fallback
    const curated = api.getAvailableModels().map((m: any) => ({
      id: m.id,
      name: m.name || m.id,
      provider: m.provider || 'together',
      category: m.category || 'chat',
    }));

    // De-duplicate by id (prefer fetched > curated)
    const byId = new Map<string, any>();
    for (const item of [...fetched, ...curated]) {
      if (!byId.has(item.id)) byId.set(item.id, item);
    }
    const rows = Array.from(byId.values());

    // If service role key is missing, return models without attempting DB writes
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: true, wrote: 0, models: rows.length });
    }

    // Upsert into ai_models using service key (server-only)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.from('ai_models').upsert(rows, { onConflict: 'id' }).select();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, wrote: data?.length || 0, models: rows.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
