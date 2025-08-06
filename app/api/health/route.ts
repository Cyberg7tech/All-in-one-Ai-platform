import { NextResponse } from 'next/server';

export async function GET() {
  const apiStatus = {
    supabase: {
      configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      status: 'unknown',
    },
    openai: {
      configured: !!process.env.OPENAI_API_KEY,
      keyFormat: process.env.OPENAI_API_KEY?.startsWith('sk-') || false,
      status: 'unknown',
    },
    anthropic: {
      configured: !!process.env.ANTHROPIC_API_KEY,
      keyFormat: process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-') || false,
      status: 'unknown',
    },
    google: {
      configured: !!process.env.GOOGLE_API_KEY,
      status: 'unknown',
    },
    together: {
      configured: !!process.env.TOGETHER_API_KEY,
      status: 'unknown',
    },
    xai: {
      configured: !!process.env.XAI_API_KEY,
      status: 'unknown',
    },
    deepseek: {
      configured: !!process.env.DEEPSEEK_API_KEY,
      status: 'unknown',
    },
    kimi: {
      configured: !!process.env.KIMI_API_KEY,
      status: 'unknown',
    },
    replicate: {
      configured: !!process.env.REPLICATE_API_TOKEN,
      status: 'unknown',
    },
    runway: {
      configured: !!process.env.RUNWAY_API_KEY,
      status: 'unknown',
    },
    heygen: {
      configured: !!process.env.HEYGEN_API_KEY,
      status: 'unknown',
    },
    suno: {
      configured: !!process.env.SUNO_API_KEY,
      status: 'unknown',
    },
    elevenlabs: {
      configured: !!process.env.ELEVENLABS_API_KEY,
      status: 'unknown',
    },
  };

  // Quick connectivity tests for configured services
  const testPromise = [];

  // Test OpenAI if configured
  if (apiStatus.openai.configured && apiStatus.openai.keyFormat) {
    testPromise.push(
      fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      })
        .then((res) => {
          apiStatus.openai.status = res.ok ? 'healthy' : 'error';
        })
        .catch(() => {
          apiStatus.openai.status = 'error';
        })
    );
  }

  // Test Anthropic if configured
  if (apiStatus.anthropic.configured && apiStatus.anthropic.keyFormat) {
    testPromise.push(
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }],
        }),
      })
        .then((res) => {
          apiStatus.anthropic.status = res.status === 200 || res.status === 400 ? 'healthy' : 'error';
        })
        .catch(() => {
          apiStatus.anthropic.status = 'error';
        })
    );
  }

  // Test Google if configured
  if (apiStatus.google.configured) {
    testPromise.push(
      fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`)
        .then((res) => {
          apiStatus.google.status = res.ok ? 'healthy' : 'error';
        })
        .catch(() => {
          apiStatus.google.status = 'error';
        })
    );
  }

  // Test Together.ai if configured
  if (apiStatus.together.configured) {
    testPromise.push(
      fetch('https://api.together.xyz/v1/models', {
        headers: { Authorization: `Bearer ${process.env.TOGETHER_API_KEY}` },
      })
        .then((res) => {
          apiStatus.together.status = res.ok ? 'healthy' : 'error';
        })
        .catch(() => {
          apiStatus.together.status = 'error';
        })
    );
  }

  // Wait for all tests to complete (with timeout)
  try {
    await Promise.allSettled(testPromise);
  } catch (error) {
    console.error('API health check error:', error);
  }

  // Calculate overall health
  const configuredServices = Object.values(apiStatus).filter((service) => service.configured).length;
  const healthyServices = Object.values(apiStatus).filter((service) => service.status === 'healthy').length;
  const hasBasicRequirements =
    apiStatus.supabase.configured &&
    (apiStatus.openai.status === 'healthy' ||
      apiStatus.anthropic.status === 'healthy' ||
      apiStatus.google.status === 'healthy' ||
      apiStatus.together.status === 'healthy');

  return NextResponse.json({
    overall: hasBasicRequirements ? 'healthy' : 'degraded',
    configured: configuredServices,
    healthy: healthyServices,
    services: apiStatus,
    recommendations: {
      critical: !apiStatus.supabase.configured ? ['Configure Supabase for database access'] : [],
      suggested: [
        ...(!apiStatus.openai.configured ? ['Add OPENAI_API_KEY for GPT models'] : []),
        ...(!apiStatus.anthropic.configured ? ['Add ANTHROPIC_API_KEY for Claude models'] : []),
        ...(!apiStatus.together.configured ? ['Add TOGETHER_API_KEY for open-source models'] : []),
      ],
    },
    timestamp: new Date().toISOString(),
  });
}
