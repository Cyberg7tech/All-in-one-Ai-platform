import { aiModelManager, AIModel } from '@/lib/ai/models';
import { dbHelpers } from '@/lib/supabase/client';
import { embeddingService } from '@/lib/embeddings';
import { forecastingService } from '@/lib/forecasting';
import { anomalyDetectionService } from '@/lib/anomaly';
import { AIAgent } from '@/types/supabase';

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, {
    type: string;
    description: string;
    required?: boolean;
    enum?: string[];
  }>;
  handler: (params: Record<string, any>, context: AgentContext) => Promise<any>;
}

export interface AgentContext {
  userId: string;
  sessionId?: string;
  agent: AIAgent;
  conversationHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
  availableTools: AgentTool[];
}

export interface AgentResponse {
  content: string;
  toolCalls?: Array<{
    toolId: string;
    parameters: Record<string, any>;
    result: any;
  }>;
  reasoning?: string;
  metadata: {
    model: string;
    tokensUsed: number;
    cost: number;
    responseTime: number;
    confidence: number;
  };
}

export interface CreateAgentRequest {
  name: string;
  description: string;
  systemPrompt: string;
  modelConfig: {
    modelId: string;
    temperature: number;
    maxTokens: number;
    topP?: number;
  };
  tools: string[]; // Tool IDs
  personality?: {
    tone: 'professional' | 'casual' | 'friendly' | 'technical' | 'creative';
    expertise: string[];
    restrictions: string[];
  };
  knowledge?: {
    documentIds: number[];
    webSources: string[];
    customData: Record<string, any>;
  };
}

