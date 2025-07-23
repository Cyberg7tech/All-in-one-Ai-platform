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

    // Mock agent configuration - in real app, fetch from database
    const agentConfig = {
      id: agentId,
      name: 'AI Assistant',
      model: 'gpt-4',
      systemPrompt: 'You are a helpful AI assistant with access to various tools. Use them when appropriate to provide better responses.',
      tools: ['web_search', 'generate_image', 'send_email', 'code_interpreter', 'analyze_data']
    };

    const context = {
      userId,
      sessionId: sessionId || 'default-session',
      agentId,
      conversationHistory: [], // In real app, fetch from database
      userData: {}
    };

    const response = await agentService.executeAgent(agentConfig, message, context);

    return NextResponse.json({
      success: true,
      response: response.content,
      toolsUsed: response.toolsUsed,
      usage: response.usage,
      metadata: response.metadata
    });

  } catch (error) {
    console.error('Agent execution error:', error);
    return NextResponse.json(
      { 
        error: 'Agent execution failed',
        message: error instanceof Error ? error.message : 'Unknown error'
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