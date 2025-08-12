import { NextResponse } from 'next/server';
import { AIModelManager } from '@/lib/ai/model-manager';

export async function GET() {
  try {
    const modelManager = AIModelManager.getInstance();
    
    // Get all providers and their configuration status
    const providers = modelManager.getProviders();
    const capabilities = modelManager.getCapabilities();
    
    // Check each AI module's configuration
    const modules = [
      'multillm-chatgpt',
      'content-writer',
      'image-generator',
      'text-to-speech',
      'voice-transcription',
      'chat-with-pdf',
      'chat-with-youtube',
      'headshot-generator',
      'qr-generator',
      'interior-design',
      'music-generator',
      'image-upscaler',
      'ghibli-generator',
      'quiz-generator',
      'deepseek-chat',
      'gemini-chat',
      'llamagpt',
      'youtube-content',
    ];

    const moduleStatus = modules.map(moduleId => {
      const validation = modelManager.validateModuleConfiguration(moduleId);
      const setupInstructions = modelManager.getModuleSetupInstructions(moduleId);
      
      return {
        id: moduleId,
        name: moduleId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        isConfigured: validation.isValid,
        missingRequirements: validation.missingRequirements,
        configuredProviders: validation.configuredProviders,
        setupInstructions: setupInstructions,
      };
    });

    // Calculate overall setup progress
    const configuredModules = moduleStatus.filter(m => m.isConfigured).length;
    const totalModules = moduleStatus.length;
    const setupProgress = Math.round((configuredModules / totalModules) * 100);

    // Get recommended next steps
    const nextSteps = getRecommendedNextSteps(providers, moduleStatus);

    return NextResponse.json({
      success: true,
      setupProgress,
      configuredModules,
      totalModules,
      providers: providers.map(p => ({
        id: p.id,
        name: p.name,
        isConfigured: p.isConfigured,
        capabilities: p.supportedCapabilities,
      })),
      capabilities: capabilities.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        isAvailable: c.requiredKeys.some(key => !!process.env[key]),
      })),
      modules: moduleStatus,
      nextSteps,
      recommendations: {
        quickStart: getQuickStartRecommendations(providers),
        costOptimized: getCostOptimizedRecommendations(providers),
        fullFeature: getFullFeatureRecommendations(providers),
      },
    });
  } catch (error) {
    console.error('Error checking AI setup status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check AI setup status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function getRecommendedNextSteps(providers: any[], moduleStatus: any[]): string[] {
  const steps: string[] = [];
  
  // Check if any provider is configured
  const hasAnyProvider = providers.some(p => p.isConfigured);
  
  if (!hasAnyProvider) {
    steps.push('🔑 Add at least one AI provider API key (OpenAI, Together AI, or AI/ML API)');
    steps.push('📚 Follow the setup guide: AI_MODULES_SETUP_GUIDE.md');
    return steps;
  }

  // Check for specific missing capabilities
  const hasOpenAI = providers.find(p => p.id === 'openai')?.isConfigured;
  const hasTogetherAI = providers.find(p => p.id === 'together')?.isConfigured;
  const hasElevenLabs = providers.find(p => p.id === 'elevenlabs')?.isConfigured;
  const hasReplicate = providers.find(p => p.id === 'replicate')?.isConfigured;

  if (!hasOpenAI && !hasTogetherAI) {
    steps.push('💬 Add a chat provider (OpenAI or Together AI) for better chat experience');
  }

  if (!hasOpenAI) {
    steps.push('🖼️ Add OpenAI API key for DALL-E image generation and Whisper transcription');
  }

  if (!hasElevenLabs) {
    steps.push('🔊 Add ElevenLabs API key for high-quality text-to-speech');
  }

  if (!hasReplicate) {
    steps.push('🎨 Add Replicate API token for advanced image generation and editing');
  }

  const unconfiguredCriticalModules = moduleStatus.filter(
    m => !m.isConfigured && ['multillm-chatgpt', 'content-writer', 'image-generator'].includes(m.id)
  );

  if (unconfiguredCriticalModules.length > 0) {
    steps.push(`⚙️ Configure core modules: ${unconfiguredCriticalModules.map(m => m.name).join(', ')}`);
  }

  if (steps.length === 0) {
    steps.push('🎉 Great! Your AI platform is fully configured');
    steps.push('🧪 Test your AI modules in the dashboard');
    steps.push('📊 Monitor usage and costs in the analytics section');
  }

  return steps;
}

function getQuickStartRecommendations(providers: any[]): {
  title: string;
  description: string;
  requiredKeys: string[];
  estimatedCost: string;
} {
  return {
    title: 'Quick Start Setup',
    description: 'Get basic AI functionality with minimal cost',
    requiredKeys: ['TOGETHER_API_KEY'],
    estimatedCost: '$0.10-$1.00 per 1000 messages',
  };
}

function getCostOptimizedRecommendations(providers: any[]): {
  title: string;
  description: string;
  requiredKeys: string[];
  estimatedCost: string;
} {
  return {
    title: 'Cost-Optimized Setup',
    description: 'Balance features and cost with open-source models',
    requiredKeys: ['TOGETHER_API_KEY', 'AIML_API_KEY'],
    estimatedCost: '$0.20-$2.00 per 1000 messages',
  };
}

function getFullFeatureRecommendations(providers: any[]): {
  title: string;
  description: string;
  requiredKeys: string[];
  estimatedCost: string;
} {
  return {
    title: 'Full Feature Setup',
    description: 'Complete AI platform with all capabilities',
    requiredKeys: [
      'OPENAI_API_KEY',
      'TOGETHER_API_KEY', 
      'AIML_API_KEY',
      'REPLICATE_API_TOKEN',
      'ELEVENLABS_API_KEY'
    ],
    estimatedCost: '$1.00-$10.00 per 1000 messages (varies by features used)',
  };
}
