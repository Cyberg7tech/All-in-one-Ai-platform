// API Integration Service - Enhanced with AI/ML API support for 200+ models

export class AIAPIService {
  private static instance: AIAPIService;

  static getInstance(): AIAPIService {
    if (!AIAPIService.instance) {
      AIAPIService.instance = new AIAPIService();
    }
    return AIAPIService.instance;
  }

  // Enhanced error handling helper
  private handleAPIError(provider: string, error: any, fallbackMessage: string) {
    console.error(`${provider} API Error:`, error);
    return {
      content: `I apologize, but I'm currently experiencing issues with ${provider}. ${fallbackMessage}`,
      usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
      error: true,
      provider,
    };
  }

  // AI/ML API Integration - Unified access to 200+ models
  async callAIMLAPI(messages: any[], model: string, options: any = {}) {
    const apiKey = process.env.AIML_API_KEY;

    if (!apiKey) {
      return this.handleAPIError(
        'AI/ML API',
        null,
        'Please configure AIML_API_KEY in your environment variables. Get one from aimlapi.com'
      );
    }

    try {
      const response = await fetch('https://api.aimlapi.com/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Please check your AI/ML API configuration.';

        if (response.status === 401) {
          errorMessage = 'Invalid API key. Please check your AIML_API_KEY.';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please try again in a moment.';
        } else if (response.status === 400) {
          errorMessage = 'Invalid request. Please check your model selection.';
        }

        return this.handleAPIError('AI/ML API', errorText, errorMessage);
      }

      const data = await response.json();
      return {
        content: data.choices[0]?.message?.content || 'No response generated.',
        usage: data.usage || { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
        model: data.model || model,
        provider: 'aimlapi',
      };
    } catch (error) {
      return this.handleAPIError('AI/ML API', error, 'Network error. Please check your internet connection.');
    }
  }

  // OpenAI API Integration with improved error handling
  async callOpenAI(messages: any[], model: string = 'gpt-4o-mini', options: any = {}) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return this.handleAPIError(
        'OpenAI',
        null,
        'Please configure OPENAI_API_KEY in your environment variables.'
      );
    }

    if (!apiKey.startsWith('sk-')) {
      return this.handleAPIError(
        'OpenAI',
        null,
        'Invalid API key format. OpenAI keys should start with "sk-".'
      );
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Please check your API configuration.';

        if (response.status === 401) {
          errorMessage = 'Invalid API key. Please check your OpenAI API key.';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please try again in a moment.';
        } else if (response.status === 400) {
          errorMessage = 'Invalid request. Please check your model selection.';
        }

        return this.handleAPIError('OpenAI', errorText, errorMessage);
      }

