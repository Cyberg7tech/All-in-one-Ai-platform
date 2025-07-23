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

    // Route to appropriate provider based on model or provider field
    try {
      if (model.includes('gpt-') || model.includes('o1-')) {
        // OpenAI models
        response = await apiService.chatWithOpenAI(messages, model, { maxTokens, temperature });
      } else if (model.includes('claude-')) {
        // Anthropic models
        response = await apiService.chatWithAnthropic(messages, model, { maxTokens, temperature });
      } else if (model.startsWith('meta-llama/') || model.startsWith('mistralai/') || model.startsWith('deepseek-ai/') || model.startsWith('Qwen/')) {
        // Together.ai models
        response = await apiService.chatWithTogether(messages, model, { maxTokens, temperature });
      } else if (model.includes('gemini') || model.includes('google/')) {
        // Google models
        response = await apiService.callGemini(messages, model, { maxTokens, temperature });
      } else if (model.includes('grok') || model.includes('xai')) {
        // xAI models  
        response = await apiService.callXAI(messages, model, { maxTokens, temperature });
      } else if (model.includes('deepseek')) {
        // DeepSeek models
        response = await apiService.callDeepSeek(messages, model, { maxTokens, temperature });
      } else if (model.includes('kimi')) {
        // Kimi models
        response = await apiService.callKimi(messages, model, { maxTokens, temperature });
      } else {
        // Default to Together.ai for unknown models (many open-source models)
        response = await apiService.chatWithTogether(messages, model, { maxTokens, temperature });
      }

      // Ensure we have a valid response
      if (!response || !response.content) {
        throw new Error('Invalid response from AI service');
      }

      // Calculate approximate cost (simplified)
      const inputTokens = response.usage?.input_tokens || response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.output_tokens || response.usage?.completion_tokens || 0;
      
      // Simplified cost calculation (actual rates vary by provider and model)
      cost = (inputTokens * 0.0001) + (outputTokens * 0.0002);

      console.log('Chat API: Success', {
        model: response.model || model,
        contentLength: response.content?.length || 0,
        hasError: !!response.error,
        cost
      });

      return NextResponse.json({
        success: true,
        content: response.content,
        model: response.model || model,
        usage: response.usage || {
          prompt_tokens: inputTokens,
          completion_tokens: outputTokens,
          total_tokens: inputTokens + outputTokens
        },
        cost,
        provider: getProviderFromModel(model)
      });

    } catch (apiError) {
      console.error('AI API Error:', apiError);
      
      // Return a user-friendly error message
      return NextResponse.json({
        success: false,
        content: `I apologize, but I'm experiencing technical difficulties. This could be due to:

• **API Configuration**: Missing or invalid API keys
• **Network Issues**: Temporary connectivity problems  
• **Rate Limits**: API usage limits reached
• **Model Availability**: Selected model may be temporarily unavailable

**Suggested Actions:**
1. Try a different model from the dropdown
2. Check your internet connection
3. Verify API keys are configured correctly
4. Try again in a few moments

*Error details have been logged for troubleshooting.*`,
        model,
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        cost: 0,
        error: true,
        provider: getProviderFromModel(model)
      });
    }

  } catch (error) {
    console.error('Chat API: General error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// Helper function to determine provider from model name
function getProviderFromModel(model: string): string {
  if (model.includes('gpt-') || model.includes('o1-')) return 'openai';
  if (model.includes('claude-')) return 'anthropic';
  if (model.includes('gemini') || model.includes('google/')) return 'google';
  if (model.includes('grok') || model.includes('xai')) return 'xai';
  if (model.includes('deepseek')) return 'deepseek';
  if (model.includes('kimi')) return 'kimi';
  if (model.startsWith('meta-llama/') || model.startsWith('mistralai/') || model.startsWith('Qwen/')) return 'together';
  return 'together'; // Default to Together.ai for open-source models
} 