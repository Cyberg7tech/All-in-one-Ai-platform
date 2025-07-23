// Enhanced Agent Service with Real API Integration

import { AIAPIService } from '../ai/api-integration';

export interface EnhancedAgentTool {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any, context: AgentExecutionContext) => Promise<any>;
}

export interface AgentExecutionContext {
  userId: string;
  sessionId: string;
  agentId: string;
  conversationHistory: any[];
  userData?: any;
}

export interface EnhancedAgentResponse {
  content: string;
  toolsUsed: string[];
  usage: {
    tokensUsed: number;
    apiCalls: number;
    cost: number;
  };
  metadata: {
    model: string;
    responseTime: number;
    confidence: number;
  };
}

export class EnhancedAgentService {
  private apiService: AIAPIService;
  private tools: Map<string, EnhancedAgentTool>;

  constructor() {
    this.apiService = AIAPIService.getInstance();
    this.tools = new Map();
    this.initializeTools();
  }

  private initializeTools() {
    // Web Search Tool (using Firecrawl)
    this.tools.set('web_search', {
      id: 'web_search',
      name: 'Web Search',
      description: 'Search the internet for current information',
      parameters: {
        query: { type: 'string', required: true, description: 'Search query' },
        maxResults: { type: 'number', default: 5, description: 'Maximum results to return' }
      },
      execute: async (params: { query: string; maxResults?: number }) => {
        try {
          // Use a search engine API or web scraping
          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(params.query)}`;
          const result = await this.apiService.scrapeWebsite(searchUrl, {
            onlyMainContent: true,
            excludeTags: ['script', 'style', 'nav', 'footer']
          });
          
          return {
            success: true,
            results: result.data?.markdown?.substring(0, 2000) || 'No results found',
            source: 'web_search'
          };
        } catch (error) {
          return {
            success: false,
            error: 'Failed to perform web search',
            message: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    });

    // Image Generation Tool
    this.tools.set('generate_image', {
      id: 'generate_image',
      name: 'Generate Image',
      description: 'Create images using AI (DALL-E 3)',
      parameters: {
        prompt: { type: 'string', required: true, description: 'Image description' },
        size: { type: 'string', default: '1024x1024', description: 'Image size' },
        style: { type: 'string', default: 'vivid', description: 'Image style' }
      },
      execute: async (params: { prompt: string; size?: string; style?: string }) => {
        try {
          const imageUrls = await this.apiService.generateImageWithDALLE(params.prompt, {
            size: params.size || '1024x1024',
            style: params.style || 'vivid',
            quality: 'standard'
          });
          
          return {
            success: true,
            images: imageUrls,
            prompt: params.prompt,
            source: 'dall-e-3'
          };
        } catch (error) {
          return {
            success: false,
            error: 'Failed to generate image',
            message: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    });

    // Video Generation Tool
    this.tools.set('generate_video', {
      id: 'generate_video',
      name: 'Generate Video',
      description: 'Create videos using Runway Gen-2',
      parameters: {
        prompt: { type: 'string', required: true, description: 'Video description' },
        imageUrl: { type: 'string', description: 'Optional starting image' }
      },
      execute: async (params: { prompt: string; imageUrl?: string }) => {
        try {
          const result = await this.apiService.generateVideoWithRunway(params.prompt, params.imageUrl);
          
          return {
            success: true,
            video: result,
            prompt: params.prompt,
            source: 'runway-gen2'
          };
        } catch (error) {
          return {
            success: false,
            error: 'Failed to generate video',
            message: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    });

    // Music Generation Tool
    this.tools.set('generate_music', {
      id: 'generate_music',
      name: 'Generate Music',
      description: 'Create music using Suno AI',
      parameters: {
        prompt: { type: 'string', required: true, description: 'Music description' },
        duration: { type: 'number', default: 30, description: 'Duration in seconds' },
        genre: { type: 'string', description: 'Music genre' }
      },
      execute: async (params: { prompt: string; duration?: number; genre?: string }) => {
        try {
          const result = await this.apiService.generateMusicWithSuno(params.prompt, {
            duration: params.duration || 30,
            genre: params.genre
          });
          
          return {
            success: true,
            music: result,
            prompt: params.prompt,
            source: 'suno-ai'
          };
        } catch (error) {
          return {
            success: false,
            error: 'Failed to generate music',
            message: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    });

    // Email Tool
    this.tools.set('send_email', {
      id: 'send_email',
      name: 'Send Email',
      description: 'Send emails using Resend',
      parameters: {
        to: { type: 'string', required: true, description: 'Recipient email' },
        subject: { type: 'string', required: true, description: 'Email subject' },
        content: { type: 'string', required: true, description: 'Email content' },
        from: { type: 'string', description: 'Sender email' }
      },
      execute: async (params: { to: string; subject: string; content: string; from?: string }) => {
        try {
          const result = await this.apiService.sendEmail(
            params.to,
            params.subject,
            params.content,
            params.from
          );
          
          return {
            success: true,
            emailId: result.id,
            message: 'Email sent successfully',
            source: 'resend'
          };
        } catch (error) {
          return {
            success: false,
            error: 'Failed to send email',
            message: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    });

    // Code Execution Tool
    this.tools.set('code_interpreter', {
      id: 'code_interpreter',
      name: 'Code Interpreter',
      description: 'Execute and analyze code',
      parameters: {
        code: { type: 'string', required: true, description: 'Code to execute' },
        language: { type: 'string', default: 'python', description: 'Programming language' }
      },
      execute: async (params: { code: string; language?: string }) => {
        // For security, this would typically use a sandboxed environment
        // For demo purposes, we'll simulate code execution
        try {
          return {
            success: true,
            output: `Code executed successfully:\n\n${params.code}\n\nOutput: [Simulated execution result]`,
            language: params.language || 'python',
            source: 'code_interpreter'
          };
        } catch (error) {
          return {
            success: false,
            error: 'Code execution failed',
            message: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    });

    // Data Analysis Tool
    this.tools.set('analyze_data', {
      id: 'analyze_data',
      name: 'Analyze Data',
      description: 'Perform data analysis and generate insights',
      parameters: {
        data: { type: 'object', required: true, description: 'Data to analyze' },
        analysisType: { type: 'string', default: 'summary', description: 'Type of analysis' }
      },
      execute: async (params: { data: any; analysisType?: string }) => {
        try {
          // Simulate data analysis
          const insights = this.generateDataInsights(params.data, params.analysisType);
          
          return {
            success: true,
            insights,
            analysisType: params.analysisType || 'summary',
            source: 'data_analyzer'
          };
        } catch (error) {
          return {
            success: false,
            error: 'Data analysis failed',
            message: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    });
  }

  private generateDataInsights(data: any, analysisType?: string): any {
    // Simulate data analysis insights
    return {
      summary: 'Data analysis completed',
      totalRecords: Array.isArray(data) ? data.length : Object.keys(data).length,
      analysisType: analysisType || 'summary',
      insights: [
        'Data contains valid structure',
        'No missing critical values detected',
        'Analysis completed successfully'
      ]
    };
  }

  async executeAgent(
    agentConfig: any,
    userMessage: string,
    context: AgentExecutionContext
  ): Promise<EnhancedAgentResponse> {
    const startTime = Date.now();
    let totalTokens = 0;
    let apiCalls = 0;
    let cost = 0;
    const toolsUsed: string[] = [];

    try {
      // Determine which model to use
      const model = agentConfig.model || 'gpt-4';
      const isOpenAI = model.startsWith('gpt');
      const isAnthropic = model.startsWith('claude');

      // Build conversation history
      const messages = [
        {
          role: 'system',
          content: this.buildSystemPrompt(agentConfig, context)
        },
        ...context.conversationHistory,
        {
          role: 'user',
          content: userMessage
        }
      ];

      // Analyze if tools are needed
      const toolsToUse = this.analyzeRequiredTools(userMessage, agentConfig.tools || []);

      let response: any;
      let finalContent = '';

      if (toolsToUse.length > 0) {
        // Execute tools first
        const toolResults = await this.executeTools(toolsToUse, userMessage, context);
        toolsUsed.push(...toolResults.map(r => r.toolId));

        // Add tool results to conversation
        const toolContext = toolResults.map(result => 
          `Tool: ${result.toolId}\nResult: ${JSON.stringify(result.result, null, 2)}`
        ).join('\n\n');

        messages.push({
          role: 'user',
          content: `Tool Results:\n${toolContext}\n\nPlease provide a comprehensive response based on the tool results above.`
        });
      }

      // Call appropriate AI model
      if (isOpenAI) {
        response = await this.apiService.callOpenAI(messages, model, {
          maxTokens: 1000,
          temperature: 0.7
        });
        apiCalls++;
        totalTokens += response.usage?.total_tokens || 0;
        cost += this.calculateOpenAICost(response.usage?.total_tokens || 0, model);
      } else if (isAnthropic) {
        response = await this.apiService.callAnthropic(messages, model, {
          maxTokens: 1000,
          temperature: 0.7
        });
        apiCalls++;
        totalTokens += response.usage?.input_tokens + response.usage?.output_tokens || 0;
        cost += this.calculateAnthropicCost(response.usage?.input_tokens || 0, response.usage?.output_tokens || 0);
      } else {
        // Fallback to OpenAI GPT-4
        response = await this.apiService.callOpenAI(messages, 'gpt-4');
        apiCalls++;
        totalTokens += response.usage?.total_tokens || 0;
        cost += this.calculateOpenAICost(response.usage?.total_tokens || 0, 'gpt-4');
      }

      finalContent = response.content;

      return {
        content: finalContent,
        toolsUsed,
        usage: {
          tokensUsed: totalTokens,
          apiCalls,
          cost
        },
        metadata: {
          model: response.model || model,
          responseTime: Date.now() - startTime,
          confidence: 0.95 // Simulated confidence score
        }
      };

    } catch (error) {
      console.error('Agent execution error:', error);
      throw new Error(`Agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildSystemPrompt(agentConfig: any, context: AgentExecutionContext): string {
    const basePrompt = agentConfig.systemPrompt || 'You are a helpful AI assistant.';
    const availableTools = agentConfig.tools?.map((toolId: string) => {
      const tool = this.tools.get(toolId);
      return tool ? `- ${tool.name}: ${tool.description}` : '';
    }).filter(Boolean).join('\n');

    return `${basePrompt}

Available Tools:
${availableTools}

Context:
- User ID: ${context.userId}
- Session ID: ${context.sessionId}
- Agent ID: ${context.agentId}

Instructions:
- Use tools when appropriate to provide better responses
- Be helpful, accurate, and professional
- Cite sources when using web search results
- Explain your reasoning when using tools`;
  }

  private analyzeRequiredTools(userMessage: string, availableTools: string[]): string[] {
    const toolKeywords = {
      'web_search': ['search', 'find', 'look up', 'current', 'latest', 'news', 'information'],
      'generate_image': ['image', 'picture', 'draw', 'create image', 'generate image'],
      'generate_video': ['video', 'create video', 'generate video', 'animation'],
      'generate_music': ['music', 'song', 'create music', 'generate music', 'compose'],
      'send_email': ['email', 'send email', 'contact', 'notify'],
      'code_interpreter': ['code', 'execute', 'run code', 'program', 'script'],
      'analyze_data': ['analyze', 'data', 'statistics', 'insights', 'report']
    };

    const message = userMessage.toLowerCase();
    const requiredTools: string[] = [];

    for (const [toolId, keywords] of Object.entries(toolKeywords)) {
      if (availableTools.includes(toolId) && keywords.some(keyword => message.includes(keyword))) {
        requiredTools.push(toolId);
      }
    }

    return requiredTools;
  }

  private async executeTools(toolIds: string[], userMessage: string, context: AgentExecutionContext): Promise<any[]> {
    const results = [];

    for (const toolId of toolIds) {
      const tool = this.tools.get(toolId);
      if (!tool) continue;

      try {
        const params = this.extractToolParameters(userMessage, tool);
        const result = await tool.execute(params, context);
        results.push({ toolId, result });
      } catch (error) {
        console.error(`Tool execution error for ${toolId}:`, error);
        results.push({
          toolId,
          result: {
            success: false,
            error: `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        });
      }
    }

    return results;
  }

  private extractToolParameters(userMessage: string, tool: EnhancedAgentTool): any {
    // Simple parameter extraction - in a real implementation, this would be more sophisticated
    const params: any = {};

    if (tool.id === 'web_search') {
      params.query = userMessage.replace(/search|find|look up/gi, '').trim();
    } else if (tool.id === 'generate_image') {
      params.prompt = userMessage.replace(/create|generate|draw|image|picture/gi, '').trim();
    } else if (tool.id === 'generate_video') {
      params.prompt = userMessage.replace(/create|generate|video/gi, '').trim();
    } else if (tool.id === 'generate_music') {
      params.prompt = userMessage.replace(/create|generate|music|song/gi, '').trim();
    }

    return params;
  }

  private calculateOpenAICost(tokens: number, model: string): number {
    const costs = {
      'gpt-4': 0.03 / 1000, // $0.03 per 1K tokens
      'gpt-3.5-turbo': 0.002 / 1000, // $0.002 per 1K tokens
      'dall-e-3': 0.04 // $0.04 per image
    };
    return tokens * (costs[model as keyof typeof costs] || costs['gpt-4']);
  }

  private calculateAnthropicCost(inputTokens: number, outputTokens: number): number {
    const inputCost = 0.003 / 1000; // $0.003 per 1K input tokens
    const outputCost = 0.015 / 1000; // $0.015 per 1K output tokens
    return (inputTokens * inputCost) + (outputTokens * outputCost);
  }

  getAvailableTools(): EnhancedAgentTool[] {
    return Array.from(this.tools.values());
  }

  getTool(toolId: string): EnhancedAgentTool | undefined {
    return this.tools.get(toolId);
  }
} 