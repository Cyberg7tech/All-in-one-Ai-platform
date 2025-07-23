import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import Replicate from 'replicate';

// AI Model Types
export type AIProvider = 'openai' | 'anthropic' | 'replicate' | 'runway' | 'heygen' | 'suno';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  type: 'text' | 'image' | 'video' | 'audio' | 'multimodal';
  maxTokens?: number;
  costPer1kTokens?: number;
  description?: string;
}

// Available Models Configuration
export const AI_MODELS: Record<AIProvider, AIModel[]> = {
  openai: [
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      type: 'text',
      maxTokens: 128000,
      costPer1kTokens: 0.03,
      description: 'Most capable GPT-4 model with 128k context'
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
      id: 'gpt-4-vision-preview',
      name: 'GPT-4 Vision',
      provider: 'openai',
      type: 'multimodal',
      maxTokens: 128000,
      costPer1kTokens: 0.03,
      description: 'GPT-4 with vision capabilities'
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      type: 'text',
      maxTokens: 16385,
      costPer1kTokens: 0.002,
      description: 'Fast and cost-effective for simple tasks'
    },
    {
      id: 'dall-e-3',
      name: 'DALL-E 3',
      provider: 'openai',
      type: 'image',
      description: 'Advanced AI image generation'
    }
  ],
  anthropic: [
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      type: 'text',
      maxTokens: 200000,
      costPer1kTokens: 0.075,
      description: 'Most powerful Claude model for complex reasoning'
    },
    {
      id: 'claude-3-sonnet-20240229',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      type: 'text',
      maxTokens: 200000,
      costPer1kTokens: 0.015,
      description: 'Balanced performance and speed'
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      type: 'text',
      maxTokens: 200000,
      costPer1kTokens: 0.0008,
      description: 'Fastest Claude model for simple tasks'
    }
  ],
  replicate: [
    {
      id: 'meta/llama-2-70b-chat',
      name: 'Llama 2 70B',
      provider: 'replicate',
      type: 'text',
      description: 'Open source large language model'
    },
    {
      id: 'stability-ai/sdxl',
      name: 'Stable Diffusion XL',
      provider: 'replicate',
      type: 'image',
      description: 'High-quality image generation'
    },
    {
      id: 'riffusion/riffusion',
      name: 'Riffusion',
      provider: 'replicate',
      type: 'audio',
      description: 'AI music generation'
    }
  ],
  runway: [
    {
      id: 'gen-2',
      name: 'Runway Gen-2',
      provider: 'runway',
      type: 'video',
      description: 'Text-to-video generation'
    }
  ],
  heygen: [
    {
      id: 'avatar-video',
      name: 'HeyGen Avatar',
      provider: 'heygen',
      type: 'video',
      description: 'AI avatar video generation'
    }
  ],
  suno: [
    {
      id: 'music-gen',
      name: 'Suno Music',
      provider: 'suno',
      type: 'audio',
      description: 'AI music composition'
    }
  ]
};

// AI Client Instances
class AIModelManager {
  private openaiClient: OpenAI;
  private anthropicClient: Anthropic;
  private replicateClient: Replicate;

  constructor() {
    // Initialize OpenAI
    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize Anthropic
    this.anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Initialize Replicate
    this.replicateClient = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }

  // Get all available models
  getAllModels(): AIModel[] {
    return Object.values(AI_MODELS).flat();
  }

  // Get models by provider
  getModelsByProvider(provider: AIProvider): AIModel[] {
    return AI_MODELS[provider] || [];
  }

  // Get models by type
  getModelsByType(type: AIModel['type']): AIModel[] {
    return this.getAllModels().filter(model => model.type === type);
  }

  // Find model by ID
  findModel(modelId: string): AIModel | undefined {
    return this.getAllModels().find(model => model.id === modelId);
  }

