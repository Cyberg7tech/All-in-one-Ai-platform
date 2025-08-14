// AI Model Manager - BuilderKit Pro Pattern
// Centralized model management following BuilderKit.ai documentation

import { AIAPIService } from './api-integration';
// import { AI_MODELS } from './models';

export interface ModelCapability {
  id: string;
  name: string;
  description: string;
  requiredKeys: string[];
}

export interface ModelProvider {
  id: string;
  name: string;
  description: string;
  apiKeyEnv: string;
  isConfigured: boolean;
  supportedCapabilities: string[];
}

export class AIModelManager {
  private static instance: AIModelManager;
  private apiService: AIAPIService;

  constructor() {
    this.apiService = AIAPIService.getInstance();
  }

  static getInstance(): AIModelManager {
    if (!AIModelManager.instance) {
      AIModelManager.instance = new AIModelManager();
    }
    return AIModelManager.instance;
  }

  // Define AI capabilities supported by the platform
  getCapabilities(): ModelCapability[] {
    return [
      {
        id: 'chat',
        name: 'Text Chat',
        description: 'Conversational AI for general purpose chat',
        requiredKeys: ['OPENAI_API_KEY', 'TOGETHER_API_KEY', 'AIML_API_KEY'],
      },
      {
        id: 'image-generation',
        name: 'Image Generation',
        description: 'Create images from text descriptions',
        requiredKeys: ['OPENAI_API_KEY', 'REPLICATE_API_TOKEN'],
      },
      {
        id: 'text-to-speech',
        name: 'Text to Speech',
        description: 'Convert text to natural speech',
        requiredKeys: ['ELEVENLABS_API_KEY', 'OPENAI_API_KEY'],
      },
      {
        id: 'speech-to-text',
        name: 'Speech to Text',
        description: 'Transcribe audio to text',
        requiredKeys: ['OPENAI_API_KEY'],
      },
      {
        id: 'document-analysis',
        name: 'Document Analysis',
        description: 'Analyze and chat with PDF documents',
        requiredKeys: ['OPENAI_API_KEY', 'TOGETHER_API_KEY', 'PINECONE_API_KEY'],
      },
      {
        id: 'video-generation',
        name: 'Video Generation',
        description: 'Generate talking avatars and videos',
        requiredKeys: ['HEYGEN_API_KEY'],
      },
      {
        id: 'music-generation',
        name: 'Music Generation',
        description: 'Create music from text prompts',
        requiredKeys: ['SUNO_API_KEY'],
      },
      {
        id: 'coding',
        name: 'Code Generation',
        description: 'Generate and review code',
        requiredKeys: ['OPENAI_API_KEY', 'TOGETHER_API_KEY', 'AIML_API_KEY'],
      },
    ];
  }

  // Get all configured providers
  getProviders(): ModelProvider[] {
    return [
      {
        id: 'openai',
        name: 'OpenAI',
        description: 'GPT models, DALL-E, Whisper',
        apiKeyEnv: 'OPENAI_API_KEY',
        isConfigured: this.isProviderConfigured('openai'),
        supportedCapabilities: ['chat', 'image-generation', 'speech-to-text', 'coding'],
      },
      {
        id: 'together',
        name: 'Together AI',
        description: 'Open-source models (Llama, Mistral, CodeLlama)',
        apiKeyEnv: 'TOGETHER_API_KEY',
        isConfigured: this.isProviderConfigured('together'),
        supportedCapabilities: ['chat', 'coding'],
      },
      {
        id: 'aimlapi',
        name: 'AI/ML API',
        description: '200+ models (Claude, Gemini, Grok, o1)',
        apiKeyEnv: 'AIML_API_KEY',
        isConfigured: this.isProviderConfigured('aimlapi'),
        supportedCapabilities: ['chat', 'coding'],
      },
      {
        id: 'replicate',
        name: 'Replicate',
        description: 'Advanced image/video models',
        apiKeyEnv: 'REPLICATE_API_TOKEN',
        isConfigured: this.isProviderConfigured('replicate'),
        supportedCapabilities: ['image-generation'],
      },
      {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        description: 'High-quality text-to-speech',
        apiKeyEnv: 'ELEVENLABS_API_KEY',
        isConfigured: this.isProviderConfigured('elevenlabs'),
        supportedCapabilities: ['text-to-speech'],
      },
      {
        id: 'heygen',
        name: 'HeyGen',
        description: 'Talking avatar generation',
        apiKeyEnv: 'HEYGEN_API_KEY',
        isConfigured: this.isProviderConfigured('heygen'),
        supportedCapabilities: ['video-generation'],
      },
      {
        id: 'suno',
        name: 'Suno',
        description: 'AI music generation',
        apiKeyEnv: 'SUNO_API_KEY',
        isConfigured: this.isProviderConfigured('suno'),
        supportedCapabilities: ['music-generation'],
      },
    ];
  }

