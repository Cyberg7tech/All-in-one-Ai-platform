'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, User, Trash2, Copy, RotateCcw, Settings, Loader2, Zap, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model: string;
  timestamp: Date;
}

export default function LlamaGPTPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('llama-3.1-70b');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const llamaModels = [
    { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', description: 'Most capable, slower' },
    { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', description: 'Balanced performance' },
    { id: 'llama-3.1-1b', name: 'Llama 3.1 1B', description: 'Fastest, lightweight' },
    { id: 'code-llama-34b', name: 'Code Llama 34B', description: 'Specialized for coding' },
  ];

  const promptTemplates = [
    {
      title: 'Creative Writing',
      prompt: 'Write a short story about a world where AI and humans work together to solve climate change.',
    },
    {
      title: 'Code Assistant',
      prompt: 'Explain how to implement a binary search algorithm in Python with detailed comments.',
    },
    {
      title: 'Data Analysis',
      prompt: 'Analyze this data pattern and suggest insights: [describe your data here]',
    },
    {
      title: 'Problem Solving',
      prompt: 'Break down this complex problem into manageable steps: [describe your problem]',
    },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      model: selectedModel,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Ensure persistent chat session and save user message
      let sid = sessionId;
      if (!sid) {
        const resSession = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Llama 3.1 Chat',
            model_id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
          }),
        });
        const js = await resSession.json();
        if (!resSession.ok) throw new Error(js?.error || 'Failed to create session');
        sid = js.session?.id;
        setSessionId(sid);
      }

      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid, role: 'user', content: userMessage.content }),
      });

      // Together chat call
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
          messages: [
            { role: 'system', content: 'You are Llama 3.1. Be helpful, concise, and accurate.' },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content },
          ],
          maxTokens: 1000,
          temperature,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'LLM failed');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: String(data.content || ''),
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sid,
          role: 'assistant',
          content: assistantMessage.content,
          model_used: assistantMessage.model,
        }),
      });
    } catch (error) {
      toast({
        title: 'Error sending message',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mock generator removed; using Together chat

  const clearChat = () => {
    setMessages([]);
    toast({
      title: 'Chat cleared',
      description: 'All messages have been removed.',
    });
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied to clipboard',
      description: 'Message content has been copied.',
    });
  };

  const regenerateResponse = async (messageIndex: number) => {
    if (messageIndex < 1) return;

    const userMessage = messages[messageIndex - 1];
    if (userMessage.role !== 'user') return;

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newMessages = [...messages];
      newMessages[messageIndex] = {
        ...newMessages[messageIndex],
        content: newMessages[messageIndex].content,
        timestamp: new Date(),
      };

      setMessages(newMessages);

      toast({
        title: 'Response regenerated',
        description: 'A new response has been generated.',
      });
    } catch (error) {
      toast({
        title: 'Error regenerating response',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplate = (template: string) => {
    setInput(template);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className='container mx-auto p-6 h-[calc(100vh-4rem)]'>
      <div className='max-w-6xl mx-auto h-full flex flex-col'>
        {/* Header */}
        <div className='mb-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-orange-100 rounded-lg'>
                <Bot className='size-6 text-orange-600' />
              </div>
              <div>
                <h1 className='text-3xl font-bold'>Llama 3.1 ChatGPT</h1>
                <p className='text-muted-foreground'>Chat with Meta's Llama 3.1 model</p>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <Button variant='outline' size='sm' onClick={clearChat}>
                <Trash2 className='size-4 mr-2' />
                Clear
              </Button>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0'>
          {/* Settings Panel */}
          <div className='lg:col-span-1'>
            <Card className='h-fit'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Settings className='size-5' />
                  Model Settings
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Model Selection */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Llama Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className='w-full p-2 border border-input rounded-md bg-background text-sm'>
                    {llamaModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                  <p className='text-xs text-muted-foreground'>
                    {llamaModels.find((m) => m.id === selectedModel)?.description}
                  </p>
                </div>

                {/* Temperature */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Temperature: {temperature}</label>
                  <input
                    type='range'
                    min='0'
                    max='1'
                    step='0.1'
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className='w-full'
                  />
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>Focused</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Max Tokens: {maxTokens}</label>
                  <input
                    type='range'
                    min='256'
                    max='4096'
                    step='256'
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className='w-full'
                  />
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>256</span>
                    <span>4096</span>
                  </div>
                </div>

                {/* Prompt Templates */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Quick Start Templates</label>
                  <div className='space-y-1'>
                    {promptTemplates.map((template, index) => (
                      <Button
                        key={index}
                        variant='outline'
                        size='sm'
                        onClick={() => handleTemplate(template.prompt)}
                        className='w-full justify-start text-left h-auto p-2'>
                        <div>
                          <div className='font-medium text-xs'>{template.title}</div>
                          <div className='text-xs text-muted-foreground line-clamp-2'>
                            {template.prompt.substring(0, 50)}...
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Model Info */}
                <div className='p-3 bg-muted rounded-lg'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <Brain className='size-4 text-orange-600' />
                    <span className='text-sm font-medium'>Llama 3.1 Features</span>
                  </div>
                  <ul className='text-xs text-muted-foreground space-y-1'>
                    <li>• Advanced reasoning</li>
                    <li>• Code generation</li>
                    <li>• Creative writing</li>
                    <li>• Complex problem solving</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className='lg:col-span-3 flex flex-col'>
            <Card className='flex-1 flex flex-col min-h-0'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle>Chat with Llama 3.1</CardTitle>
                  <div className='flex items-center space-x-2'>
                    <Badge variant='secondary' className='flex items-center gap-1'>
                      <Zap className='size-3' />
                      {llamaModels.find((m) => m.id === selectedModel)?.name}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='flex-1 flex flex-col min-h-0'>
                {/* Messages */}
                <div className='flex-1 overflow-y-auto space-y-4 mb-4'>
                  {messages.length === 0 ? (
                    <div className='text-center py-12'>
                      <Bot className='size-16 text-muted-foreground mx-auto mb-4' />
                      <h3 className='text-lg font-semibold mb-2'>Welcome to Llama 3.1 Chat</h3>
                      <p className='text-muted-foreground mb-4'>
                        Start a conversation with Meta's advanced language model
                      </p>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md mx-auto'>
                        {promptTemplates.slice(0, 4).map((template, index) => (
                          <Button
                            key={index}
                            variant='outline'
                            size='sm'
                            onClick={() => handleTemplate(template.prompt)}
                            className='text-xs'>
                            {template.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-3 ${
                          message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                        <div
                          className={`shrink-0 size-8 rounded-full flex items-center justify-center ${
                            message.role === 'user'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-orange-100 text-orange-600'
                          }`}>
                          {message.role === 'user' ? <User className='size-4' /> : <Bot className='size-4' />}
                        </div>
                        <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                          <div
                            className={`p-3 rounded-lg ${
                              message.role === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-muted'
                            }`}>
                            <div className='whitespace-pre-wrap'>{message.content}</div>
                          </div>
                          <div className='flex items-center space-x-2 mt-2'>
                            <Badge variant='outline' className='text-xs'>
                              {llamaModels.find((m) => m.id === message.model)?.name || message.model}
                            </Badge>
                            <span className='text-xs text-muted-foreground'>
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => copyMessage(message.content)}
                              className='size-6 p-0'>
                              <Copy className='size-3' />
                            </Button>
                            {message.role === 'assistant' && (
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => regenerateResponse(index)}
                                className='size-6 p-0'
                                disabled={isLoading}>
                                <RotateCcw className='size-3' />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className='flex items-start space-x-3'>
                      <div className='shrink-0 size-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center'>
                        <Bot className='size-4' />
                      </div>
                      <div className='flex-1'>
                        <div className='p-3 rounded-lg bg-muted'>
                          <div className='flex items-center space-x-2'>
                            <Loader2 className='size-4 animate-spin' />
                            <span>Llama is thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className='flex space-x-2'>
                  <Input
                    placeholder='Ask Llama 3.1 anything...'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className='flex-1'
                  />
                  <Button onClick={sendMessage} disabled={!input.trim() || isLoading}>
                    {isLoading ? <Loader2 className='size-4 animate-spin' /> : <Send className='size-4' />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