  // Get client for provider
  getClient(provider: AIProvider) {
    switch (provider) {
      case 'openai':
        return this.openaiClient;
      case 'anthropic':
        return this.anthropicClient;
      case 'replicate':
        return this.replicateClient;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  // Generate text completion
  async generateText(
    modelId: string,
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<string> {
    const model = this.findModel(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    const { maxTokens = 1000, temperature = 0.7, systemPrompt } = options;

    switch (model.provider) {
      case 'openai':
        const openaiResponse = await this.openaiClient.chat.completions.create({
          model: modelId,
          messages: [
            ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
            { role: 'user' as const, content: prompt }
          ],
          max_tokens: maxTokens,
          temperature,
        });
        return openaiResponse.choices[0]?.message?.content || '';

      case 'anthropic':
        const anthropicResponse = await this.anthropicClient.messages.create({
          model: modelId,
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          messages: [{ role: 'user', content: prompt }],
        });
        return anthropicResponse.content[0]?.type === 'text' ? anthropicResponse.content[0].text : '';

      case 'replicate':
        const replicateOutput = await this.replicateClient.run(modelId as `${string}/${string}`, {
          input: {
            prompt,
            max_tokens: maxTokens,
            temperature,
            ...(systemPrompt && { system_prompt: systemPrompt })
          }
        });
        return Array.isArray(replicateOutput) ? replicateOutput.join('') : String(replicateOutput);

      default:
        throw new Error(`Text generation not supported for provider: ${model.provider}`);
    }
  }

  // Generate image
  async generateImage(
    modelId: string,
    prompt: string,
    options: {
      width?: number;
      height?: number;
      num_images?: number;
    } = {}
  ): Promise<string[]> {
    const model = this.findModel(modelId);
    if (!model || model.type !== 'image') {
      throw new Error(`Image model ${modelId} not found`);
    }

    const { width = 1024, height = 1024, num_images = 1 } = options;

    switch (model.provider) {
      case 'openai':
        const openaiResponse = await this.openaiClient.images.generate({
          model: modelId,
          prompt,
          size: `${width}x${height}` as any,
          n: num_images,
          quality: 'hd',
        });
        return openaiResponse.data?.map(img => img.url!) || [];

      case 'replicate':
        const replicateOutput = await this.replicateClient.run(modelId as `${string}/${string}`, {
          input: {
            prompt,
            width,
            height,
            num_outputs: num_images,
          }
        });
        return Array.isArray(replicateOutput) ? replicateOutput : [String(replicateOutput)];

      default:
        throw new Error(`Image generation not supported for provider: ${model.provider}`);
    }
  }

  // Generate embeddings
  async generateEmbeddings(text: string): Promise<number[]> {
    const response = await this.openaiClient.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return response.data[0].embedding;
  }

  // Call external APIs (Runway, HeyGen, Suno)
  async callExternalAPI(
    provider: 'runway' | 'heygen' | 'suno',
    endpoint: string,
    data: any
  ): Promise<any> {
    const apiKeys = {
      runway: process.env.RUNWAY_API_KEY,
      heygen: process.env.HEYGEN_API_KEY,
      suno: process.env.SUNO_API_KEY,
    };

    const baseUrls = {
      runway: 'https://api.runwayml.com/v1',
      heygen: 'https://api.heygen.com/v1',
      suno: 'https://api.suno.ai/v1',
    };

    const apiKey = apiKeys[provider];
    const baseUrl = baseUrls[provider];

    if (!apiKey) {
      throw new Error(`API key not found for ${provider}`);
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`${provider} API error: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const aiModelManager = new AIModelManager();

// Default model configuration based on user preference
export const getDefaultModel = (type: AIModel['type'] = 'text'): string => {
  const defaultModels = {
    text: process.env.DEFAULT_MODEL || 'gpt-3.5-turbo',
    image: 'dall-e-3',
    video: 'gen-2',
    audio: 'music-gen',
    multimodal: 'gpt-4-vision-preview'
  };

  return defaultModels[type];
}; 