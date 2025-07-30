// AI Model Types - Simplified for OpenAI + Together AI only
export type AIProvider = 'openai' | 'together';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  type: 'text' | 'image' | 'audio' | 'multimodal';
  maxTokens?: number;
  costPer1kTokens?: number;
  description?: string;
  contextLength?: number;
}

// Available Models Configuration - OpenAI + Together AI only
export const AI_MODELS: Record<AIProvider, AIModel[]> = {
  openai: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      type: 'multimodal',
      maxTokens: 128000,
      costPer1kTokens: 0.015,
      description: 'Latest multimodal GPT-4 model with vision and reasoning'
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      type: 'text',
      maxTokens: 128000,
      costPer1kTokens: 0.0015,
      description: 'Fast and cost-effective GPT-4 class model'
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      type: 'text',
      maxTokens: 128000,
      costPer1kTokens: 0.03,
      description: 'Advanced GPT-4 model with large context window'
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      type: 'text',
      maxTokens: 8192,
      costPer1kTokens: 0.06,
      description: 'High-quality reasoning and complex tasks'
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      type: 'text',
      maxTokens: 16385,
      costPer1kTokens: 0.002,
      description: 'Fast and efficient for most tasks'
    }
  ],
  together: [
    // Meta Llama Models
    {
      id: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
      name: 'Llama 3.1 405B Instruct',
      provider: 'together',
      type: 'text',
      contextLength: 131072,
      costPer1kTokens: 0.005,
      description: 'Most capable open-source model, rivals GPT-4'
    },
    {
      id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      name: 'Llama 3.1 70B Instruct',
      provider: 'together',
      type: 'text',
      contextLength: 131072,
      costPer1kTokens: 0.0009,
      description: 'High-quality open model for complex reasoning'
    },
    {
      id: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      name: 'Llama 3.1 8B Instruct',
      provider: 'together',
      type: 'text',
      contextLength: 131072,
      costPer1kTokens: 0.0002,
      description: 'Fast and efficient for general tasks'
    },
    {
      id: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
      name: 'Llama 3.2 11B Vision',
      provider: 'together',
      type: 'multimodal',
      contextLength: 131072,
      costPer1kTokens: 0.0005,
      description: 'Multimodal model with vision capabilities'
    },
    
    // Qwen Models
    {
      id: 'Qwen/Qwen2.5-72B-Instruct-Turbo',
      name: 'Qwen 2.5 72B Instruct',
      provider: 'together',
      type: 'text',
      contextLength: 32768,
      costPer1kTokens: 0.0009,
      description: 'Advanced Chinese and English model'
    },
    {
      id: 'Qwen/Qwen2.5-7B-Instruct-Turbo',
      name: 'Qwen 2.5 7B Instruct',
      provider: 'together',
      type: 'text',
      contextLength: 32768,
      costPer1kTokens: 0.0002,
      description: 'Efficient multilingual model'
    },
    
    // Mistral Models
    {
      id: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      name: 'Mixtral 8x7B Instruct',
      provider: 'together',
      type: 'text',
      contextLength: 32768,
      costPer1kTokens: 0.0006,
      description: 'High-performance mixture of experts model'
    },
    {
      id: 'mistralai/Mistral-7B-Instruct-v0.3',
      name: 'Mistral 7B Instruct',
      provider: 'together',
      type: 'text',
      contextLength: 32768,
      costPer1kTokens: 0.0002,
      description: 'Efficient and capable for most tasks'
    },
    
    // DeepSeek Models (available via Together AI)
    {
      id: 'deepseek-ai/deepseek-llm-67b-chat',
      name: 'DeepSeek 67B Chat',
      provider: 'together',
      type: 'text',
      contextLength: 4096,
      costPer1kTokens: 0.0009,
      description: 'Advanced reasoning and code generation'
    },
    
    // Nous Research Models
    {
      id: 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
      name: 'Nous Hermes 2 Mixtral 8x7B',
      provider: 'together',
      type: 'text',
      contextLength: 32768,
      costPer1kTokens: 0.0006,
      description: 'Fine-tuned for helpful and harmless responses'
    },
    
    // Code-specific models
    {
      id: 'codellama/CodeLlama-70b-Instruct-hf',
      name: 'Code Llama 70B Instruct',
      provider: 'together',
      type: 'text',
      contextLength: 16384,
      costPer1kTokens: 0.0009,
      description: 'Specialized for code generation and programming'
    },
    {
      id: 'codellama/CodeLlama-13b-Instruct-hf',
      name: 'Code Llama 13B Instruct',
      provider: 'together',
      type: 'text',
      contextLength: 16384,
      costPer1kTokens: 0.0003,
      description: 'Efficient code model for development tasks'
    }
  ]
};

// Flatten all models for easy access
export const ALL_MODELS: AIModel[] = Object.values(AI_MODELS).flat();

// Get models by provider
export const getModelsByProvider = (provider: AIProvider): AIModel[] => {
  return AI_MODELS[provider] || [];
};

// Get model by ID
export const getModelById = (id: string): AIModel | undefined => {
  return ALL_MODELS.find(model => model.id === id);
};

// Get popular models for quick selection
export const POPULAR_MODELS: AIModel[] = [
  // OpenAI popular models
  getModelById('gpt-4o-mini')!,
  getModelById('gpt-4o')!,
  getModelById('gpt-4-turbo')!,
  
  // Together AI popular models
  getModelById('meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo')!,
  getModelById('meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo')!,
  getModelById('mistralai/Mixtral-8x7B-Instruct-v0.1')!,
  getModelById('Qwen/Qwen2.5-72B-Instruct-Turbo')!,
].filter(Boolean);

// Default model
export const DEFAULT_MODEL = getModelById('gpt-4o-mini')!;

// Model categories for UI organization
export const MODEL_CATEGORIES = {
  'OpenAI Models': getModelsByProvider('openai'),
  'Meta Llama (Together AI)': getModelsByProvider('together').filter(m => m.id.includes('llama')),
  'Qwen (Together AI)': getModelsByProvider('together').filter(m => m.id.includes('Qwen')),
  'Mistral (Together AI)': getModelsByProvider('together').filter(m => m.id.includes('mistral')),
  'Code Models (Together AI)': getModelsByProvider('together').filter(m => m.id.includes('CodeLlama')),
  'Other (Together AI)': getModelsByProvider('together').filter(m => 
    !m.id.includes('llama') && 
    !m.id.includes('Qwen') && 
    !m.id.includes('mistral') && 
    !m.id.includes('CodeLlama')
  )
};

// Helper function to determine provider from model ID
export const getProviderFromModelId = (modelId: string): AIProvider => {
  const model = getModelById(modelId);
  return model?.provider || 'together'; // Default to Together AI for unknown models
}; 