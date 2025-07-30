import { NextRequest, NextResponse } from 'next/server';
import { EnhancedAgentService } from '@/lib/agents/enhanced-agent-service';

const agentService = new EnhancedAgentService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, message, userId, sessionId } = body;

    if (!agentId || !message || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, message, userId' },
        { status: 400 }
      );
    }

    // Optimized model selection: Together AI for chat/LLM, AI/ML API for multimedia
    const getAvailableModel = () => {
      // Priority 1: Together AI for chat/LLM (fast and cost-effective)
      if (process.env.TOGETHER_API_KEY) {
        return 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'; // Verified available Together AI model
      }
      
      // Priority 2: AI/ML API for premium models (if configured)
      if (process.env.AIML_API_KEY) {
        return 'gpt-4.1'; // Premium GPT-4.1 via AI/ML API
      }
      
      // Priority 3: OpenAI direct (if configured)
      if (process.env.OPENAI_API_KEY?.startsWith('sk-')) {
        return 'gpt-4o-mini'; // Fastest OpenAI model
      } 
      
      // Fallback: Default (will show error message if not configured)
      return 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo';
    };

    // Enhanced agent configuration with AI/ML API support
    const agentConfig = {
      id: agentId,
      name: 'AI Assistant',
      model: getAvailableModel(),
      systemPrompt: `You are a highly capable AI assistant with access to various tools and models. 
      
Key guidelines:
- Use tools when they would be helpful for the user's request
- Provide clear, accurate, and informative responses  
- If a tool fails, explain what went wrong and suggest alternatives
- Be proactive in offering solutions and follow-up questions
- Leverage your knowledge across multiple domains effectively

Available tools: web search, image generation, data analysis, code execution, email sending.

Current date and time: ${new Date().toLocaleString()}`,
      tools: ['web_search', 'generate_image', 'send_email', 'code_interpreter', 'analyze_data']
    };

    // Execute the agent with enhanced capabilities
    const result = await agentService.executeAgent(
      agentConfig,
      message,
      {
        userId,
        sessionId: sessionId || `session_${Date.now()}`,
        conversationHistory: [],
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: request.headers.get('user-agent') || 'unknown',
          model: agentConfig.model
        }
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Agent execution error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to execute agent', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Agent execution endpoint. Use POST to execute an agent.',
    availableTools: agentService.getAvailableTools().map(tool => ({
      id: tool.id,
      name: tool.name,
      description: tool.description
    }))
  });
} 