  // Check if a provider is properly configured
  isProviderConfigured(providerId: string): boolean {
    switch (providerId) {
      case 'openai':
        return !!process.env.OPENAI_API_KEY?.startsWith('sk-');
      case 'together':
        return !!process.env.TOGETHER_API_KEY;
      case 'aimlapi':
        return !!process.env.AIML_API_KEY;
      case 'replicate':
        return !!process.env.REPLICATE_API_TOKEN?.startsWith('r8_');
      case 'elevenlabs':
        return !!process.env.ELEVENLABS_API_KEY;
      case 'heygen':
        return !!process.env.HEYGEN_API_KEY;
      case 'suno':
        return !!process.env.SUNO_API_KEY;
      case 'anthropic':
        return !!process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-');
      case 'google':
        return !!process.env.GOOGLE_AI_API_KEY;
      default:
        return false;
    }
  }

  // Get available models for a specific capability
  getModelsForCapability(capability: string): any[] {
    const allModels = this.apiService.getAvailableModels();

    switch (capability) {
      case 'chat':
        return allModels.filter((m) => m.category === 'chat');
      case 'coding':
        return allModels.filter((m) => m.category === 'coding' || m.name.toLowerCase().includes('code'));
      case 'reasoning':
        return allModels.filter((m) => m.category === 'reasoning');
      case 'multimodal':
        return allModels.filter((m) => m.category === 'multimodal');
      default:
        return allModels;
    }
  }

  // Get recommended models for each use case
  getRecommendedModels(): Record<string, any[]> {
    return {
      'general-chat': this.getModelsForCapability('chat').slice(0, 3),
      coding: this.getModelsForCapability('coding').slice(0, 3),
      reasoning: this.getModelsForCapability('reasoning').slice(0, 3),
      creative: this.getModelsForCapability('chat')
        .filter((m) => m.name.toLowerCase().includes('claude') || m.name.toLowerCase().includes('gpt-4'))
        .slice(0, 2),
      'fast-cheap': this.getModelsForCapability('chat')
        .filter((m) => m.tier === 'free' || m.cost === 'Free')
        .slice(0, 3),
    };
  }

  // Validate configuration for a specific AI module
  validateModuleConfiguration(moduleId: string): {
    isValid: boolean;
    missingRequirements: string[];
    configuredProviders: string[];
  } {
    const moduleRequirements = this.getModuleRequirements(moduleId);
    const missingRequirements: string[] = [];
    const configuredProviders: string[] = [];

    // Check required providers
    for (const providerId of moduleRequirements.requiredProviders) {
      if (this.isProviderConfigured(providerId)) {
        configuredProviders.push(providerId);
      } else {
        missingRequirements.push(`${providerId.toUpperCase()}_API_KEY`);
      }
    }

    // Check if at least one provider is configured for optional providers
    if (moduleRequirements.optionalProviders.length > 0) {
      const hasOptionalProvider = moduleRequirements.optionalProviders.some((providerId) =>
        this.isProviderConfigured(providerId)
      );
      if (!hasOptionalProvider) {
        missingRequirements.push(`At least one of: ${moduleRequirements.optionalProviders.join(', ')}`);
      }
    }

    return {
      isValid: missingRequirements.length === 0,
      missingRequirements,
      configuredProviders,
    };
  }

  // Define requirements for each AI module
  private getModuleRequirements(moduleId: string): {
    requiredProviders: string[];
    optionalProviders: string[];
  } {
    const requirements: Record<string, { requiredProviders: string[]; optionalProviders: string[] }> = {
      'multillm-chatgpt': {
        requiredProviders: [],
        optionalProviders: ['openai', 'together', 'aimlapi'],
      },
      'content-writer': {
        requiredProviders: [],
        optionalProviders: ['openai', 'together', 'aimlapi'],
      },
      'image-generator': {
        requiredProviders: [],
        optionalProviders: ['openai', 'replicate'],
      },
      'text-to-speech': {
        requiredProviders: ['elevenlabs'],
        optionalProviders: [],
      },
      'voice-transcription': {
        requiredProviders: ['openai'],
        optionalProviders: [],
      },
      'chat-with-pdf': {
        requiredProviders: [],
        optionalProviders: ['openai', 'together', 'aimlapi'],
      },
      'headshot-generator': {
        requiredProviders: ['replicate'],
        optionalProviders: [],
      },
      'music-generator': {
        requiredProviders: ['suno'],
        optionalProviders: [],
      },
      'interior-design': {
        requiredProviders: ['together'],
        optionalProviders: [],
      },
      'deepseek-chat': {
        requiredProviders: [],
        optionalProviders: ['aimlapi'],
      },
      'gemini-chat': {
        requiredProviders: [],
        optionalProviders: ['aimlapi', 'google'],
      },
      llamagpt: {
        requiredProviders: ['together'],
        optionalProviders: [],
      },
    };

    return (
      requirements[moduleId] || {
        requiredProviders: [],
        optionalProviders: ['openai', 'together', 'aimlapi'],
      }
    );
  }

  // Get setup instructions for a module
  getModuleSetupInstructions(moduleId: string): {
    title: string;
    description: string;
    requirements: string[];
    setupSteps: string[];
  } {
    const validation = this.validateModuleConfiguration(moduleId);

    return {
      title: `Setup ${moduleId.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}`,
      description: `Configure the required AI providers for ${moduleId}`,
      requirements: validation.missingRequirements,
      setupSteps: [
        'Add the required API keys to your .env file',
        'Restart your development server',
        'Test the module functionality',
        'Configure optional providers for enhanced features',
      ],
    };
  }
}
