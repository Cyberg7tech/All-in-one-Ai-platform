import { NextResponse } from 'next/server';
import { AIAPIService } from '@/lib/ai/api-integration';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server' },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const api = AIAPIService.getInstance();

    // Prefer Together API set via /api/ai/models to keep consistent fields
    let models: any[] = [];
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/ai/models`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        models = data?.models?.all || [];
      }
    } catch (e) {
      // ignore and fall back
    }

    if (models.length === 0) {
      models = api.getAvailableModels();
    }

    // Normalize fields for ai_models table
    const rows = models.map((m: any) => ({
      id: m.id,
      name: m.name || m.id,
      provider: m.provider || 'together',
      category: m.category || 'chat',
    }));

    // Upsert by primary key id
    const { data, error } = await supabase.from('ai_models').upsert(rows, { onConflict: 'id' }).select();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, insertedOrUpdated: data?.length || 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';


