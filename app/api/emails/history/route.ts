import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'email')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching email history:', error);
      return NextResponse.json({ error: 'Failed to fetch email history' }, { status: 500 });
    }

    // Transform activities to email history format
    const emails = activities.map((activity) => ({
      id: activity.id,
      to: activity.metadata?.recipients || 'Unknown',
      subject: activity.metadata?.subject || 'No subject',
      status: activity.metadata?.status || 'unknown',
      created_at: activity.timestamp,
    }));

    return NextResponse.json({ emails });
  } catch (error) {
    console.error('Email history API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
