'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bot,
  FileText,
  MessageSquare,
  Mic,
  Image,
  Video,
  Music,
  QrCode,
  Home,
  Palette,
  Youtube,
  Zap,
  Sparkles,
  TrendingUp,
  Brain,
  Wand2,
} from 'lucide-react';

const aiApps = [
  {
    id: 'content-writer',
    name: 'Content Writer',
    description: 'Generate high-quality content for blogs, articles, and marketing materials',
    icon: FileText,
    href: '/dashboard/ai-apps/content-writer',
    color: 'text-blue-500',
    status: 'stable',
    category: 'writing',
  },
  {
    id: 'multillm-chatgpt',
    name: 'MultiLLM ChatGPT',
    description: 'Chat with multiple AI models including GPT-4, Claude, and more',
    icon: MessageSquare,
    href: '/dashboard/ai-apps/multillm-chatgpt',
    color: 'text-green-500',
    status: 'stable',
    category: 'chat',
  },
  {
    id: 'chat-with-pdf',
    name: 'Chat with PDF',
    description: 'Upload PDFs and chat with their content using AI',
    icon: FileText,
    href: '/dashboard/ai-apps/chat-with-pdf',
    color: 'text-purple-500',
    status: 'stable',
    category: 'document',
  },
  {
    id: 'voice-transcription',
    name: 'Voice Transcription',
    description: 'Convert audio files to text with high accuracy',
    icon: Mic,
    href: '/dashboard/ai-apps/voice-transcription',
    color: 'text-orange-500',
    status: 'stable',
    category: 'audio',
  },
  {
    id: 'headshot-generator',
    name: 'Headshot Generator',
    description: 'Create professional headshots from your photos',
    icon: Image,
    href: '/dashboard/ai-apps/headshot-generator',
    color: 'text-pink-500',
    status: 'stable',
    category: 'image',
  },
  {
    id: 'image-generator',
    name: 'Image Generator',
    description: 'Generate stunning images from text descriptions',
    icon: Image,
    href: '/dashboard/ai-apps/image-generator',
    color: 'text-indigo-500',
    status: 'stable',
    category: 'image',
  },
  {
    id: 'qr-generator',
    name: 'QR Generator',
    description: 'Create QR codes for websites, contact info, and more',
    icon: QrCode,
    href: '/dashboard/ai-apps/qr-generator',
    color: 'text-gray-500',
    status: 'stable',
    category: 'utility',
  },
  {
    id: 'interior-design',
    name: 'Interior Design',
    description: 'Get AI-powered interior design suggestions and visualizations',
    icon: Home,
    href: '/dashboard/ai-apps/interior-design',
    color: 'text-yellow-500',
    status: 'stable',
    category: 'design',
  },
  {
    id: 'youtube-content',
    name: 'YouTube Content Generator',
    description: 'Generate video scripts, titles, and descriptions',
    icon: Youtube,
    href: '/dashboard/ai-apps/youtube-content',
    color: 'text-red-500',
    status: 'stable',
    category: 'video',
  },
  {
    id: 'image-upscaler',
    name: 'Image Upscaler & Enhancer',
    description: 'Enhance and upscale images with AI',
    icon: Zap,
    href: '/dashboard/ai-apps/image-upscaler',
    color: 'text-cyan-500',
    status: 'stable',
    category: 'image',
  },
  {
    id: 'chat-with-youtube',
    name: 'Chat with YouTube',
    description: 'Chat with YouTube video content using AI',
    icon: Youtube,
    href: '/dashboard/ai-apps/chat-with-youtube',
    color: 'text-red-600',
    status: 'stable',
    category: 'video',
  },
  {
    id: 'text-to-speech',
    name: 'Text to Speech',
    description: 'Convert text to natural-sounding speech',
    icon: Mic,
    href: '/dashboard/ai-apps/text-to-speech',
    color: 'text-emerald-500',
    status: 'stable',
    category: 'audio',
  },
  {
    id: 'llamagpt',
    name: 'Llama 3.1 ChatGPT',
    description: "Chat with Meta's Llama 3.1 model",
    icon: Bot,
    href: '/dashboard/ai-apps/llamagpt',
    color: 'text-orange-600',
    status: 'stable',
    category: 'chat',
  },
  {
    id: 'music-generator',
    name: 'Music Generator',
    description: 'Create original music compositions with AI',
    icon: Music,
    href: '/dashboard/ai-apps/music-generator',
    color: 'text-purple-600',
    status: 'stable',
    category: 'audio',
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat App',
    description: 'Chat with DeepSeek AI models',
    icon: Brain,
    href: '/dashboard/ai-apps/deepseek-chat',
    color: 'text-blue-600',
    status: 'stable',
    category: 'chat',
  },
  {
    id: 'gemini-chat',
    name: 'Gemini Chat App',
    description: "Chat with Google's Gemini AI model",
    icon: Sparkles,
    href: '/dashboard/ai-apps/gemini-chat',
    color: 'text-yellow-600',
    status: 'stable',
    category: 'chat',
  },
  {
    id: 'ghibli-generator',
    name: 'Ghibli Image Generator',
    description: 'Generate images in Studio Ghibli style',
    icon: Palette,
    href: '/dashboard/ai-apps/ghibli-generator',
    color: 'text-green-600',
    status: 'stable',
    category: 'image',
  },
  {
    id: 'quiz-generator',
    name: 'Quiz & Flashcard Generator',
    description: 'Create quizzes and flashcards from any content',
    icon: TrendingUp,
    href: '/dashboard/ai-apps/quiz-generator',
    color: 'text-teal-500',
    status: 'stable',
    category: 'education',
  },
];

const categories = [
  { id: 'all', name: 'All Apps', icon: Wand2 },
  { id: 'chat', name: 'Chat & Conversation', icon: MessageSquare },
  { id: 'image', name: 'Image Generation', icon: Image },
  { id: 'audio', name: 'Audio & Voice', icon: Mic },
  { id: 'video', name: 'Video & YouTube', icon: Video },
  { id: 'writing', name: 'Content Writing', icon: FileText },
  { id: 'design', name: 'Design & Creative', icon: Palette },
  { id: 'utility', name: 'Utilities', icon: Zap },
  { id: 'education', name: 'Education', icon: TrendingUp },
];

export default function AIAppsPage() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>AI Apps</h1>
          <p className='text-muted-foreground'>
            BuilderKit contains many features. You can use them all or few of them as per your requirements.
          </p>
        </div>

        {/* Categories */}
        <div className='mb-8'>
          <div className='flex flex-wrap gap-2'>
            {categories.map((category) => (
              <Button key={category.id} variant='outline' size='sm' className='flex items-center gap-2'>
                <category.icon className='size-4' />
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* AI Apps Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {aiApps.map((app) => (
            <Card key={app.id} className='hover:shadow-lg transition-shadow cursor-pointer group'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div
                      className={`p-2 rounded-lg bg-background ${app.color} group-hover:scale-110 transition-transform`}>
                      <app.icon className='size-5' />
                    </div>
                    <div>
                      <CardTitle className='text-lg'>{app.name}</CardTitle>
                      <Badge variant='secondary' className='text-xs'>
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className='mb-4'>{app.description}</CardDescription>
                <Button size='sm' variant='outline' className='w-full' asChild>
                  <Link href={app.href}>Open App</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
