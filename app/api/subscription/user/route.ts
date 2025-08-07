import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select(
        'subscription_status, subscription_id, subscription_provider, subscription_plan, subscription_start_date, subscription_end_date'
      )
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user subscription:', error);
      return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
    }

    return NextResponse.json({
      subscription: {
        status: userData.subscription_status || 'inactive',
        plan: userData.subscription_plan || 'Free',
        provider: userData.subscription_provider || 'none',
        start_date: userData.subscription_start_date,
        end_date: userData.subscription_end_date,
        subscription_id: userData.subscription_id,
      },
    });
  } catch (error) {
    console.error('User subscription API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
