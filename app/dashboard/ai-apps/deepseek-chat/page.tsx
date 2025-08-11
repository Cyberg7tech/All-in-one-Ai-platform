'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, Send, User, Trash2, Copy, RotateCcw, Settings, Loader2, Zap, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function DeepSeekChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('deepseek-coder');
  const [temperature, setTemperature] = useState(0.3);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const deepseekModels = [
    { id: 'deepseek-coder', name: 'DeepSeek Coder', description: 'Specialized for coding tasks' },
    { id: 'deepseek-chat', name: 'DeepSeek Chat', description: 'General conversation' },
    { id: 'deepseek-math', name: 'DeepSeek Math', description: 'Mathematical reasoning' },
  ];

  const codeExamples = [
    {
      title: 'Python Algorithm',
      prompt:
        'Write a Python function to implement binary search with detailed comments and complexity analysis.',
    },
    {
      title: 'React Component',
      prompt: 'Create a React component for a responsive navigation bar with TypeScript and Tailwind CSS.',
    },
    {
      title: 'Database Query',
      prompt: 'Write a SQL query to find the top 5 customers by total order value in the last 30 days.',
    },
    {
      title: 'API Design',
      prompt: 'Design a REST API for a task management system with proper endpoints and status codes.',
    },
  ];

  const mathExamples = [
    {
      title: 'Calculus Problem',
      prompt: 'Solve the integral of x²sin(x) dx using integration by parts, showing all steps.',
    },
    {
      title: 'Linear Algebra',
      prompt: 'Find the eigenvalues and eigenvectors of the matrix [[2,1],[1,2]].',
    },
    {
      title: 'Statistics',
      prompt: 'Explain the difference between Type I and Type II errors in hypothesis testing with examples.',
    },
    {
      title: 'Probability',
      prompt: 'Calculate the probability of getting at least 2 heads in 5 coin flips.',
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
      // Simulate DeepSeek API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateDeepSeekResponse(userMessage.content, selectedModel),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
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

  const generateDeepSeekResponse = (userInput: string, model: string) => {
    if (model === 'deepseek-coder') {
      return `I'll help you with your coding request: "${userInput}"

\`\`\`python
# Here's a well-structured solution:

def example_function(parameter):
    """
    Detailed function implementation with proper documentation.
    
    Args:
        parameter: Description of the parameter
        
    Returns:
        Expected return value description
    """
    # Implementation details with clear logic
    result = process_parameter(parameter)
    return result

# Example usage:
if __name__ == "__main__":
    result = example_function("example")
    print(f"Result: {result}")
\`\`\`

**Key Points:**
1. **Clean Code**: Following best practices for readability
2. **Documentation**: Comprehensive docstrings and comments
3. **Error Handling**: Robust exception management
4. **Testing**: Consider unit tests for validation

**Time Complexity:** O(n) where n is the input size
**Space Complexity:** O(1) for constant space usage

Would you like me to explain any specific part or optimize this further?`;
    } else if (model === 'deepseek-math') {
      return `I'll solve this mathematical problem step by step: "${userInput}"

**Given:** The problem as stated above

**Solution:**

**Step 1:** Initial setup and variable identification
Let's define our variables and constraints clearly.

**Step 2:** Apply relevant mathematical principles
Using the appropriate theorem or formula:

$$\\begin{align}
f(x) &= x^2 + 2x + 1 \\\\
&= (x + 1)^2
\\end{align}$$

**Step 3:** Detailed calculations
Working through each transformation:
- First, we simplify the expression
- Then, we apply the substitution
- Finally, we evaluate the result

**Step 4:** Verification
Let's verify our answer by substitution or alternative method.

**Final Answer:** The solution is clearly defined with proper mathematical notation.

**Applications:** This type of problem is commonly used in calculus, algebra, and engineering applications.

Would you like me to explain any specific step in more detail?`;
    } else {
      return `Thank you for your question: "${userInput}"

As DeepSeek AI, I'm designed to provide thoughtful, accurate responses across various domains. Let me address your query comprehensively:

**Analysis:**
Your question touches on important concepts that require careful consideration. I'll break this down systematically:

**Key Insights:**
1. **Context Understanding**: I've analyzed the broader context of your question
2. **Detailed Response**: Providing comprehensive information with practical examples
3. **Multiple Perspectives**: Considering different angles and approaches
4. **Actionable Advice**: Offering concrete next steps you can take

**Detailed Explanation:**
The topic you've raised involves several interconnected elements. Let me explain each component and how they relate to your specific situation.

**Practical Applications:**
Here are some ways you can apply this knowledge in real-world scenarios.

**Further Considerations:**
There are additional factors worth exploring that could enhance your understanding of this topic.

Is there any particular aspect you'd like me to elaborate on or any follow-up questions you have?`;
    }
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
        content: generateDeepSeekResponse(userMessage.content, selectedModel),
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

  const handleExample = (example: { title: string; prompt: string }) => {
    setInput(example.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getCurrentExamples = () => {
    if (selectedModel === 'deepseek-coder') return codeExamples;
    if (selectedModel === 'deepseek-math') return mathExamples;
    return codeExamples.slice(0, 2).concat(mathExamples.slice(0, 2));
  };

  return (
    <div className='container mx-auto p-6 h-[calc(100vh-4rem)]'>
      <div className='max-w-6xl mx-auto h-full flex flex-col'>
        {/* Header */}
        <div className='mb-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <Brain className='size-6 text-blue-600' />
              </div>
              <div>
                <h1 className='text-3xl font-bold'>DeepSeek Chat App</h1>
                <p className='text-muted-foreground'>Chat with DeepSeek AI models</p>
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
                  <label className='text-sm font-medium'>DeepSeek Model</label>
                  <div className='space-y-2'>
                    {deepseekModels.map((model) => (
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
                    <span>Precise</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Examples */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Example Prompts</label>
                  <div className='space-y-1'>
                    {getCurrentExamples()
                      .slice(0, 4)
                      .map((example, index) => (
                        <Button
                          key={index}
                          variant='outline'
                          size='sm'
                          onClick={() => handleExample(example)}
                          className='w-full justify-start text-left h-auto p-2'>
                          <div>
                            <div className='font-medium text-xs'>{example.title}</div>
                            <div className='text-xs text-muted-foreground line-clamp-2'>
                              {example.prompt.substring(0, 60)}...
                            </div>
                          </div>
                        </Button>
                      ))}
                  </div>
                </div>

                {/* Model Info */}
                <div className='p-3 bg-muted rounded-lg'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <Brain className='size-4 text-blue-600' />
                    <span className='text-sm font-medium'>DeepSeek Features</span>
                  </div>
                  <ul className='text-xs text-muted-foreground space-y-1'>
                    {selectedModel === 'deepseek-coder' && (
                      <>
                        <li>• Code generation & debugging</li>
                        <li>• Algorithm explanations</li>
                        <li>• Code optimization</li>
                        <li>• Multiple programming languages</li>
                      </>
                    )}
                    {selectedModel === 'deepseek-math' && (
                      <>
                        <li>• Mathematical problem solving</li>
                        <li>• Step-by-step solutions</li>
                        <li>• Formula derivations</li>
                        <li>• Complex calculations</li>
                      </>
                    )}
                    {selectedModel === 'deepseek-chat' && (
                      <>
                        <li>• General conversations</li>
                        <li>• Knowledge Q&A</li>
                        <li>• Creative writing</li>
                        <li>• Problem analysis</li>
                      </>
                    )}
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
                  <CardTitle>DeepSeek Chat</CardTitle>
                  <div className='flex items-center space-x-2'>
                    <Badge variant='secondary' className='flex items-center gap-1'>
                      {selectedModel === 'deepseek-coder' && <Code className='size-3' />}
                      {selectedModel === 'deepseek-math' && <Zap className='size-3' />}
                      {selectedModel === 'deepseek-chat' && <Brain className='size-3' />}
                      {deepseekModels.find((m) => m.id === selectedModel)?.name}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='flex-1 flex flex-col min-h-0'>
                {/* Messages */}
                <div className='flex-1 overflow-y-auto space-y-4 mb-4'>
                  {messages.length === 0 ? (
                    <div className='text-center py-12'>
                      <Brain className='size-16 text-muted-foreground mx-auto mb-4' />
                      <h3 className='text-lg font-semibold mb-2'>Welcome to DeepSeek AI</h3>
                      <p className='text-muted-foreground mb-4'>
                        Choose a model and start chatting with specialized AI capabilities
                      </p>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md mx-auto'>
                        {getCurrentExamples()
                          .slice(0, 4)
                          .map((example, index) => (
                            <Button
                              key={index}
                              variant='outline'
                              size='sm'
                              onClick={() => handleExample(example)}
                              className='text-xs'>
                              {example.title}
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
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                          {message.role === 'user' ? (
                            <User className='size-4' />
                          ) : (
                            <Brain className='size-4' />
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
                      <div className='shrink-0 size-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center'>
                        <Brain className='size-4' />
                      </div>
                      <div className='flex-1'>
                        <div className='p-3 rounded-lg bg-muted'>
                          <div className='flex items-center space-x-2'>
                            <Loader2 className='size-4 animate-spin' />
                            <span>DeepSeek is processing...</span>
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
                    placeholder='Ask DeepSeek anything...'
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
