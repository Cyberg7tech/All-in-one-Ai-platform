'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Play,
  Database,
  Zap,
  Globe,
  Brain,
  Mic,
  Image,
  Video,
  Music,
} from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'success' | 'error';
  result?: string;
  error?: string;
  duration?: number;
}

export default function TestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    {
      id: 'database',
      name: 'Database Connection',
      description: 'Test Supabase database connectivity',
      status: 'idle',
    },
    {
      id: 'auth',
      name: 'Authentication',
      description: 'Test user authentication system',
      status: 'idle',
    },
    {
      id: 'api-health',
      name: 'API Health Check',
      description: 'Test core API endpoints',
      status: 'idle',
    },
    {
      id: 'ai-chat',
      name: 'AI Chat Service',
      description: 'Test AI chat functionality',
      status: 'idle',
    },
    {
      id: 'image-generation',
      name: 'Image Generation',
      description: 'Test AI image generation',
      status: 'idle',
    },
    {
      id: 'text-to-speech',
      name: 'Text to Speech',
      description: 'Test TTS functionality',
      status: 'idle',
    },
    {
      id: 'speech-to-text',
      name: 'Speech to Text',
      description: 'Test STT functionality',
      status: 'idle',
    },
    {
      id: 'music-generation',
      name: 'Music Generation',
      description: 'Test AI music generation',
      status: 'idle',
    },
    {
      id: 'video-generation',
      name: 'Video Generation',
      description: 'Test AI video generation',
      status: 'idle',
    },
    {
      id: 'email-system',
      name: 'Email System',
      description: 'Test email sending functionality',
      status: 'idle',
    },
    {
      id: 'payment-stripe',
      name: 'Stripe Payments',
      description: 'Test Stripe payment integration',
      status: 'idle',
    },
    {
      id: 'payment-lemonsqueezy',
      name: 'LemonSqueezy Payments',
      description: 'Test LemonSqueezy payment integration',
      status: 'idle',
    },
  ]);

  const [isRunningAll, setIsRunningAll] = useState(false);
  const [customTestPrompt, setCustomTestPrompt] = useState('');
  const [customTestResult, setCustomTestResult] = useState('');

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className='size-4 animate-spin text-blue-500' />;
      case 'success':
        return <CheckCircle className='size-4 text-green-500' />;
      case 'error':
        return <XCircle className='size-4 text-red-500' />;
      default:
        return <AlertCircle className='size-4 text-gray-400' />;
    }
  };

  const getTestIcon = (testId: string) => {
    switch (testId) {
      case 'database':
        return <Database className='size-5' />;
      case 'auth':
        return <CheckCircle className='size-5' />;
      case 'api-health':
        return <Zap className='size-5' />;
      case 'ai-chat':
        return <Brain className='size-5' />;
      case 'image-generation':
        return <Image className='size-5' />;
      case 'text-to-speech':
      case 'speech-to-text':
        return <Mic className='size-5' />;
      case 'music-generation':
        return <Music className='size-5' />;
      case 'video-generation':
        return <Video className='size-5' />;
      case 'email-system':
        return <Globe className='size-5' />;
      default:
        return <Zap className='size-5' />;
    }
  };

  const runSingleTest = async (testId: string) => {
    setTests((prev) =>
      prev.map((test) =>
        test.id === testId
          ? { ...test, status: 'running' as const, result: undefined, error: undefined }
          : test
      )
    );

    const startTime = Date.now();

    try {
      let endpoint = '';
      let testData = {};

      switch (testId) {
        case 'database':
        case 'auth':
          endpoint = '/api/auth/check';
          break;
        case 'api-health':
          endpoint = '/api/health';
          break;
        case 'ai-chat':
          endpoint = '/api/ai/chat';
          testData = {
            message: 'Hello, this is a test message',
            model: 'gpt-3.5-turbo',
            stream: false,
          };
          break;
        case 'image-generation':
          endpoint = '/api/ai/generate-image';
          testData = {
            prompt: 'A simple test image of a blue sky',
            model: 'dall-e-3',
            size: '1024x1024',
          };
          break;
        case 'text-to-speech':
          endpoint = '/api/ai/text-to-speech';
          testData = {
            text: 'This is a test of the text to speech system',
            voice: 'alloy',
          };
          break;
        case 'speech-to-text':
          endpoint = '/api/ai/speech-to-text';
          // This would need audio data
          break;
        case 'music-generation':
          endpoint = '/api/ai/generate-music';
          testData = {
            prompt: 'A simple happy melody',
            duration: 30,
          };
          break;
        case 'video-generation':
          endpoint = '/api/ai/generate-video';
          testData = {
            prompt: 'A simple test video of nature',
            duration: 5,
          };
          break;
        case 'email-system':
          endpoint = '/api/emails/send';
          testData = {
            to: 'test@example.com',
            subject: 'Test Email',
            text: 'This is a test email',
          };
          break;
        case 'payment-stripe':
          endpoint = '/api/payments/stripe';
          testData = {
            priceId: 'test_price_id',
            mode: 'test',
          };
          break;
        case 'payment-lemonsqueezy':
          endpoint = '/api/payments/lemonsqueezy';
          testData = {
            variantId: 'test_variant_id',
            mode: 'test',
          };
          break;
        default:
          throw new Error(`Unknown test: ${testId}`);
      }

      const method = ['database', 'auth', 'api-health'].includes(testId) ? 'GET' : 'POST';
      const response = await fetch(endpoint, {
        method,
        headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {},
        body: method === 'POST' ? JSON.stringify(testData) : undefined,
      });

      const duration = Date.now() - startTime;

      if (response.ok) {
        const result = await response.text();
        setTests((prev) =>
          prev.map((test) =>
            test.id === testId
              ? {
                  ...test,
                  status: 'success' as const,
                  result: `Success (${duration}ms)`,
                  duration,
                }
              : test
          )
        );
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      setTests((prev) =>
        prev.map((test) =>
          test.id === testId
            ? {
                ...test,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration,
              }
            : test
        )
      );
    }
  };

  const runAllTests = async () => {
    setIsRunningAll(true);

    // Reset all tests
    setTests((prev) =>
      prev.map((test) => ({
        ...test,
        status: 'idle' as const,
        result: undefined,
        error: undefined,
      }))
    );

    // Run tests sequentially to avoid overwhelming the server
    for (const test of tests) {
      await runSingleTest(test.id);
      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsRunningAll(false);
  };

  const runCustomTest = async () => {
    if (!customTestPrompt.trim()) return;

    setCustomTestResult('Running custom test...');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: customTestPrompt,
          model: 'gpt-3.5-turbo',
          stream: false,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCustomTestResult(result.message || 'Test completed successfully');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setCustomTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getOverallStatus = () => {
    const completed = tests.filter((test) => test.status === 'success' || test.status === 'error');
    const successful = tests.filter((test) => test.status === 'success');
    const failed = tests.filter((test) => test.status === 'error');

    return {
      total: tests.length,
      completed: completed.length,
      successful: successful.length,
      failed: failed.length,
      pending: tests.length - completed.length,
    };
  };

  const stats = getOverallStatus();

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <div className='text-center mb-8'>
            <h1 className='text-4xl font-bold mb-4'>Platform Testing</h1>
            <p className='text-muted-foreground text-lg'>
              Test all AI platform features and integrations to ensure everything is working properly.
            </p>
          </div>

          {/* Stats Overview */}
          <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-8'>
            <Card>
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold'>{stats.total}</div>
                <div className='text-sm text-muted-foreground'>Total Tests</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold text-green-500'>{stats.successful}</div>
                <div className='text-sm text-muted-foreground'>Passed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold text-red-500'>{stats.failed}</div>
                <div className='text-sm text-muted-foreground'>Failed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold text-blue-500'>{stats.pending}</div>
                <div className='text-sm text-muted-foreground'>Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4 text-center'>
                <Button onClick={runAllTests} disabled={isRunningAll} className='w-full'>
                  {isRunningAll ? (
                    <>
                      <Loader2 className='size-4 mr-2 animate-spin' />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className='size-4 mr-2' />
                      Run All
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Test Results */}
            <div className='lg:col-span-2'>
              <Card>
                <CardHeader>
                  <CardTitle>System Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {tests.map((test) => (
                      <div key={test.id} className='flex items-center justify-between p-4 border rounded-lg'>
                        <div className='flex items-center space-x-3'>
                          {getTestIcon(test.id)}
                          <div>
                            <h4 className='font-medium'>{test.name}</h4>
                            <p className='text-sm text-muted-foreground'>{test.description}</p>
                            {test.result && <p className='text-sm text-green-600'>{test.result}</p>}
                            {test.error && <p className='text-sm text-red-600'>{test.error}</p>}
                          </div>
                        </div>
                        <div className='flex items-center space-x-3'>
                          {getStatusIcon(test.status)}
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => runSingleTest(test.id)}
                            disabled={test.status === 'running'}>
                            {test.status === 'running' ? 'Running...' : 'Test'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Custom Test */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Custom AI Test</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <label className='text-sm font-medium'>Test Prompt</label>
                    <Textarea
                      placeholder='Enter a custom prompt to test AI functionality...'
                      value={customTestPrompt}
                      onChange={(e) => setCustomTestPrompt(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button onClick={runCustomTest} className='w-full' disabled={!customTestPrompt.trim()}>
                    Run Custom Test
                  </Button>
                  {customTestResult && (
                    <div className='p-3 bg-muted rounded-lg'>
                      <h4 className='font-medium mb-2'>Result:</h4>
                      <p className='text-sm'>{customTestResult}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Test Information */}
              <Card className='mt-6'>
                <CardHeader>
                  <CardTitle>Test Information</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <h4 className='font-medium mb-2'>What's being tested:</h4>
                    <ul className='text-sm text-muted-foreground space-y-1'>
                      <li>• Database connectivity</li>
                      <li>• Authentication system</li>
                      <li>• API endpoints</li>
                      <li>• AI service integrations</li>
                      <li>• Payment systems</li>
                      <li>• Email functionality</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className='font-medium mb-2'>Test Environment:</h4>
                    <Badge variant='outline'>Development</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
