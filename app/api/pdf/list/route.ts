import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = cookies();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n: string) => cookieStore.get(n)?.value, set() {}, remove() {} } }
  );
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json([], { status: 200 });
  const { data } = await sb
    .from('chat_with_file')
    .select('id, filename, created_at, history_metadata')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  return NextResponse.json(data ?? []);
}
