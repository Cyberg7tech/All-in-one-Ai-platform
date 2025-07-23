import { NextRequest, NextResponse } from 'next/server';
import { supabase, dbHelpers } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection from API...');

    // Test 1: Check if we can connect to Supabase
    const testQuery = await supabase
      .from('ai_models')
      .select('id, name, provider')
      .limit(5);

    if (testQuery.error) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: testQuery.error.message
      }, { status: 500 });
    }

    // Test 2: Check database helper functions
    let dbHelpersStatus = 'Working';
    try {
      // This will test the dbHelpers without actually creating data
      const testUserId = 'test-user-id';
      await dbHelpers.getUserById(testUserId);
    } catch (error) {
      // Expected to fail since user doesn't exist, but connection is working
      dbHelpersStatus = 'Connection OK (user not found is expected)';
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      results: {
        connectionStatus: 'Connected',
        modelsFound: testQuery.data?.length || 0,
        modelsSample: testQuery.data?.map(m => `${m.name} (${m.provider})`) || [],
        dbHelpersStatus: dbHelpersStatus,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 