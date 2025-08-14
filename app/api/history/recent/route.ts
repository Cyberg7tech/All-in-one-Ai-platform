import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

export async function GET(_req: NextRequest) {
  const supabase = makeServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  async function latest(table: string, select: string, map: (row: any) => any) {
    try {
      const { data } = await supabase
        .from(table)
        .select(select)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      return (data || []).map(map);
    } catch {
      return [];
    }
  }

  const [chats, images, videos, docs] = await Promise.all([
    latest('chat_sessions', 'id, title, updated_at', (r) => ({
      kind: 'chat',
      id: r.id,
      title: r.title || 'Chat',
      created_at: r.updated_at,
      href: `/dashboard/ai-apps/multillm-chatgpt?session=${r.id}`,
    })),
    latest('image_generations', 'id, prompt, created_at, image_urls', (r) => ({
      kind: 'image',
      id: r.id,
      title: r.prompt?.slice(0, 60) || 'Image Generated',
      created_at: r.created_at,
      thumbnail: Array.isArray(r.image_urls) ? r.image_urls[0] : null,
      href: `/dashboard/ai-apps/image-generator`,
    })),
    latest('interior_designs', 'id, prompt, created_at, image_urls', (r) => ({
      kind: 'video',
      id: r.id,
      title: r.prompt?.slice(0, 60) || 'Design Created',
      created_at: r.created_at,
      thumbnail: Array.isArray(r.image_urls) ? r.image_urls[0] : null,
      href: `/dashboard/ai-apps/interior-design`,
    })),
    latest('documents', 'id, original_name, created_at', (r) => ({
      kind: 'document',
      id: r.id,
      title: r.original_name || 'Document',
      created_at: r.created_at,
      href: `/dashboard/ai-apps/chat-with-pdf?doc=${r.id}`,
    })),
  ]);

  return NextResponse.json({
    success: true,
    recent: [...chats, ...images, ...videos, ...docs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10),
  });
}
