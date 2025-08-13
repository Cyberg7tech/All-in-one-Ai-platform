'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Send,
  User,
  Trash2,
  Copy,
  RotateCcw,
  Settings,
  Loader2,
  Image,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasImage?: boolean;
}

export default function GeminiChatPage() {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-pro');
  const [temperature, setTemperature] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const geminiModels = [
    { id: 'gemini-pro', name: 'Gemini Pro', description: 'Best for text-based tasks' },
    { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', description: 'Text and image understanding' },
    { id: 'gemini-ultra', name: 'Gemini Ultra', description: 'Most capable model' },
  ];

  const promptCategories = [
    {
      title: 'Creative Writing',
      examples: [
        'Write a short story about a time traveler who accidentally changes a small detail in the past',
        'Create a poem about the beauty of artificial intelligence and human creativity working together',
      ],
    },
    {
      title: 'Analysis & Research',
      examples: [
        'Analyze the potential benefits and risks of renewable energy adoption globally',
        'Compare and contrast different machine learning algorithms for natural language processing',
      ],
    },
    {
      title: 'Problem Solving',
      examples: [
        'Help me brainstorm solutions for reducing plastic waste in my local community',
        'Design a study plan for learning a new programming language in 3 months',
      ],
    },
    {
      title: 'Educational',
      examples: [
        'Explain quantum computing concepts in simple terms with real-world analogies',
        'Teach me about the history and significance of the Renaissance period',
      ],
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
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Ensure session and save user message
      let sid = sessionId;
      if (!sid) {
        const resSession = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Gemini Chat', model_id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo' }),
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

      // Use Together chat per your requirement (replacing Gemini with Together)
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant. Provide structured, insightful answers.' },
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
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid, role: 'assistant', content: assistantMessage.content, model_used: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo' }),
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

  const generateGeminiResponse = (userInput: string) => {
    const responses = [
      `Thank you for your thoughtful question about "${userInput}". As Gemini, I'm designed to provide comprehensive, nuanced responses that consider multiple perspectives.

## Analysis

Let me break down this topic systematically:

**Key Considerations:**
- **Context**: Understanding the broader implications of your question
- **Multiple Perspectives**: Examining different viewpoints and approaches
- **Practical Applications**: How this knowledge can be applied in real scenarios

## Detailed Response

Your question touches on several important aspects that deserve careful exploration:

1. **Primary Analysis**: The core concepts involved are multifaceted and require careful consideration of various factors.

2. **Supporting Evidence**: Research and established knowledge support several key points in this area.

3. **Practical Implications**: This has real-world applications that could benefit from strategic implementation.

## Recommendations

Based on my analysis, here are some actionable insights:

- **Short-term considerations**: Immediate steps you might consider
- **Long-term strategy**: Broader approaches for sustained success
- **Alternative approaches**: Different methods worth exploring

## Further Exploration

This topic connects to several related areas that might interest you:
- Related concepts worth investigating
- Emerging trends in this field
- Resources for deeper learning

Would you like me to elaborate on any specific aspect or explore related topics in more detail?`,

      `I appreciate you bringing up "${userInput}" - this is exactly the kind of complex topic where Gemini's multimodal understanding and reasoning capabilities can provide valuable insights.

## Understanding the Question

Your inquiry demonstrates thoughtful consideration of a nuanced topic. Let me address this comprehensively:

**Context Analysis:**
I'll examine this from multiple angles to provide you with a well-rounded perspective.

## Comprehensive Response

**Foundation Concepts:**
The fundamental principles underlying your question involve several interconnected elements:

- **Core Theory**: The established knowledge base in this area
- **Current Research**: Recent developments and emerging insights
- **Practical Framework**: How these concepts apply in practice

**Detailed Breakdown:**

1. **Primary Factors**: The main elements that influence this topic
2. **Secondary Considerations**: Additional factors that play important roles
3. **Interaction Effects**: How different elements influence each other

## Creative Solutions

Here are some innovative approaches to consider:

**Traditional Methods:**
- Established practices that have proven effective
- Time-tested strategies with strong track records

**Emerging Approaches:**
- Cutting-edge methods gaining traction
- Experimental techniques showing promise

**Hybrid Solutions:**
- Combining traditional and modern approaches
- Customized strategies for specific contexts

## Implementation Strategy

To move forward effectively:

**Phase 1**: Initial assessment and planning
**Phase 2**: Implementation with careful monitoring
**Phase 3**: Optimization based on results

What specific aspect would you like to explore further? I can dive deeper into any particular area that interests you most.`,

      `Excellent question about "${userInput}"! This gives me an opportunity to demonstrate Gemini's ability to provide structured, insightful analysis.

## Multi-Dimensional Analysis

Let me approach this systematically using my reasoning capabilities:

### 🔍 **Deep Dive Analysis**

**Historical Context:**
Understanding how this topic has evolved provides important context for current applications.

**Current State:**
- **Status Quo**: Where things stand today
- **Challenges**: Current limitations and obstacles
- **Opportunities**: Areas for improvement and innovation

**Future Trajectory:**
- **Emerging Trends**: What's on the horizon
- **Potential Developments**: Likely future scenarios
- **Disruptive Possibilities**: Game-changing innovations

### 💡 **Practical Insights**

**For Immediate Application:**
1. **Quick Wins**: Simple changes with immediate impact
2. **Foundation Building**: Essential groundwork for long-term success
3. **Risk Mitigation**: Potential pitfalls to avoid

**Strategic Considerations:**
- **Resource Allocation**: How to best use available resources
- **Timeline Planning**: Realistic expectations for implementation
- **Success Metrics**: How to measure progress and success

### 🎯 **Actionable Recommendations**

**High Priority Actions:**
- Critical steps to take immediately
- Must-have elements for success

**Medium Priority Items:**
- Important but not urgent considerations
- Building blocks for future expansion

**Future Considerations:**
- Long-term planning elements
- Adaptability for changing circumstances

## Conclusion

This topic offers rich opportunities for exploration and application. The key is balancing theoretical understanding with practical implementation.

Is there a particular angle you'd like me to explore further? I can provide more specific guidance based on your particular interests or circumstances.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

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
        content: generateGeminiResponse(userMessage.content),
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

  const handleExample = (example: string) => {
    setInput(example);
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
              <div className='p-2 bg-yellow-100 rounded-lg'>
                <Sparkles className='size-6 text-yellow-600' />
              </div>
              <div>
                <h1 className='text-3xl font-bold'>Gemini Chat App</h1>
                <p className='text-muted-foreground'>Chat with Google's Gemini AI model</p>
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
                  <label className='text-sm font-medium'>Gemini Model</label>
                  <div className='space-y-2'>
                    {geminiModels.map((model) => (
                      <Button
                        key={model.id}
                        variant={selectedModel === model.id ? 'default' : 'outline'}
                        onClick={() => setSelectedModel(model.id)}
                        className='w-full justify-start h-auto p-3'>
                        <div className='text-left'>
                          <div className='font-medium text-sm'>{model.name}</div>
                          <div className='text-xs text-muted-foreground'>{model.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Temperature */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Creativity: {temperature}</label>
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

                {/* Prompt Categories */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Prompt Categories</label>
                  <div className='space-y-3'>
                    {promptCategories.map((category, categoryIndex) => (
                      <div key={categoryIndex} className='space-y-1'>
                        <div className='text-xs font-medium text-muted-foreground'>{category.title}</div>
                        {category.examples.slice(0, 1).map((example, exampleIndex) => (
                          <Button
                            key={exampleIndex}
                            variant='outline'
                            size='sm'
                            onClick={() => handleExample(example)}
                            className='w-full text-left h-auto p-2 text-xs justify-start'>
                            {example.substring(0, 60)}...
                          </Button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gemini Features */}
                <div className='p-3 bg-muted rounded-lg'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <Sparkles className='size-4 text-yellow-600' />
                    <span className='text-sm font-medium'>Gemini Capabilities</span>
                  </div>
                  <ul className='text-xs text-muted-foreground space-y-1'>
                    <li className='flex items-center space-x-1'>
                      <FileText className='size-3' />
                      <span>Text understanding & generation</span>
                    </li>
                    <li className='flex items-center space-x-1'>
                      <Image className='size-3' />
                      <span>Image analysis (Pro Vision)</span>
                    </li>
                    <li className='flex items-center space-x-1'>
                      <Lightbulb className='size-3' />
                      <span>Creative problem solving</span>
                    </li>
                    <li className='flex items-center space-x-1'>
                      <Sparkles className='size-3' />
                      <span>Multimodal reasoning</span>
                    </li>
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
                  <CardTitle>Gemini Chat</CardTitle>
                  <div className='flex items-center space-x-2'>
                    <Badge variant='secondary' className='flex items-center gap-1'>
                      <Sparkles className='size-3' />
                      {geminiModels.find((m) => m.id === selectedModel)?.name}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='flex-1 flex flex-col min-h-0'>
                {/* Messages */}
                <div className='flex-1 overflow-y-auto space-y-4 mb-4'>
                  {messages.length === 0 ? (
                    <div className='text-center py-12'>
                      <Sparkles className='size-16 text-muted-foreground mx-auto mb-4' />
                      <h3 className='text-lg font-semibold mb-2'>Welcome to Gemini</h3>
                      <p className='text-muted-foreground mb-4'>
                        Start a conversation with Google's most capable AI model
                      </p>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-2 max-w-lg mx-auto'>
                        {promptCategories.map((category, index) => (
                          <Button
                            key={index}
                            variant='outline'
                            size='sm'
                            onClick={() => handleExample(category.examples[0])}
                            className='text-xs'>
                            {category.title}
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
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                          {message.role === 'user' ? (
                            <User className='size-4' />
                          ) : (
                            <Sparkles className='size-4' />
                          )}
                        </div>
                        <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                          <div
                            className={`p-3 rounded-lg ${
                              message.role === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-muted'
                            }`}>
                            <div className='whitespace-pre-wrap'>{message.content}</div>
                          </div>
                          <div className='flex items-center space-x-2 mt-2'>
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
                      <div className='shrink-0 size-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center'>
                        <Sparkles className='size-4' />
                      </div>
                      <div className='flex-1'>
                        <div className='p-3 rounded-lg bg-muted'>
                          <div className='flex items-center space-x-2'>
                            <Loader2 className='size-4 animate-spin' />
                            <span>Gemini is thinking...</span>
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
                    placeholder='Ask Gemini anything...'
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
