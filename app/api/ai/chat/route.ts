import { NextRequest, NextResponse } from 'next/server';
import { AIAPIService } from '@/lib/ai/api-integration';

const apiService = AIAPIService.getInstance();

// Helper function to get fallback model if primary fails
function getFallbackModel(): { model: string; provider: string } | null {
  // Only use Together AI models - no OpenAI fallback
  if (process.env.TOGETHER_API_KEY) {
    return { model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', provider: 'together' };
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Chat API: Received request');

    // Debug environment variables
    console.log('Environment check:', {
      hasTogetherKey: !!process.env.TOGETHER_API_KEY,
      togetherKeyLength: process.env.TOGETHER_API_KEY?.length || 0,
      nodeEnv: process.env.NODE_ENV,
    });

    const body = await request.json();
    const {
      messages,
      model = 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      maxTokens = 1000,
      temperature = 0.7,
    } = body;

    console.log('Chat API: Request details', {
      model,
      messagesCount: messages?.length,
      maxTokens,
      temperature,
    });

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          content: 'No messages provided.',
          error: 'Invalid request',
        },
        { status: 400 }
      );
    }

    let response: any;
    let usedModel = model;
    let usedProvider: string = apiService.getProviderForModel(model);
    let cost = 0;

    // Try primary model first
    try {
      // ensure model exists in DB to avoid downstream FK issues
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/models/ensure`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: usedModel }),
          cache: 'no-store',
        });
      } catch (e) {
        // best-effort; ignore
      }
      console.log(`Attempting ${usedProvider} with model ${usedModel}`);

      response = await apiService.chat(messages, usedModel, {
        maxTokens,
        temperature,
      });

      // Check if the response indicates an error
      if (response && 'error' in response && response.error) {
        throw new Error(`${usedProvider} error: ${response.content}`);
      }
    } catch (primaryError) {
      console.log('Primary model failed, attempting fallback...', primaryError);

      // Try fallback model
      const fallback = getFallbackModel();
      if (fallback) {
        usedModel = fallback.model;
        usedProvider = fallback.provider;

        console.log(`Trying fallback: ${usedModel} (${usedProvider})`);

        try {
          response = await apiService.chat(messages, usedModel, {
            maxTokens,
            temperature,
          });
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          response = null;
        }
      }
    }

    // If both primary and fallback failed, return helpful error
    if (!response || (response && 'error' in response && response.error)) {
      console.error('All models failed, returning error response');

      const hasOpenAI = process.env.OPENAI_API_KEY?.startsWith('sk-');
      const hasTogether = process.env.TOGETHER_API_KEY;

      if (!hasOpenAI && !hasTogether) {
        return NextResponse.json({
          success: false,
          content: `I apologize, but I'm currently unable to process your request. The AI services appear to be unavailable.

**Troubleshooting Steps:**
1. **Check API Configuration**: Visit /api/health to check API status
2. **Verify API Keys**: Ensure your API keys are properly configured
3. **Try Different Model**: Select a different AI model from the dropdown
4. **Check Network**: Verify your internet connection

**Available Providers:**
- OpenAI (GPT models): ${hasOpenAI ? '✅ Configured' : '❌ Not configured'}
- Together.ai (Open models): ${hasTogether ? '✅ Configured' : '❌ Not configured'}

*Please configure at least one API provider to use the chat feature.*`,
          model: usedModel,
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          cost: 0,
          error: true,
          provider: usedProvider,
          troubleshooting: {
            healthCheck: '/api/health',
            documentation: 'Check README.md for setup instructions',
          },
        });
      }
    }

    // Ensure we have a valid response
    if (!response || !response.content) {
      throw new Error('Invalid response from AI service');
    }

    // Calculate approximate cost (simplified)
    const inputTokens = response.usage?.input_tokens || response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.output_tokens || response.usage?.completion_tokens || 0;

    // Simplified cost calculation (actual rates vary by provider and model)
    cost = inputTokens * 0.0001 + outputTokens * 0.0002;

    console.log('Chat API: Success', {
      model: usedModel,
      provider: usedProvider,
      contentLength: response.content?.length || 0,
      tokens: inputTokens + outputTokens,
      cost,
    });

    return NextResponse.json({
      success: true,
      content: response.content,
      model: usedModel,
      usage: response.usage || {
        prompt_tokens: inputTokens,
        completion_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
      },
      cost,
      provider: usedProvider,
      metadata: {
        originalModel: model,
        fallbackUsed: usedModel !== model,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);

    return NextResponse.json(
      {
        success: false,
        content:
          'I apologize, but I encountered an unexpected error. Please try again or contact support if the issue persists.',
        error: error instanceof Error ? error.message : 'Unknown error',
        model: 'unknown',
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        cost: 0,
        provider: 'error',
      },
      { status: 500 }
    );
  }
}