      const data = await response.json();
      return {
        content: data.choices[0]?.message?.content || 'No response generated.',
        usage: data.usage,
        model: data.model,
        provider: 'openai',
      };
    } catch (error) {
      return this.handleAPIError('OpenAI', error, 'Network error. Please check your internet connection.');
    }
  }

  // Together.ai API Integration with improved error handling
  async chatWithTogether(
    messages: any[],
    model: string = 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
    options: any = {}
  ) {
    const apiKey = process.env.TOGETHER_API_KEY;

    if (!apiKey) {
      return this.handleAPIError(
        'Together.ai',
        null,
        'Please configure TOGETHER_API_KEY for open-source models.'
      );
    }

    try {
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Please check your API configuration.';

        if (response.status === 401) {
          errorMessage = 'Invalid API key. Please check your Together.ai API key.';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please try again in a moment.';
        }

        return this.handleAPIError('Together.ai', errorText, errorMessage);
      }

      const data = await response.json();
      return {
        content: data.choices[0]?.message?.content || 'No response generated.',
        usage: data.usage,
        model: data.model,
        provider: 'together',
      };
    } catch (error) {
      return this.handleAPIError(
        'Together.ai',
        error,
        'Network error. Please check your internet connection.'
      );
    }
  }

  // DALL-E Image Generation with improved error handling
  async generateImageWithDALLE(prompt: string, options: any = {}) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        error: true,
        content: 'Please configure OPENAI_API_KEY for image generation.',
        usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
        provider: 'openai',
      };
    }

    if (!apiKey.startsWith('sk-')) {
      return {
        error: true,
        content: 'Invalid OpenAI API key format. Keys should start with "sk-".',
        usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
        provider: 'openai',
      };
    }

    try {
      const model = options.model || 'dall-e-3';

      // Prepare request body - only add style for DALL-E-3
      const requestBody: any = {
        model: model,
        prompt: prompt,
        n: 1,
        size: options.size || '1024x1024',
      };

      // Only add style and quality for DALL-E-3
      if (model === 'dall-e-3') {
        requestBody.quality = options.quality || 'standard';
        if (options.style && ['vivid', 'natural'].includes(options.style)) {
          requestBody.style = options.style;
        }
      }

      console.log('DALL-E API Request:', { model, prompt: prompt.substring(0, 100), requestBody });

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DALL-E API Error:', response.status, errorText);

        let errorMessage = 'Image generation failed. ';
        if (response.status === 400) {
          errorMessage += 'Invalid request parameters. Please check your prompt and settings.';
        } else if (response.status === 401) {
          errorMessage += 'Invalid API key. Please check your OpenAI API key.';
        } else if (response.status === 429) {
          errorMessage += 'Rate limit exceeded. Please try again in a moment.';
        } else {
          errorMessage += 'Please try again.';
        }

        return {
          error: true,
          content: errorMessage,
          usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
          provider: 'openai',
        };
      }

      const data = await response.json();
      console.log('DALL-E API Success:', { url: data.data[0]?.url });

      return {
        image_url: data.data[0]?.url,
        prompt: prompt,
        model: model,
        provider: 'openai',
      };
    } catch (error) {
      console.error('DALL-E Network Error:', error);
      return {
        error: true,
        content: 'Network error during image generation. Please check your connection.',
        usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
        provider: 'openai',
      };
    }
  }

  // Text-to-Speech with ElevenLabs (keeping for audio functionality)
  async generateSpeechWithElevenLabs(text: string, voice: string = 'alloy') {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return {
        error: true,
        content: 'Please configure ELEVENLABS_API_KEY for text-to-speech functionality.',
        usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
        provider: 'elevenlabs',
      };
    }

    try {
      // Map common voice names to ElevenLabs voice IDs
      const voiceMap: Record<string, string> = {
        alloy: 'pNInz6obpgDQGcFmaJgB', // Adam
        echo: '21m00Tcm4TlvDq8ikWAM', // Rachel
        fable: 'AZnzlk1XvdvUeBnXmlld', // Domi
        onyx: 'EXAVITQu4vr4xnSDxMaL', // Bella
        nova: 'MF3mGyEYCl7XYWbV9V6O', // Elli
        shimmer: 'TxGEqnHWrfWFTfGW9XjX', // Josh
      };

      const voiceId = voiceMap[voice] || voiceMap['alloy'];

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        return {
          error: true,
          content: 'Text-to-speech generation failed. Please check your API key.',
          usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
          provider: 'elevenlabs',
        };
      }

      const audioBuffer = await response.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');
      const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

      return {
        audio_url: audioDataUrl,
        text,
        voice,
        note: 'Audio generated successfully with ElevenLabs',
      };
    } catch (error) {
      return {
        error: true,
        content: 'Network error during speech generation.',
        usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
        provider: 'elevenlabs',
      };
    }
  }

  // Determine which provider to use for a given model
  getProviderForModel(model: string): 'openai' | 'together' | 'aimlapi' {
    // OpenAI models
    const openaiModels = [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
      'gpt-4-0125-preview',
      'gpt-4-1106-preview',
      'gpt-3.5-turbo-0125',
    ];

    // AI/ML API models (Premium and closed-source models)
    const aimlApiModels = [
      // OpenAI models via AI/ML API
      'gpt-4.1',
      'gpt-4.1-turbo',
      'gpt-4o-2024-11-20',
      'o1-preview',
      'o1-mini',
      // Anthropic models
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      // Google models
      'gemini-1.5-pro-002',
      'gemini-1.5-flash-002',
      'gemini-2.0-flash-exp',
      'gemini-exp-1206',
      'gemini-exp-1121',
      // xAI models
      'grok-beta',
      'grok-2-1212',
      'grok-2-vision-1212',
      // Anthropic premium
      'claude-3.7-sonnet',
      'claude-3.7-haiku',
      // DeepSeek premium
      'deepseek-chat',
      'deepseek-r1',
      // Meta premium
      'llama-3.3-70b-instruct',
      'llama-3.2-90b-vision-instruct',
      // Mistral premium
      'mistral-large-2411',
      'mistral-small-2409',
      // Perplexity
      'pplx-7b-online',
      'pplx-70b-online',
      'pplx-7b-chat',
      'pplx-70b-chat',
      // Cohere
      'command-r-plus-08-2024',
      'command-r-08-2024',
      // Other premium models
      'qwen-2.5-72b-instruct',
      'yi-large',
      'solar-mini',
    ];

    if (openaiModels.includes(model)) {
      return 'openai';
    }

    if (aimlApiModels.includes(model)) {
      return 'aimlapi';
    }

    // Everything else goes to Together AI (open-source models)
    return 'together';
  }

  // Unified chat method that routes to the appropriate provider
  async chat(messages: any[], model: string, options: any = {}) {
    const provider = this.getProviderForModel(model);

    if (provider === 'openai') {
      return await this.callOpenAI(messages, model, options);
    } else if (provider === 'aimlapi') {
      return await this.callAIMLAPI(messages, model, options);
    } else {
      return await this.chatWithTogether(messages, model, options);
    }
  }

  // Get all available models based on configured API keys (Together AI only for chat interface)
  getAvailableModels() {
    const models: any[] = [];

    // Together AI models (only these will be shown in chat interface)
    if (process.env.TOGETHER_API_KEY) {
      models.push(
        // Latest Premium Models (Verified Available)
        {
          id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
          name: 'Llama 3.1 70B Turbo ⚡ (Recommended)',
          provider: 'together',
          category: 'chat',
          tier: 'premium',
          speed: 'fast',
          cost: '$0.88',
        },
        {
          id: 'Qwen/Qwen2.5-72B-Instruct-Turbo',
          name: 'Qwen 2.5 72B Turbo',
          provider: 'together',
          category: 'chat',
          tier: 'premium',
          speed: 'fast',
          cost: '$1.20',
        },
        {
          id: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
          name: 'DeepSeek R1 Distill 70B',
          provider: 'together',
          category: 'reasoning',
          tier: 'premium',
          speed: 'medium',
          cost: '$2.00',
        },

        // High Performance Models
        {
          id: 'meta-llama/Meta-Llama-3.2-90B-Vision-Instruct-Turbo',
          name: 'Llama 3.2 90B Vision',
          provider: 'together',
          category: 'multimodal',
          tier: 'premium',
          speed: 'medium',
          cost: '$1.20',
        },
        {
          id: 'Qwen/Qwen2.5-Coder-32B-Instruct',
          name: 'Qwen 2.5 Coder 32B',
          provider: 'together',
          category: 'coding',
          tier: 'standard',
          speed: 'fast',
          cost: '$0.80',
        },

        // Fast & Efficient Models
        {
          id: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
          name: 'Mixtral 8x7B',
          provider: 'together',
          category: 'chat',
          tier: 'standard',
          speed: 'very-fast',
          cost: '$0.60',
        },
        {
          id: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
          name: 'Llama 3.1 8B Turbo',
          provider: 'together',
          category: 'chat',
          tier: 'standard',
          speed: 'very-fast',
          cost: '$0.18',
        },
        {
          id: 'Qwen/Qwen2.5-7B-Instruct-Turbo',
          name: 'Qwen 2.5 7B Turbo',
          provider: 'together',
          category: 'chat',
          tier: 'standard',
          speed: 'very-fast',
          cost: '$0.30',
        },

        // Free Models
        {
          id: 'meta-llama/Meta-Llama-3.3-70B-Instruct-Turbo-Free',
          name: 'Llama 3.3 70B Free 🆓',
          provider: 'together',
          category: 'chat',
          tier: 'free',
          speed: 'fast',
          cost: 'Free',
        },
        {
          id: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-Free',
          name: 'DeepSeek R1 70B Free 🆓',
          provider: 'together',
          category: 'reasoning',
          tier: 'free',
          speed: 'medium',
          cost: 'Free',
        },
        {
          id: 'LG-AI-EXAONE/EXAONE-3.5-32B-Instruct',
          name: 'EXAONE 3.5 32B Free 🆓',
          provider: 'together',
          category: 'chat',
          tier: 'free',
          speed: 'fast',
          cost: 'Free',
        },

        // Additional Verified Models
        {
          id: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
          name: 'Llama 3.1 405B Turbo',
          provider: 'together',
          category: 'chat',
          tier: 'premium',
          speed: 'medium',
          cost: '$3.50',
        }
      );
    }

    // Note: AI/ML API and OpenAI models are still available for agents and multimedia tools,
    // but not displayed in the chat interface model selection

    return models;
  }
}
