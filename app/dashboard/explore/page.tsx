'use client';
export const revalidate = 0;
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import React from 'react';
import Link from 'next/link';
import {
  Search,
  Star,
  Zap,
  Image,
  Music,
  Video,
  FileText,
  Code,
  BarChart3,
  MessageSquare,
  Mic,
  Palette,
  Globe,
  Mail,
  Sparkles,
  TrendingUp,
  Bot,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';

interface AITool {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  featured: boolean;
  premium: boolean;
  rating: number;
  usageCount: string;
  tags: string[];
  comingSoon?: boolean;
}

const AI_TOOLS: AITool[] = [
  // Core Chat & Agents
  {
    id: 'multi-chat',
    name: 'Multi-Model Chat',
    description: 'Chat with multiple AI models (GPT-4, Claude, Llama) in one interface',
    href: '/dashboard/ai-apps/multillm-chatgpt',
    icon: MessageSquare,
    category: 'Text & Content',
    featured: true,
    premium: false,
    rating: 4.9,
    usageCount: '2.1M',
    tags: ['chat', 'gpt-4', 'claude', 'conversation'],
  },
  {
    id: 'ai-agents',
    name: 'AI Agents',
    description: 'Create and manage custom AI agents with specialized tools and capabilities',
    href: '/dashboard/ai-apps',
    icon: Bot,
    category: 'Text & Content',
    featured: true,
    premium: false,
    rating: 4.8,
    usageCount: '890K',
    tags: ['agents', 'automation', 'custom', 'tools'],
  },

  // Creative Tools
  {
    id: 'image-generator',
    name: 'AI Image Generator',
    description: 'Generate stunning images with DALL-E 3, Stable Diffusion, and Midjourney',
    href: '/dashboard/ai-apps/image-generator',
    icon: Image,
    category: 'Creative',
    featured: true,
    premium: false,
    rating: 4.7,
    usageCount: '1.5M',
    tags: ['dalle', 'stable-diffusion', 'art', 'design'],
  },
  {
    id: 'video-generator',
    name: 'AI Video Generator',
    description: 'Create videos from text prompts using Runway and other AI models',
    href: '/dashboard/ai-apps/youtube-content',
    icon: Video,
    category: 'Creative',
    featured: false,
    premium: true,
    rating: 4.6,
    usageCount: '234K',
    tags: ['runway', 'video', 'animation', 'content'],
    comingSoon: true,
  },
  {
    id: 'music-generator',
    name: 'AI Music Generator',
    description: 'Compose music and audio using Suno AI and other music generation models',
    href: '/dashboard/ai-apps/music-generator',
    icon: Music,
    category: 'Audio & Voice',
    featured: false,
    premium: true,
    rating: 4.5,
    usageCount: '123K',
    tags: ['suno', 'music', 'audio', 'composition'],
    comingSoon: true,
  },

  // Business Intelligence & Analytics
  {
    id: 'forecasting',
    name: 'Forecasting & Anomaly Detection',
    description: 'Predict trends and detect anomalies in your time series data with AI',
    href: '/dashboard/forecasting',
    icon: TrendingUp,
    category: 'Business Intelligence',
    featured: true,
    premium: false,
    rating: 4.8,
    usageCount: '456K',
    tags: ['forecasting', 'anomaly', 'analytics', 'predictions'],
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Comprehensive analytics and insights for your AI usage and performance',
    href: '/dashboard/analytics',
    icon: BarChart3,
    category: 'Business Intelligence',
    featured: false,
    premium: false,
    rating: 4.6,
    usageCount: '1.2M',
    tags: ['analytics', 'metrics', 'dashboard', 'insights'],
  },

  // Document Processing
  {
    id: 'document-processing',
    name: 'Document Processing',
    description: 'Upload and analyze documents with AI-powered text extraction and insights',
    href: '/dashboard/ai-apps/chat-with-pdf',
    icon: FileText,
    category: 'Text & Content',
    featured: true,
    premium: false,
    rating: 4.9,
    usageCount: '678K',
    tags: ['documents', 'ocr', 'analysis', 'extraction'],
  },

  // Automation & Workflows
  {
    id: 'workflows',
    name: 'Workflow Automation',
    description: 'Create automated workflows to streamline your AI-powered processes',
    href: '/dashboard/ai-apps',
    icon: Zap,
    category: 'Development',
    featured: true,
    premium: false,
    rating: 4.7,
    usageCount: '345K',
    tags: ['automation', 'workflows', 'triggers', 'integration'],
  },

  // Development Tools
  {
    id: 'model-playground',
    name: 'AI Model Playground',
    description: 'Test and compare different AI models side by side with detailed metrics',
    href: '/dashboard/ai-apps/multillm-chatgpt',
    icon: Brain,
    category: 'Development',
    featured: true,
    premium: false,
    rating: 4.8,
    usageCount: '567K',
    tags: ['testing', 'comparison', 'models', 'benchmarks'],
  },
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    description: 'Advanced code generation, review, and debugging with multiple AI models',
    href: '/dashboard/ai-apps/multillm-chatgpt',
    icon: Code,
    category: 'Development',
    featured: false,
    premium: false,
    rating: 4.6,
    usageCount: '1.8M',
    tags: ['code', 'programming', 'debug', 'review'],
    comingSoon: true,
  },

  // Communication & Design
  {
    id: 'voice-assistant',
    name: 'Voice Assistant',
    description: 'Voice-to-text and text-to-voice conversion with natural AI voices',
    href: '/dashboard/ai-apps/text-to-speech',
    icon: Mic,
    category: 'Audio & Voice',
    featured: false,
    premium: true,
    rating: 4.4,
    usageCount: '234K',
    tags: ['voice', 'speech', 'audio', 'transcription'],
    comingSoon: true,
  },
  {
    id: 'design-assistant',
    name: 'Design Assistant',
    description: 'AI-powered design suggestions, color palettes, and layout optimization',
    href: '/dashboard/ai-apps/interior-design',
    icon: Palette,
    category: 'Design',
    featured: false,
    premium: false,
    rating: 4.5,
    usageCount: '456K',
    tags: ['design', 'ui', 'colors', 'layout'],
    comingSoon: true,
  },
  {
    id: 'email-assistant',
    name: 'Email Assistant',
    description: 'Smart email composition, scheduling, and automated responses',
    href: '/dashboard/emails',
    icon: Mail,
    category: 'Communication',
    featured: false,
    premium: false,
    rating: 4.3,
    usageCount: '789K',
    tags: ['email', 'communication', 'automation', 'scheduling'],
    comingSoon: true,
  },

  // Advanced Features
  {
    id: 'web-scraper',
    name: 'AI Web Scraper',
    description: 'Extract and analyze data from websites with intelligent content parsing',
    href: '/dashboard/ai-apps/chat-with-youtube',
    icon: Globe,
    category: 'Business Intelligence',
    featured: false,
    premium: true,
    rating: 4.4,
    usageCount: '123K',
    tags: ['scraping', 'data', 'web', 'extraction'],
    comingSoon: true,
  },
];

