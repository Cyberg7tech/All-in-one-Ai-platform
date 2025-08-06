import { NextResponse } from 'next/server';
import { AIAPIService } from '@/lib/ai/api-integration';

const apiService = AIAPIService.getInstance();

export async function GET() {
  try {
    // Get all available models from the AI API service
    const availableModels = apiService.getAvailableModels();

    // Add additional metadata and categorization
    const enhancedModels = availableModels.map((model) => ({
      ...model,
      // Add pricing tier information
      tier:
        model.provider === 'aimlapi' ? 'premium' : model.provider === 'openai' ? 'standard' : 'open-source',

      // Add capability tags
      capabilities: [
        'chat',
        ...(model.category === 'reasoning' ? ['reasoning', 'math', 'code'] : []),
        ...(model.category === 'search' ? ['web-search', 'real-time'] : []),
        ...(model.provider === 'aimlapi' ? ['multimodal'] : []),
      ],

      // Add context window information (approximate)
      contextWindow: model.id.includes('gpt-4')
        ? 128000
        : model.id.includes('claude')
          ? 200000
          : model.id.includes('gemini')
            ? 1000000
            : model.id.includes('llama')
              ? 131072
              : 32768,

      // Add speed rating
      speed:
        model.provider === 'together'
          ? 'fast'
          : model.id.includes('mini') || model.id.includes('flash')
            ? 'fast'
            : model.id.includes('o1') || model.id.includes('opus')
              ? 'slow'
              : 'medium',
    }));

    // Group models by category for better organization
    const groupedModels = {
      reasoning: enhancedModels.filter((m) => m.category === 'reasoning'),
      chat: enhancedModels.filter((m) => m.category === 'chat'),
      search: enhancedModels.filter((m) => m.category === 'search'),
      all: enhancedModels,
    };

    return NextResponse.json({
      success: true,
      models: groupedModels,
      total: enhancedModels.length,
      providers: {
        openai: enhancedModels.filter((m) => m.provider === 'openai').length,
        aimlapi: enhancedModels.filter((m) => m.provider === 'aimlapi').length,
        together: enhancedModels.filter((m) => m.provider === 'together').length,
      },
      configuration: {
        openai_configured: !!process.env.OPENAI_API_KEY?.startsWith('sk-'),
        aimlapi_configured: !!process.env.AIML_API_KEY,
        together_configured: !!process.env.TOGETHER_API_KEY,
      },
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch available models',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
