'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Youtube,
  Send,
  Bot,
  User,
  Trash2,
  Copy,
  Link,
  Loader2,
  MessageSquare,
  PlayCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  videoTimestamp?: string;
}

interface VideoData {
  id: string;
  url: string;
  title: string;
  duration: string;
  thumbnail: string;
  description: string;
  transcript?: string;
  isLoaded: boolean;
}

export default function ChatWithYouTubePage() {
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const loadVideo = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: 'Please enter a YouTube URL',
        description: 'You need to provide a valid YouTube video URL.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingVideo(true);

    try {
      // Simulate video loading and transcript extraction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Extract video ID from URL (simplified)
      const videoId = videoUrl.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ';

      const mockVideo: VideoData = {
        id: videoId,
        url: videoUrl,
        title: 'How to Build Amazing AI Applications - Complete Tutorial',
        duration: '15:42',
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        description:
          'In this comprehensive tutorial, we explore how to build cutting-edge AI applications from scratch. Learn about the latest technologies, frameworks, and best practices.',
        transcript: `Welcome to this comprehensive tutorial on building AI applications. Today we'll cover everything from the basics to advanced concepts.

First, let's understand what AI applications are and why they're becoming so important in today's technology landscape. Artificial Intelligence has revolutionized how we approach problem-solving in software development.

We'll start with the fundamental concepts. Machine learning, deep learning, and natural language processing are the core pillars of modern AI applications. Each of these areas offers unique capabilities and use cases.

Next, we'll dive into practical implementation. We'll use Python and popular libraries like TensorFlow, PyTorch, and OpenAI's APIs to build real-world applications.

The key to successful AI applications is understanding your data. Data preprocessing, feature engineering, and model selection are crucial steps that determine the success of your project.

We'll also cover deployment strategies, scaling considerations, and best practices for maintaining AI applications in production environments.

Finally, we'll look at emerging trends and future possibilities in AI development. The field is rapidly evolving, and staying updated is essential for any AI developer.`,
        isLoaded: true,
      };

      setCurrentVideo(mockVideo);
      setMessages([]);
      setVideoUrl('');

      toast({
        title: 'Video loaded successfully!',
        description: 'You can now ask questions about the video content.',
      });
    } catch (error) {
      toast({
        title: 'Error loading video',
        description: 'Please check the URL and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !currentVideo) return;

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
      // Simulate AI response based on video content
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateResponseBasedOnVideo(userMessage.content, currentVideo),
        timestamp: new Date(),
        videoTimestamp: generateRandomTimestamp(),
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

  const generateResponseBasedOnVideo = (question: string, video: VideoData) => {
    const responses = [
      `Based on the video "${video.title}", here's what I found about your question: ${question}. 

The video explains that this concept is fundamental to understanding AI applications. According to the tutorial, the key points include practical implementation strategies and real-world examples.

The presenter demonstrates this at around 3:45 in the video, showing step-by-step implementation details.`,

      `Great question about "${question}"! In this video, the instructor covers this topic extensively. 

The video mentions that this is a common challenge when building AI applications. The solution involves understanding the underlying principles and applying best practices as shown in the demonstration.

You can find more details about this at timestamp 7:23 where they provide a detailed walkthrough.`,

      `According to the content in "${video.title}", your question about "${question}" is addressed in the section about advanced concepts.

The video explains that this approach is widely used in modern AI development. The key is to follow the framework outlined in the tutorial and adapt it to your specific use case.

This is particularly well explained around the 10:15 mark in the video.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateRandomTimestamp = () => {
    const minutes = Math.floor(Math.random() * 15);
    const seconds = Math.floor(Math.random() * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
          <div className='flex items-center space-x-3'>
            <div className='p-2 bg-red-100 rounded-lg'>
              <Youtube className='size-6 text-red-600' />
            </div>
            <div>
              <h1 className='text-3xl font-bold'>Chat with YouTube</h1>
              <p className='text-muted-foreground'>Chat with YouTube video content using AI</p>
            </div>
          </div>
        </div>

        {/* Video URL Input */}
        {!currentVideo && (
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Link className='size-5' />
                Load YouTube Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex space-x-2'>
                <Input
                  placeholder='Enter YouTube video URL...'
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      loadVideo();
                    }
                  }}
                  className='flex-1'
                />
                <Button onClick={loadVideo} disabled={isLoadingVideo}>
                  {isLoadingVideo ? (
                    <Loader2 className='size-4 animate-spin' />
                  ) : (
                    <>
                      <PlayCircle className='size-4 mr-2' />
                      Load Video
                    </>
                  )}
                </Button>
              </div>
              <p className='text-sm text-muted-foreground mt-2'>
                Paste a YouTube video URL to start chatting with its content
              </p>
            </CardContent>
          </Card>
        )}

        {/* Current Video Info */}
        {currentVideo && (
          <Card className='mb-6'>
            <CardContent className='p-4'>
              <div className='flex items-center space-x-4'>
                <img
                  src={currentVideo.thumbnail}
                  alt={currentVideo.title}
                  className='w-24 h-16 object-cover rounded'
                />
                <div className='flex-1'>
                  <h3 className='font-semibold line-clamp-1'>{currentVideo.title}</h3>
                  <p className='text-sm text-muted-foreground line-clamp-2'>{currentVideo.description}</p>
                  <div className='flex items-center space-x-4 mt-2'>
                    <Badge variant='outline' className='flex items-center gap-1'>
                      <Clock className='size-3' />
                      {currentVideo.duration}
                    </Badge>
                    <Badge variant='secondary'>Ready to chat</Badge>
                  </div>
                </div>
                <div className='flex space-x-2'>
                  <Button variant='outline' size='sm' onClick={() => window.open(currentVideo.url, '_blank')}>
                    <Eye className='size-4 mr-2' />
                    Watch
                  </Button>
                  <Button variant='outline' size='sm' onClick={() => setCurrentVideo(null)}>
                    <Trash2 className='size-4 mr-2' />
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Interface */}
        {currentVideo && (
          <Card className='flex-1 flex flex-col min-h-0'>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2'>
                  <MessageSquare className='size-5' />
                  Chat with Video
                </CardTitle>
                {messages.length > 0 && (
                  <Button variant='outline' size='sm' onClick={clearChat}>
                    <Trash2 className='size-4 mr-2' />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className='flex-1 flex flex-col min-h-0'>
              {/* Messages */}
              <div className='flex-1 overflow-y-auto space-y-4 mb-4'>
                {messages.length === 0 ? (
                  <div className='text-center py-8'>
                    <MessageSquare className='size-16 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-semibold mb-2'>Start asking questions</h3>
                    <p className='text-muted-foreground mb-4'>
                      Ask anything about the video content and I'll help you find the answers
                    </p>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md mx-auto'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setInput('What is this video about?')}>
                        What is this about?
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setInput('What are the key points covered?')}>
                        Key points?
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setInput('Can you summarize the main concepts?')}>
                        Summarize
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setInput('What tools are mentioned?')}>
                        Tools mentioned?
                      </Button>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                      <div
                        className={`shrink-0 size-8 rounded-full flex items-center justify-center ${
                          message.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
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
                          {message.videoTimestamp && (
                            <Badge variant='outline' className='text-xs'>
                              {message.videoTimestamp}
                            </Badge>
                          )}
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
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className='flex items-start space-x-3'>
                    <div className='shrink-0 size-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center'>
                      <Bot className='size-4' />
                    </div>
                    <div className='flex-1'>
                      <div className='p-3 rounded-lg bg-muted'>
                        <div className='flex items-center space-x-2'>
                          <Loader2 className='size-4 animate-spin' />
                          <span>Analyzing video content...</span>
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
                  placeholder='Ask about the video content...'
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
        )}

        {/* No Video State */}
        {!currentVideo && (
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <Youtube className='size-24 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-xl font-semibold mb-2'>No video loaded</h3>
              <p className='text-muted-foreground'>Load a YouTube video to start chatting with its content</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
