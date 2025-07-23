import { NextRequest, NextResponse } from 'next/server';
import { AIAPIService } from '@/lib/ai/api-integration';

const apiService = AIAPIService.getInstance();

export async function POST(request: NextRequest) {
  try {
    console.log('Chat API: Received request');
    
    const body = await request.json();
    const { 
      messages, 
      model = 'gpt-4o-mini', 
      maxTokens = 1000, 
      temperature = 0.7,
      stream = false 
    } = body;

    console.log('Chat API: Request details', {
      model,
      messagesCount: messages?.length,
      maxTokens,
      temperature
    });

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    let response: any;
    let cost = 0;

    // Route to appropriate API based on model
    if (model.startsWith('gpt-') || model.startsWith('o1') || model.startsWith('o3') || model.startsWith('o4')) {
      console.log('Chat API: Calling OpenAI');
      response = await apiService.callOpenAI(messages, model, {
        maxTokens,
        temperature
      });
      
      // Calculate cost for OpenAI
      const tokensUsed = response.usage?.total_tokens || 0;
      const costPerToken = getCostPerToken(model, 'openai');
      cost = tokensUsed * costPerToken;

    } else if (model.startsWith('claude-')) {
      console.log('Chat API: Calling Anthropic');
      response = await apiService.callAnthropic(messages, model, {
        maxTokens,
        temperature
      });
      
      // Calculate cost for Anthropic
      const inputTokens = response.usage?.input_tokens || 0;
      const outputTokens = response.usage?.output_tokens || 0;
      cost = (inputTokens * 0.003 / 1000) + (outputTokens * 0.015 / 1000);

    } else if (model.startsWith('grok-')) {
      console.log('Chat API: Calling xAI');
      response = await apiService.callXAI(messages, model, {
        maxTokens,
        temperature
      });
      
      const tokensUsed = response.usage?.total_tokens || 0;
      cost = tokensUsed * 0.001; // Estimated cost

    } else if (model.startsWith('gemini-')) {
      console.log('Chat API: Calling Google Gemini');
      response = await apiService.callGemini(messages, model, {
        maxTokens,
        temperature
      });
      
      const tokensUsed = response.usage?.totalTokenCount || 0;
      cost = tokensUsed * 0.002; // Estimated cost

    } else if (model.startsWith('deepseek-')) {
      console.log('Chat API: Calling DeepSeek');
      response = await apiService.callDeepSeek(messages, model, {
        maxTokens,
        temperature
      });
      
      const tokensUsed = response.usage?.total_tokens || 0;
      cost = tokensUsed * 0.0005; // Estimated cost

    } else if (model.startsWith('kimi-')) {
      console.log('Chat API: Calling Kimi');
      response = await apiService.callKimi(messages, model, {
        maxTokens,
        temperature
      });
      
      const tokensUsed = response.usage?.total_tokens || 0;
      cost = tokensUsed * 0.0001; // Estimated cost

    } else if (model.startsWith('llama-') || model.startsWith('mixtral-')) {
      console.log('Chat API: Calling Replicate');
      const prompt = messages.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n');
      const output = await apiService.callReplicate(
        getReplicateModel(model),
        {
          prompt,
          max_new_tokens: maxTokens,
          temperature,
          repetition_penalty: 1.1
        }
      );
      
      response = {
        content: Array.isArray(output) ? output.join('') : output,
        usage: { total_tokens: 0 },
        model
      };
      cost = 0.001; // Estimated cost for Replicate

    } else {
      return NextResponse.json(
        { error: 'Unsupported model' },
        { status: 400 }
      );
    }

    console.log('Chat API: Success');
    return NextResponse.json({
      success: true,
      content: response.content,
      usage: response.usage,
      cost,
      model: response.model || model,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Chat request failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

function getCostPerToken(model: string, provider: string): number {
  // Cost mapping for different models (per 1000 tokens)
  const costs: Record<string, number> = {
    'gpt-4.1': 0.03,
    'gpt-4.1-mini': 0.015,
    'gpt-4.1-nano': 0,
    'gpt-4o-mini': 0,
    'gpt-4o': 0.03,
    'gpt-4-turbo': 0.03,
    'gpt-3.5-turbo': 0,
    'o1-mini': 0.015,
    'o1': 0.03,
    'o3-mini': 0.015,
    'o3': 0.03,
    'o4-mini': 0.0075
  };
  
  return (costs[model] || 0.002) / 1000;
}

function getReplicateModel(model: string): string {
  const replicateModels: Record<string, string> = {
    'llama-3.3-70b': 'meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3',
    'llama-3.1-405b': 'meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3',
    'llama-4-maverick': 'meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3',
    'mixtral-8x7b': 'mistralai/mixtral-8x7b-instruct-v0.1:25b2bad42625e001c7e88fbc7c97d5f7e924f93a8bdd5c38cfaa9c85d41bb5e2'
  };
  
  return replicateModels[model] || replicateModels['llama-3.3-70b'];
} 