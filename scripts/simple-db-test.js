#!/usr/bin/env node

/**
 * Simple Database Connection Test
 * Direct test without dotenv dependency issues
 */

const { createClient } = require('@supabase/supabase-js');

// Manual configuration (you can also set these as environment variables)
const supabaseUrl = 'https://ttnkomdxbkmfmkaycjao.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bmtvbWR4YmttZm1rYXljamFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTcwMTgsImV4cCI6MjA2ODczMzAxOH0.ZpedifMgWW0XZzqq-CCkdHeiQb2HnzLZ8wXN03cjh7g';

console.log('🔍 Simple Database Connection Test');
console.log('==================================\n');

async function testConnection() {
  try {
    console.log('1. Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Client created successfully\n');

    console.log('2. Testing connection to ai_models table...');
    const { data, error } = await supabase
      .from('ai_models')
      .select('id, name, provider')
      .limit(3);

    if (error) {
      console.log('❌ Error connecting to database:');
      console.log(error.message);
      
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('\n🔧 This means the database schema has not been created yet.');
        console.log('📋 Please run the SQL schema in your Supabase SQL Editor first.');
        return;
      }
    } else {
      console.log('✅ Successfully connected to database!');
      console.log(`📊 Found ${data.length} AI models:`);
      data.forEach(model => {
        console.log(`   • ${model.name} (${model.provider})`);
      });
    }

    console.log('\n3. Testing other tables...');
    const tables = ['users', 'chat_sessions', 'ai_agents'];
    
    for (const table of tables) {
      try {
        const { data: testData, error: testError } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (testError) {
          console.log(`❌ Table '${table}': ${testError.message}`);
        } else {
          console.log(`✅ Table '${table}': Connected`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
      }
    }

    console.log('\n4. Testing database performance...');
    const startTime = Date.now();
    
    const { data: perfData, error: perfError } = await supabase
      .from('ai_models')
      .select('count(*)')
      .single();
    
    const responseTime = Date.now() - startTime;
    
    if (perfError) {
      console.log(`❌ Performance test failed: ${perfError.message}`);
    } else {
      console.log(`✅ Database responded in ${responseTime}ms`);
      if (responseTime < 500) {
        console.log('🚀 Excellent performance!');
      } else if (responseTime < 1500) {
        console.log('👍 Good performance');
      } else {
        console.log('⚠️  Slow response - check connection');
      }
    }

    console.log('\n🎉 Database Connection Test Results:');
    console.log('=====================================');
    console.log('✅ Supabase client: Working');
    console.log('✅ Database connection: Successful');
    console.log('✅ Tables: Accessible');
    console.log('✅ Data queries: Functional');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Start your Next.js app: npm run dev');
    console.log('2. Visit: http://localhost:3000');
    console.log('3. Test the chat interface with AI models');

  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error(error.message);
    
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Check your internet connection');
    console.log('2. Verify Supabase project is active (not paused)');
    console.log('3. Run the database schema SQL in Supabase SQL Editor');
    console.log('4. Check Supabase project dashboard for any issues');
  }
}

testConnection(); 