// Built-in tools for agents
const BUILT_IN_TOOLS: Record<string, AgentTool> = {
  web_search: {
    id: 'web_search',
    name: 'Web Search',
    description: 'Search the web for current information',
    parameters: {
      query: {
        type: 'string',
        description: 'Search query',
        required: true
      },
      limit: {
        type: 'number',
        description: 'Number of results to return',
        required: false
      }
    },
    handler: async (params, context) => {
      // Implement web search using Firecrawl or similar
      const { query, limit = 5 } = params;
      
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, limit })
        });
        
        if (!response.ok) throw new Error('Search failed');
        
        const results = await response.json();
        return {
          results: results.slice(0, limit),
          query,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        return { error: 'Web search failed', query };
      }
    }
  },

  vector_search: {
    id: 'vector_search',
    name: 'Knowledge Base Search',
    description: 'Search through uploaded documents and knowledge base',
    parameters: {
      query: {
        type: 'string',
        description: 'Search query',
        required: true
      },
      limit: {
        type: 'number',
        description: 'Number of results to return',
        required: false
      }
    },
    handler: async (params, context) => {
      const { query, limit = 5 } = params;
      
      try {
        const results = await embeddingService.searchSimilarDocuments(
          query,
          context.userId,
          { limit, threshold: 0.7 }
        );
        
        return {
          results: results.map(r => ({
            content: r.content,
            source: r.metadata.title || 'Document',
            similarity: r.similarity
          })),
          query,
          totalResults: results.length
        };
      } catch (error) {
        return { error: 'Knowledge base search failed', query };
      }
    }
  },

  forecast_data: {
    id: 'forecast_data',
    name: 'Data Forecasting',
    description: 'Generate forecasts for time series data',
    parameters: {
      data: {
        type: 'array',
        description: 'Time series data points',
        required: true
      },
      periods: {
        type: 'number',
        description: 'Number of periods to forecast',
        required: false
      },
      method: {
        type: 'string',
        description: 'Forecasting method',
        enum: ['moving_average', 'linear_regression', 'exponential_smoothing', 'ai_forecast'],
        required: false
      }
    },
    handler: async (params, context) => {
      const { data, periods = 12, method = 'linear_regression' } = params;
      
      try {
        const timeSeriesData = data.map((item: any) => ({
          timestamp: new Date(item.timestamp || item.date),
          value: parseFloat(item.value)
        }));
        
        const forecast = await forecastingService.createForecast(timeSeriesData, {
          method,
          periods
        });
        
        return {
          predictions: forecast.predictions,
          confidence: forecast.confidence,
          method: forecast.method,
          metadata: forecast.metadata
        };
      } catch (error) {
        return { error: 'Forecasting failed', details: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  },

  detect_anomalies: {
    id: 'detect_anomalies',
    name: 'Anomaly Detection',
    description: 'Detect anomalies in time series data',
    parameters: {
      data: {
        type: 'array',
        description: 'Time series data points',
        required: true
      },
      method: {
        type: 'string',
        description: 'Detection method',
        enum: ['zscore', 'iqr', 'isolation_forest', 'ai_detection'],
        required: false
      },
      sensitivity: {
        type: 'string',
        description: 'Detection sensitivity',
        enum: ['low', 'medium', 'high'],
        required: false
      }
    },
    handler: async (params, context) => {
      const { data, method = 'zscore', sensitivity = 'medium' } = params;
      
      try {
        const timeSeriesData = data.map((item: any) => ({
          timestamp: new Date(item.timestamp || item.date),
          value: parseFloat(item.value)
        }));
        
        const result = await anomalyDetectionService.detectAnomalies(timeSeriesData, {
          method,
          sensitivity
        });
        
        return {
          anomalies: result.anomalies.slice(0, 10), // Limit results
          summary: result.summary,
          recommendations: result.recommendations
        };
      } catch (error) {
        return { error: 'Anomaly detection failed', details: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  },

  generate_image: {
    id: 'generate_image',
    name: 'Generate Image',
    description: 'Generate images using AI',
    parameters: {
      prompt: {
        type: 'string',
        description: 'Image generation prompt',
        required: true
      },
      style: {
        type: 'string',
        description: 'Image style',
        enum: ['realistic', 'artistic', 'cartoon', 'abstract'],
        required: false
      }
    },
    handler: async (params, context) => {
      const { prompt, style = 'realistic' } = params;
      
      try {
        const enhancedPrompt = style !== 'realistic' 
          ? `${prompt}, ${style} style`
          : prompt;
        
        const images = await aiModelManager.generateImage('dall-e-3', enhancedPrompt);
        
        return {
          images,
          prompt: enhancedPrompt,
          style
        };
      } catch (error) {
        return { error: 'Image generation failed', details: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  },

  code_interpreter: {
    id: 'code_interpreter',
    name: 'Code Execution',
    description: 'Execute and analyze code (simulation)',
    parameters: {
      code: {
        type: 'string',
        description: 'Code to execute',
        required: true
      },
      language: {
        type: 'string',
        description: 'Programming language',
        enum: ['python', 'javascript', 'sql'],
        required: true
      }
    },
    handler: async (params, context) => {
      const { code, language } = params;
      
      // In a real implementation, this would use a sandboxed code execution environment
      // For now, we'll simulate code analysis
      try {
        return {
          language,
          code,
          analysis: `Code analysis complete. Language: ${language}, Lines: ${code.split('\n').length}`,
          status: 'simulated',
          note: 'Code execution is simulated for security reasons'
        };
      } catch (error) {
        return { error: 'Code execution failed', details: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  },

  send_email: {
    id: 'send_email',
    name: 'Send Email',
    description: 'Send emails using Resend',
    parameters: {
      to: {
        type: 'string',
        description: 'Recipient email address',
        required: true
      },
      subject: {
        type: 'string',
        description: 'Email subject',
        required: true
      },
      content: {
        type: 'string',
        description: 'Email content',
        required: true
      }
    },
    handler: async (params, context) => {
      const { to, subject, content } = params;
      
      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, subject, content })
        });
        
        if (!response.ok) throw new Error('Email sending failed');
        
        const result = await response.json();
        return {
          status: 'sent',
          messageId: result.id,
          to,
          subject
        };
      } catch (error) {
        return { error: 'Email sending failed', details: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  }
};

class AgentService {
  private tools: Map<string, AgentTool> = new Map();

  constructor() {
    // Register built-in tools
    Object.values(BUILT_IN_TOOLS).forEach(tool => {
      this.tools.set(tool.id, tool);
    });
  }

  // Register custom tool
  registerTool(tool: AgentTool) {
    this.tools.set(tool.id, tool);
  }

  // Get available tools
  getAvailableTools(): AgentTool[] {
    return Array.from(this.tools.values());
  }

  // Create new agent
  async createAgent(userId: string, request: CreateAgentRequest): Promise<AIAgent> {
    // Validate tools
    const invalidTools = request.tools.filter(toolId => !this.tools.has(toolId));
    if (invalidTools.length > 0) {
      throw new Error(`Invalid tools: ${invalidTools.join(', ')}`);
    }

    // Build system prompt with personality and tools
    const systemPrompt = this.buildSystemPrompt(request);

    const agent = await dbHelpers.createAgent({
      user_id: userId,
      name: request.name,
      description: request.description,
      type: request.personality?.expertise[0] || 'general', // Use first expertise as type or default to 'general'
      model: request.modelConfig.modelId,
      system_prompt: systemPrompt,
      tools: request.tools,
      model_config: request.modelConfig
    });

    return agent;
  }

  // Build comprehensive system prompt
  private buildSystemPrompt(request: CreateAgentRequest): string {
    let prompt = `${request.systemPrompt}\n\n`;

    // Add personality
    if (request.personality) {
      prompt += `PERSONALITY:\n`;
      prompt += `- Tone: ${request.personality.tone}\n`;
      if (request.personality.expertise.length > 0) {
        prompt += `- Expertise: ${request.personality.expertise.join(', ')}\n`;
      }
      if (request.personality.restrictions.length > 0) {
        prompt += `- Restrictions: ${request.personality.restrictions.join(', ')}\n`;
      }
      prompt += '\n';
    }

    // Add tool descriptions
    if (request.tools.length > 0) {
      prompt += `AVAILABLE TOOLS:\n`;
      request.tools.forEach(toolId => {
        const tool = this.tools.get(toolId);
        if (tool) {
          prompt += `- ${tool.name}: ${tool.description}\n`;
        }
      });
      prompt += '\n';
    }

    prompt += `INSTRUCTIONS:
1. Always be helpful and accurate
2. Use tools when appropriate to provide better responses
3. Cite sources when using external information
4. If you're unsure about something, say so
5. Maintain the specified personality and tone
6. Follow any restrictions mentioned`;

    return prompt;
  }

  // Execute agent conversation
  async executeAgent(
    agentId: string,
    userMessage: string,
    context: Partial<AgentContext> = {}
  ): Promise<AgentResponse> {
    const startTime = Date.now();

    // Get agent configuration
    const agent = await this.getAgent(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Build context
    const agentContext: AgentContext = {
      userId: context.userId!,
      sessionId: context.sessionId,
      agent,
      conversationHistory: context.conversationHistory || [],
      availableTools: (agent.tools as string[] || []).map((toolId: string) => this.tools.get(toolId)!).filter(Boolean)
    };

    // Add user message to history
    agentContext.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    // Parse model configuration
    const modelConfig = agent.model_config as any;
    const modelId = modelConfig.modelId || 'gpt-3.5-turbo';

    // Check if agent wants to use tools
    const toolDecision = await this.shouldUseTool(userMessage, agentContext);
    
    let toolCalls: AgentResponse['toolCalls'] = [];
    let enhancedPrompt = userMessage;

    // Execute tools if needed
    if (toolDecision.shouldUseTool && toolDecision.recommendedTool) {
      const tool = this.tools.get(toolDecision.recommendedTool);
      if (tool) {
        try {
          const toolResult = await this.executeTool(
            tool,
            toolDecision.parameters || {},
            agentContext
          );

          toolCalls.push({
            toolId: tool.id,
            parameters: toolDecision.parameters || {},
            result: toolResult
          });

          // Enhance prompt with tool results
          enhancedPrompt += `\n\n[Tool Result from ${tool.name}]:\n${JSON.stringify(toolResult, null, 2)}`;
        } catch (error) {
          console.error('Tool execution error:', error);
          enhancedPrompt += `\n\n[Tool Error]: ${tool.name} failed - ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      }
    }

    // Generate response
    const response = await aiModelManager.generateText(
      modelId,
      enhancedPrompt,
      {
        systemPrompt: agent.system_prompt,
        maxTokens: modelConfig.maxTokens || 1000,
        temperature: modelConfig.temperature || 0.7
      }
    );

    const responseTime = Date.now() - startTime;

    // Estimate cost and tokens (simplified)
    const estimatedTokens = Math.ceil((enhancedPrompt.length + response.length) / 4);
    const estimatedCost = estimatedTokens * 0.002 / 1000; // Rough estimate

    // Add response to history
    agentContext.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      metadata: { toolCalls, responseTime }
    });

    // Track usage
    await dbHelpers.trackUsage({
      user_id: agentContext.userId,
      model_id: modelId,
      tokens_used: estimatedTokens,
      cost: estimatedCost,
      feature_type: 'chat'
    });

    return {
      content: response,
      toolCalls,
      reasoning: toolDecision.reasoning,
      metadata: {
        model: modelId,
        tokensUsed: estimatedTokens,
        cost: estimatedCost,
        responseTime,
        confidence: 0.85 // Simplified confidence score
      }
    };
  }

  // Determine if agent should use tools
  private async shouldUseTool(
    message: string,
    context: AgentContext
  ): Promise<{
    shouldUseTool: boolean;
    recommendedTool?: string;
    parameters?: Record<string, any>;
    reasoning?: string;
  }> {
    if (context.availableTools.length === 0) {
      return { shouldUseTool: false };
    }

    // Simple heuristics for tool selection
    const lowerMessage = message.toLowerCase();

    // Web search triggers
    if (lowerMessage.includes('search') || lowerMessage.includes('latest') || 
        lowerMessage.includes('current') || lowerMessage.includes('news')) {
      return {
        shouldUseTool: true,
        recommendedTool: 'web_search',
        parameters: { query: message, limit: 3 },
        reasoning: 'User message indicates need for current information'
      };
    }

    // Knowledge base search triggers
    if (lowerMessage.includes('document') || lowerMessage.includes('knowledge') ||
        lowerMessage.includes('find in') || lowerMessage.includes('according to')) {
      return {
        shouldUseTool: true,
        recommendedTool: 'vector_search',
        parameters: { query: message, limit: 3 },
        reasoning: 'User message suggests looking in knowledge base'
      };
    }

    // Forecasting triggers
    if (lowerMessage.includes('forecast') || lowerMessage.includes('predict') ||
        lowerMessage.includes('future') || lowerMessage.includes('trend')) {
      return {
        shouldUseTool: false, // Would need data from user
        reasoning: 'Forecasting requires user to provide data'
      };
    }

    // Image generation triggers
    if (lowerMessage.includes('generate image') || lowerMessage.includes('create picture') ||
        lowerMessage.includes('draw') || lowerMessage.includes('visualize')) {
      const prompt = message.replace(/generate image|create picture|draw|visualize/gi, '').trim();
      if (prompt) {
        return {
          shouldUseTool: true,
          recommendedTool: 'generate_image',
          parameters: { prompt },
          reasoning: 'User requested image generation'
        };
      }
    }

    return { shouldUseTool: false };
  }

  // Execute tool
  private async executeTool(
    tool: AgentTool,
    parameters: Record<string, any>,
    context: AgentContext
  ): Promise<any> {
    return await tool.handler(parameters, context);
  }

  // Get agent by ID
  private async getAgent(agentId: string): Promise<AIAgent | null> {
    try {
      // This would typically fetch from database
      // For now, return null - implement proper database fetch
      return null;
    } catch (error) {
      console.error('Error fetching agent:', error);
      return null;
    }
  }

  // Get user's agents
  async getUserAgents(userId: string): Promise<AIAgent[]> {
    return await dbHelpers.getUserAgents(userId);
  }

  // Update agent
  async updateAgent(
    agentId: string,
    updates: Partial<CreateAgentRequest>
  ): Promise<AIAgent> {
    const updateData: any = {};

    if (updates.name) updateData.name = updates.name;
    if (updates.description) updateData.description = updates.description;
    if (updates.systemPrompt) {
      updateData.system_prompt = this.buildSystemPrompt(updates as CreateAgentRequest);
    }
    if (updates.tools) updateData.tools = updates.tools;
    if (updates.modelConfig) updateData.model_config = updates.modelConfig;

    return await dbHelpers.updateAgent(agentId, updateData);
  }

  // Delete agent
  async deleteAgent(agentId: string): Promise<void> {
    await dbHelpers.deleteAgent(agentId);
  }

  // Create agent template
  createAgentTemplate(
    type: 'customer_service' | 'data_analyst' | 'content_creator' | 'researcher' | 'developer'
  ): Partial<CreateAgentRequest> {
    const templates = {
      customer_service: {
        name: 'Customer Service Agent',
        description: 'Helpful customer service representative',
        systemPrompt: 'You are a friendly and professional customer service representative. Help customers with their inquiries, provide accurate information, and escalate complex issues when necessary.',
        tools: ['web_search', 'send_email', 'vector_search'],
        personality: {
          tone: 'friendly' as const,
          expertise: ['customer service', 'problem solving'],
          restrictions: ['Do not make promises about refunds without approval']
        }
      },
      data_analyst: {
        name: 'Data Analyst Agent',
        description: 'Expert in data analysis and insights',
        systemPrompt: 'You are a skilled data analyst. Analyze data, identify patterns, create forecasts, and detect anomalies. Provide clear explanations of your findings.',
        tools: ['forecast_data', 'detect_anomalies', 'vector_search', 'code_interpreter'],
        personality: {
          tone: 'technical' as const,
          expertise: ['statistics', 'data analysis', 'forecasting', 'machine learning'],
          restrictions: ['Always verify data quality before analysis']
        }
      },
      content_creator: {
        name: 'Content Creator Agent',
        description: 'Creative content generation specialist',
        systemPrompt: 'You are a creative content creator. Generate engaging content, create images, and help with marketing materials. Be creative and original.',
        tools: ['generate_image', 'web_search', 'vector_search'],
        personality: {
          tone: 'creative' as const,
          expertise: ['content creation', 'marketing', 'design'],
          restrictions: ['Ensure all content is original and appropriate']
        }
      },
      researcher: {
        name: 'Research Agent',
        description: 'Comprehensive research specialist',
        systemPrompt: 'You are a thorough researcher. Find and analyze information from multiple sources, synthesize findings, and provide well-researched reports.',
        tools: ['web_search', 'vector_search'],
        personality: {
          tone: 'professional' as const,
          expertise: ['research', 'analysis', 'fact-checking'],
          restrictions: ['Always cite sources and verify information']
        }
      },
      developer: {
        name: 'Developer Agent',
        description: 'Software development assistant',
        systemPrompt: 'You are an experienced software developer. Help with coding, debugging, architecture decisions, and technical documentation.',
        tools: ['code_interpreter', 'web_search', 'vector_search'],
        personality: {
          tone: 'technical' as const,
          expertise: ['programming', 'software architecture', 'debugging'],
          restrictions: ['Follow security best practices in all recommendations']
        }
      }
    };

    return templates[type];
  }
}

// Export singleton instance
export const agentService = new AgentService();

// Utility functions for agents
export const agentUtils = {
  // Validate agent configuration
  validateAgentConfig: (config: CreateAgentRequest): string[] => {
    const errors: string[] = [];

    if (!config.name?.trim()) errors.push('Agent name is required');
    if (!config.systemPrompt?.trim()) errors.push('System prompt is required');
    if (!config.modelConfig?.modelId) errors.push('Model ID is required');

    if (config.modelConfig?.temperature < 0 || config.modelConfig?.temperature > 2) {
      errors.push('Temperature must be between 0 and 2');
    }

    if (config.modelConfig?.maxTokens < 1 || config.modelConfig?.maxTokens > 4000) {
      errors.push('Max tokens must be between 1 and 4000');
    }

    return errors;
  },

  // Extract mentions and entities from message
  extractEntities: (message: string): {
    mentions: string[];
    urls: string[];
    emails: string[];
  } => {
    const mentions = message.match(/@(\w+)/g) || [];
    const urls = message.match(/https?:\/\/[^\s]+/g) || [];
    const emails = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];

    return {
      mentions: mentions.map(m => m.slice(1)),
      urls,
      emails
    };
  },

  // Calculate agent performance metrics
  calculateAgentMetrics: (conversations: any[]): {
    averageResponseTime: number;
    totalInteractions: number;
    toolUsageRate: number;
    userSatisfaction: number;
  } => {
    if (conversations.length === 0) {
      return {
        averageResponseTime: 0,
        totalInteractions: 0,
        toolUsageRate: 0,
        userSatisfaction: 0
      };
    }

    const totalResponseTime = conversations.reduce((sum, conv) => 
      sum + (conv.metadata?.responseTime || 0), 0);
    
    const toolUsage = conversations.filter(conv => 
      conv.metadata?.toolCalls?.length > 0).length;

    return {
      averageResponseTime: totalResponseTime / conversations.length,
      totalInteractions: conversations.length,
      toolUsageRate: (toolUsage / conversations.length) * 100,
      userSatisfaction: 85 // Placeholder - would come from user feedback
    };
  }
}; 