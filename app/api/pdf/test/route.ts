import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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
    console.log('Testing chat_with_file table for user:', userId);

    // Get all chat_with_file records for this user
    const { data: chatFiles, error } = await supabase
      .from('chat_with_file')
      .select('id, filename, file, chat_history, history_metadata, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Found chat_with_file records:', chatFiles?.length);

    const filesWithContent = chatFiles?.filter((f) => f.file && f.file.trim().length > 0) || [];
    console.log('Files with content:', filesWithContent.length);

    return NextResponse.json({
      success: true,
      userId,
      totalFiles: chatFiles?.length || 0,
      filesWithContent: filesWithContent.length,
      latestFile: chatFiles?.[0]
        ? {
            id: chatFiles[0].id,
            filename: chatFiles[0].filename,
            contentLength: chatFiles[0].file?.length || 0,
            contentPreview: chatFiles[0].file?.substring(0, 200) || 'No content',
            createdAt: chatFiles[0].created_at,
            chatHistoryLength: chatFiles[0].chat_history?.length || 0,
            historyMetadata: chatFiles[0].history_metadata,
          }
        : null,
      allFiles:
        chatFiles?.map((f) => ({
          id: f.id,
          filename: f.filename,
          contentLength: f.file?.length || 0,
          createdAt: f.created_at,
          chatHistoryLength: f.chat_history?.length || 0,
        })) || [],
    });
  } catch (e: any) {
    console.error('Test endpoint error:', e);
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
