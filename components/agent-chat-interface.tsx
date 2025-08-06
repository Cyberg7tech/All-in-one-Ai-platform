'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, Image, Code, Mail, Search, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolsUsed?: string[];
  usage?: {
    tokensUsed: number;
    apiCalls: number;
    cost: number;
  };
  metadata?: {
    model: string;
    responseTime: number;
    confidence: number;
  };
}

interface AgentChatProps {
  agentId: string;
  agentName: string;
  agentModel: string;
  agentTools: string[];
}

const TOOL_ICONS = {
  web_search: Search,
  generate_image: Image,
  send_email: Mail,
  code_interpreter: Code,
  analyze_data: BarChart3,
};

export default function AgentChatInterface({ agentId, agentName, agentModel, agentTools }: AgentChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          message: userMessage.content,
          userId: user.id,
          sessionId: `agent-${agentId}-${Date.now()}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const assistantMessage: AgentMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          toolsUsed: data.toolsUsed,
          usage: data.usage,
          metadata: data.metadata,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.message || 'Agent execution failed');
      }
    } catch (error) {
      console.error('Agent chat error:', error);

      const errorMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the API configuration.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Agent Header */}
      <Card className='mb-4'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='size-10 rounded-full bg-primary/10 flex items-center justify-center'>
                <Bot className='size-5 text-primary' />
              </div>
              <div>
                <CardTitle className='text-lg'>{agentName}</CardTitle>
                <div className='flex items-center space-x-2 mt-1'>
                  <Badge variant='outline'>{agentModel}</Badge>
                  <span className='text-xs text-muted-foreground'>{agentTools.length} tools available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Available Tools */}
          <div className='flex flex-wrap gap-2 mt-3'>
            {agentTools.map((tool) => {
              const Icon = TOOL_ICONS[tool as keyof typeof TOOL_ICONS] || Bot;
              return (
                <div key={tool} className='flex items-center space-x-1 px-2 py-1 bg-muted rounded-md text-xs'>
                  <Icon className='size-3' />
                  <span>{tool.replace('_', ' ')}</span>
                </div>
              );
            })}
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto space-y-4 mb-4'>
        {messages.length === 0 ? (
          <div className='text-center py-8'>
            <Bot className='size-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Start chatting with {agentName}</h3>
            <p className='text-muted-foreground'>
              This agent can help you with various tasks using {agentTools.length} different tools.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div
                    className={`size-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                    {message.role === 'user' ? <User className='size-4' /> : <Bot className='size-4' />}
                  </div>

                  <div
                    className={`px-4 py-3 rounded-lg ${
                      message.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'
                    }`}>
                    <div className='prose prose-sm max-w-none dark:prose-invert'>
                      {message.content.split('\n').map((line, i) => (
                        <p key={i} className='mb-2 last:mb-0'>
                          {line}
                        </p>
                      ))}
                    </div>

                    {message.role === 'assistant' && (
                      <div className='mt-3 pt-3 border-t border-border/20'>
                        {/* Tools Used */}
                        {message.toolsUsed && message.toolsUsed.length > 0 && (
                          <div className='flex items-center space-x-2 mb-2'>
                            <span className='text-xs text-muted-foreground'>Tools used:</span>
                            {message.toolsUsed.map((tool) => {
                              const Icon = TOOL_ICONS[tool as keyof typeof TOOL_ICONS] || Bot;
                              return (
                                <div
                                  key={tool}
                                  className='flex items-center space-x-1 px-2 py-1 bg-background/50 rounded text-xs'>
                                  <Icon className='size-3' />
                                  <span>{tool.replace('_', ' ')}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Usage Info */}
                        <div className='flex items-center justify-between text-xs text-muted-foreground'>
                          <div className='flex items-center space-x-3'>
                            {message.metadata?.model && <span>{message.metadata.model}</span>}
                            {message.usage?.tokensUsed && <span>{message.usage.tokensUsed} tokens</span>}
                            {message.usage?.cost && <span>${message.usage.cost.toFixed(4)}</span>}
                          </div>
                          <div className='flex items-center space-x-2'>
                            {message.metadata?.responseTime && (
                              <span>{(message.metadata.responseTime / 1000).toFixed(1)}s</span>
                            )}
                            <span>{message.timestamp.toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className='flex justify-start'>
            <div className='flex items-start space-x-3'>
              <div className='size-8 rounded-full bg-muted flex items-center justify-center'>
                <Bot className='size-4' />
              </div>
              <div className='bg-muted px-4 py-3 rounded-lg'>
                <div className='flex items-center space-x-2'>
                  <Loader2 className='size-4 animate-spin' />
                  <span className='text-sm'>Agent is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className='border-t pt-4'>
        <div className='flex items-end space-x-2'>
          <div className='flex-1'>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Ask the agent something...'
              className='w-full p-3 border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px] max-h-32'
              rows={1}
            />
          </div>
          <Button onClick={sendMessage} disabled={!inputMessage.trim() || isLoading} className='h-11'>
            <Send className='size-4' />
          </Button>
        </div>
        <div className='flex items-center justify-between mt-2 text-xs text-muted-foreground'>
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>Agent: {agentName}</span>
        </div>
      </div>
    </div>
  );
}