const CATEGORIES = [
  'All',
  'Text & Content',
  'Creative',
  'Audio & Voice',
  'Business Intelligence',
  'Development',
  'Design',
  'Communication',
];

const CATEGORY_ICONS = {
  'Text & Content': FileText,
  Creative: Palette,
  'Audio & Voice': Mic,
  'Business Intelligence': BarChart3,
  Development: Code,
  Design: Sparkles,
  Communication: Mail,
};

export default function ExplorePage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  const filteredTools = AI_TOOLS.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const matchesFeatured = !showFeaturedOnly || tool.featured;
    const matchesPremium = !showPremiumOnly || tool.premium;

    return matchesSearch && matchesCategory && matchesFeatured && matchesPremium;
  });

  const featuredTools = AI_TOOLS.filter((tool) => tool.featured).slice(0, 6);

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Explore AI Tools</h1>
        <p className='text-muted-foreground'>
          Discover powerful AI tools to enhance your productivity and creativity
        </p>
      </div>

      {/* Featured Tools */}
      <div className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4 flex items-center'>
          <Star className='size-6 mr-2 text-yellow-500' />
          Featured Tools
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {featuredTools.map((tool) => (
            <Card
              key={tool.id}
              className='group hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer relative'>
              <Link href={tool.comingSoon ? '#' : tool.href}>
                <div className='absolute top-3 right-3 z-10'>
                  <Badge className='bg-yellow-500 text-yellow-50'>
                    <Star className='size-3 mr-1' />
                    Featured
                  </Badge>
                </div>

                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div className='p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors'>
                        <tool.icon className='size-6 text-primary' />
                      </div>
                      <div className='flex-1'>
                        <CardTitle className='text-base leading-tight'>{tool.name}</CardTitle>
                        {tool.comingSoon && (
                          <Badge variant='outline' className='mt-1 text-xs'>
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='pt-0'>
                  <CardDescription className='mb-4 line-clamp-2'>{tool.description}</CardDescription>

                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center space-x-2'>
                      <div className='flex items-center'>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3 ${i < Math.floor(tool.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className='text-sm text-muted-foreground ml-1'>{tool.rating}</span>
                      </div>
                    </div>
                    <div className='text-sm text-muted-foreground'>{tool.usageCount} uses</div>
                  </div>

                  <div className='flex flex-wrap gap-1'>
                    {tool.tags.slice(0, 3).map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant='secondary' className='text-xs'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className='mb-6 space-y-4'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
            <input
              type='text'
              placeholder='Search AI tools...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
            />
          </div>

          <div className='flex gap-2'>
            <Button
              variant={showFeaturedOnly ? 'default' : 'outline'}
              size='sm'
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}>
              <Star className='size-4 mr-2' />
              Featured
            </Button>
            <Button
              variant={showPremiumOnly ? 'default' : 'outline'}
              size='sm'
              onClick={() => setShowPremiumOnly(!showPremiumOnly)}>
              <Sparkles className='size-4 mr-2' />
              Premium
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className='flex flex-wrap gap-2'>
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedCategory(category)}
              className='flex items-center'>
              {category !== 'All' &&
                CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] &&
                React.createElement(CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS], {
                  className: 'size-4 mr-2',
                })}
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {filteredTools.map((tool) => (
          <Card
            key={tool.id}
            className='group hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer relative'>
            <Link href={tool.comingSoon ? '#' : tool.href}>
              {tool.featured && (
                <div className='absolute top-2 right-2 z-10'>
                  <Badge className='bg-yellow-500 text-yellow-50'>
                    <Star className='size-3 mr-1' />
                    Featured
                  </Badge>
                </div>
              )}

              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div className='p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors'>
                      <tool.icon className='size-5 text-primary' />
                    </div>
                    <div className='flex-1'>
                      <CardTitle className='text-base leading-tight'>{tool.name}</CardTitle>
                      {tool.premium && (
                        <Badge variant='outline' className='mt-1 text-xs'>
                          Premium
                        </Badge>
                      )}
                      {tool.comingSoon && (
                        <Badge variant='outline' className='mt-1 text-xs'>
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='pt-0'>
                <CardDescription className='mb-4 line-clamp-2'>{tool.description}</CardDescription>

                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center space-x-2'>
                    <div className='flex items-center'>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3 ${i < Math.floor(tool.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className='text-sm text-muted-foreground ml-1'>{tool.rating}</span>
                    </div>
                  </div>
                  <div className='text-sm text-muted-foreground'>{tool.usageCount} uses</div>
                </div>

                <div className='flex flex-wrap gap-1'>
                  {tool.tags.slice(0, 3).map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant='secondary' className='text-xs'>
                      {tag}
                    </Badge>
                  ))}
                  {tool.tags.length > 3 && (
                    <Badge variant='outline' className='text-xs'>
                      +{tool.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredTools.length === 0 && (
        <div className='text-center py-12'>
          <Search className='size-16 text-muted-foreground mx-auto mb-4' />
          <h3 className='text-lg font-semibold mb-2'>No tools found</h3>
          <p className='text-muted-foreground mb-4'>Try adjusting your search criteria or browse all tools</p>
          <Button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setShowFeaturedOnly(false);
              setShowPremiumOnly(false);
            }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className='mt-12 text-center'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto'>
          <div>
            <div className='text-2xl font-bold text-primary'>{AI_TOOLS.length}</div>
            <div className='text-sm text-muted-foreground'>AI Tools</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-primary'>{featuredTools.length}</div>
            <div className='text-sm text-muted-foreground'>Featured</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-primary'>{CATEGORIES.length - 1}</div>
            <div className='text-sm text-muted-foreground'>Categories</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-primary'>{user?.name || 'Guest'}</div>
            <div className='text-sm text-muted-foreground'>Welcome!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
