import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // This is a read-only operation
        },
      },
    }
  );

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return NextResponse.json({
      isAuthenticated: !!session,
      user: session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name,
          }
        : null,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      isAuthenticated: false,
      user: null,
    });
  }
}
