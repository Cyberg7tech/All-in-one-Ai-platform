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
    console.log('Testing database connection for user:', userId);

    // Get all documents for this user
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, original_name, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Found documents:', documents?.length);
    
    const documentsWithContent = documents?.filter(d => d.content && d.content.trim().length > 0) || [];
    console.log('Documents with content:', documentsWithContent.length);

    return NextResponse.json({
      success: true,
      userId,
      totalDocuments: documents?.length || 0,
      documentsWithContent: documentsWithContent.length,
      latestDocument: documents?.[0] ? {
        id: documents[0].id,
        name: documents[0].original_name,
        contentLength: documents[0].content?.length || 0,
        contentPreview: documents[0].content?.substring(0, 200) || 'No content',
        createdAt: documents[0].created_at
      } : null,
      allDocuments: documents?.map(d => ({
        id: d.id,
        name: d.original_name,
        contentLength: d.content?.length || 0,
        createdAt: d.created_at
      })) || []
    });
  } catch (e: any) {
    console.error('Test endpoint error:', e);
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
