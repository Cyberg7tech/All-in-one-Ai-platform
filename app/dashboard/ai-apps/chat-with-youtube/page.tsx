'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
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
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
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
      // Extract ID and fetch transcript from our API
      const res = await fetch(`/api/youtube/transcript?url=${encodeURIComponent(videoUrl)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load transcript');

      const videoId = data.videoId as string;
      const transcript: string = data.transcript as string;

      const infoRes = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(videoUrl)}`);
      const info = (await infoRes.json().catch(() => ({}))) as any;

      const mockVideo: VideoData = {
        id: videoId,
        url: videoUrl,
        title: info?.title || 'YouTube Video',
        duration: '—',
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        description: info?.author_name ? `By ${info.author_name}` : 'Loaded transcript',
        transcript,
        isLoaded: true,
      };

      setCurrentVideo(mockVideo);
      setMessages([]);
      setVideoUrl('');

      toast({ title: 'Video loaded', description: 'Transcript fetched successfully.' });
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
      // Ensure chat session exists and persist user message
      let sid = sessionId;
      if (!sid) {
        const resSession = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'YouTube Chat',
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

      // Build Together chat prompt constrained to transcript
      const system = `You are an assistant that answers strictly and only from the provided YouTube transcript. If the answer is not present in the transcript, say you don't know.`;
      const content = `Transcript (with timestamps):\n${currentVideo.transcript}\n\nQuestion: ${userMessage.content}\nReturn concise answer and reference timestamps present in square brackets when possible.`;
      const chatRes = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content },
          ],
          maxTokens: 800,
          temperature: 0.3,
        }),
      });
      const chat = await chatRes.json();
      if (!chatRes.ok) throw new Error(chat?.error || 'LLM failed');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: String(chat.content || 'No response'),
        timestamp: new Date(),
        videoTimestamp: undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid, role: 'assistant', content: assistantMessage.content }),
      });
    } catch (error) {
      toast({
        title: 'Error sending message',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed mock generators; now using real transcript + LLM

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
