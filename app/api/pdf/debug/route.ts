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
    console.log('Debug: User ID:', userId);

    // Test 1: Check if table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('chat_with_file')
      .select('count')
      .limit(1);

    if (tableError) {
      console.error('Table check error:', tableError);
      return NextResponse.json({
        error: 'Table access error',
        details: tableError,
        step: 'table_check'
      }, { status: 500 });
    }

    // Test 2: Try to insert a test record
    const testData = {
      user_id: userId,
      file: 'Test content for debugging',
      filename: 'debug-test.pdf',
      chat_history: [],
      history_metadata: `Debug test: ${new Date().toISOString()}`
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('chat_with_file')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.error('Insert test error:', insertError);
      return NextResponse.json({
        error: 'Insert test failed',
        details: insertError,
        step: 'insert_test'
      }, { status: 500 });
    }

    // Test 3: Try to read the test record
    const { data: readResult, error: readError } = await supabase
      .from('chat_with_file')
      .select('*')
      .eq('id', insertResult.id)
      .single();

    if (readError) {
      console.error('Read test error:', readError);
      return NextResponse.json({
        error: 'Read test failed',
        details: readError,
        step: 'read_test'
      }, { status: 500 });
    }

    // Test 4: Clean up test record
    const { error: deleteError } = await supabase
      .from('chat_with_file')
      .delete()
      .eq('id', insertResult.id);

    if (deleteError) {
      console.error('Delete test error:', deleteError);
      // Don't fail the test for cleanup errors
    }

    return NextResponse.json({
      success: true,
      message: 'All database tests passed',
      tests: {
        table_exists: true,
        insert_works: true,
        read_works: true,
        delete_works: !deleteError
      },
      user_id: userId,
      test_record_id: insertResult.id
    });

  } catch (e: any) {
    console.error('Debug endpoint error:', e);
    return NextResponse.json({
      error: e?.message || 'Unknown error',
      stack: e?.stack
    }, { status: 500 });
  }
}
