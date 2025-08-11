'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Wand2,
  FileText,
  Hash,
  MessageSquare,
  Lightbulb,
  Download,
  Copy,
  Trash2,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface YouTubeContent {
  id: string;
  topic: string;
  contentType: string;
  title: string;
  description: string;
  script?: string;
  tags: string[];
  createdAt: Date;
}

export default function YouTubeContentPage() {
  const [contents, setContents] = useState<YouTubeContent[]>([]);
  const [topic, setTopic] = useState('');
  const [selectedType, setSelectedType] = useState('script');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const contentTypes = [
    { id: 'script', name: 'Video Script', icon: FileText, description: 'Full video script with structure' },
    { id: 'title', name: 'Title Ideas', icon: Hash, description: 'Catchy video titles' },
    {
      id: 'description',
      name: 'Description',
      icon: MessageSquare,
      description: 'Video description with SEO',
    },
    {
      id: 'all',
      name: 'Complete Package',
      icon: RefreshCw,
      description: 'Title, description, script & tags',
    },
  ];

  const topicSuggestions = [
    'How to start a tech startup',
    'Best productivity apps for students',
    'Cooking healthy meals on a budget',
    'Photography tips for beginners',
    'Investing for young professionals',
    'Home workout routines',
    'Learning a new language fast',
    'Sustainable living tips',
  ];

  const generateContent = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Please enter a topic',
        description: 'You need to provide a topic for content generation.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate AI content generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockContent: YouTubeContent = {
        id: Date.now().toString(),
        topic: topic.trim(),
        contentType: selectedType,
        title: generateMockTitle(topic.trim()),
        description: generateMockDescription(topic.trim()),
        script:
          selectedType === 'script' || selectedType === 'all' ? generateMockScript(topic.trim()) : undefined,
        tags: generateMockTags(topic.trim()),
        createdAt: new Date(),
      };

      setContents((prev) => [mockContent, ...prev]);
      setTopic('');

      toast({
        title: 'Content generated successfully!',
        description: 'Your YouTube content is ready for use.',
      });
    } catch (error) {
      toast({
        title: 'Error generating content',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockTitle = (topic: string) => {
    const titles = [
      `The Ultimate Guide to ${topic} (2024)`,
      `5 Proven Tips for ${topic} That Actually Work`,
      `Why ${topic} is Easier Than You Think`,
      `${topic}: From Beginner to Expert in 30 Days`,
      `The Truth About ${topic} Nobody Tells You`,
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const generateMockDescription = (topic: string) => {
    return `In this comprehensive video, we dive deep into ${topic} and share proven strategies that can help you succeed. Whether you're a complete beginner or looking to improve your skills, this guide covers everything you need to know.

🎯 What you'll learn:
• Essential fundamentals of ${topic}
• Common mistakes to avoid
• Step-by-step implementation guide
• Real-world examples and case studies
• Pro tips from industry experts

⏰ Timestamps:
00:00 Introduction
01:30 Getting Started
03:45 Main Content
08:20 Common Mistakes
10:15 Advanced Tips
12:00 Conclusion

🔗 Useful Resources:
• Free guide: [Link]
• Tool recommendations: [Link]
• Community Discord: [Link]

📱 Connect with us:
Instagram: @channel
Twitter: @channel
Website: www.example.com

#${topic.replace(/\s+/g, '')} #Tutorial #Guide #2024

Thanks for watching! Don't forget to like, subscribe, and hit the notification bell for more content like this!`;
  };

  const generateMockScript = (topic: string) => {
    return `# ${topic} - Video Script

## Hook (0-15 seconds)
"What if I told you that ${topic} could be mastered in just 30 days? Most people think it's complicated, but I'm about to show you the exact system that's helped thousands of people succeed."

## Introduction (15-45 seconds)
"Hey everyone, welcome back to the channel! I'm [Your Name], and today we're diving deep into ${topic}. If you're new here, I share practical tips and strategies every week, so make sure to hit that subscribe button and the notification bell."

## Problem Statement (45-90 seconds)
"Now, here's the thing about ${topic} - most people struggle because they don't have a clear roadmap. They try random tactics, get overwhelmed, and eventually give up. Sound familiar? Well, today I'm going to break down exactly what you need to know."

## Main Content (90 seconds - 8 minutes)
### Point 1: Foundation
"First, let's talk about the foundation. Without this, everything else will crumble..."

### Point 2: Implementation
"Next, here's how you actually implement this step by step..."

### Point 3: Common Mistakes
"Now, let me share the top 3 mistakes I see people make..."

### Point 4: Advanced Tips
"Once you've mastered the basics, here are some advanced strategies..."

## Call to Action (8-9 minutes)
"Alright, so that's your complete guide to ${topic}. Which tip are you most excited to try? Let me know in the comments below!"

## Conclusion (9-10 minutes)
"If this video helped you out, make sure to give it a thumbs up, subscribe for more content like this, and I'll see you in the next video. Until then, keep [relevant action], and I'll talk to you soon!"

---
**Total Runtime: ~10 minutes**
**Word Count: ~1,200 words**
**Tone: Conversational, Educational, Engaging**`;
  };

  const generateMockTags = (topic: string) => {
    const baseTags = topic.toLowerCase().split(' ');
    const additionalTags = ['tutorial', 'guide', '2024', 'tips', 'howto', 'beginner', 'learn'];
    return [...baseTags, ...additionalTags].slice(0, 10);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: 'Content has been copied to your clipboard.',
    });
  };

  const downloadContent = (content: YouTubeContent) => {
    const text = `Title: ${content.title}\n\nDescription:\n${content.description}\n\n${content.script ? `Script:\n${content.script}\n\n` : ''}Tags: ${content.tags.join(', ')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-content-${content.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteContent = (contentId: string) => {
    setContents((prev) => prev.filter((c) => c.id !== contentId));
    toast({
      title: 'Content deleted',
      description: 'The content has been removed.',
    });
  };

  const handleSuggestion = (suggestion: string) => {
    setTopic(suggestion);
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-3 mb-4'>
            <div className='p-2 bg-red-100 rounded-lg'>
              <RefreshCw className='size-6 text-red-600' />
            </div>
            <div>
              <h1 className='text-3xl font-bold'>YouTube Content Generator</h1>
              <p className='text-muted-foreground'>Generate video scripts, titles, and descriptions</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Generator Panel */}
          <div className='lg:col-span-1'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Wand2 className='size-5' />
                  Content Generator
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Topic Input */}
                <div className='space-y-3'>
                  <Label htmlFor='topic'>Video Topic</Label>
                  <Textarea
                    id='topic'
                    placeholder='Enter your video topic or idea...'
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Content Type Selection */}
                <div className='space-y-3'>
                  <Label>Content Type</Label>
                  <div className='space-y-2'>
                    {contentTypes.map((type) => (
                      <Button
                        key={type.id}
                        variant={selectedType === type.id ? 'default' : 'outline'}
                        onClick={() => setSelectedType(type.id)}
                        className='w-full justify-start h-auto p-3'>
                        <type.icon className='size-4 mr-3' />
                        <div className='text-left'>
                          <div className='font-medium'>{type.name}</div>
                          <div className='text-xs text-muted-foreground'>{type.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button onClick={generateContent} disabled={isGenerating || !topic.trim()} className='w-full'>
                  {isGenerating ? (
                    <>
                      <Loader2 className='size-4 mr-2 animate-spin' />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className='size-4 mr-2' />
                      Generate Content
                    </>
                  )}
                </Button>

                {/* Topic Suggestions */}
                <div className='space-y-3'>
                  <Label className='flex items-center gap-2'>
                    <Lightbulb className='size-4' />
                    Topic Ideas
                  </Label>
                  <div className='space-y-2'>
                    {topicSuggestions.slice(0, 4).map((suggestion, index) => (
                      <Button
                        key={index}
                        variant='outline'
                        size='sm'
                        onClick={() => handleSuggestion(suggestion)}
                        className='w-full text-left h-auto p-2 text-xs justify-start'>
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Content */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle>Generated Content ({contents.length})</CardTitle>
                  {contents.length > 0 && (
                    <Button variant='outline' size='sm' onClick={() => setContents([])}>
                      <Trash2 className='size-4 mr-2' />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {contents.length === 0 ? (
                  <div className='text-center py-12'>
                    <RefreshCw className='size-16 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-semibold mb-2'>No content generated yet</h3>
                    <p className='text-muted-foreground mb-4'>
                      Enter a topic and select content type to generate YouTube content
                    </p>
                    <div className='grid grid-cols-2 gap-2 max-w-sm mx-auto'>
                      {topicSuggestions.slice(4, 8).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant='outline'
                          size='sm'
                          onClick={() => handleSuggestion(suggestion)}
                          className='text-xs'>
                          {suggestion.split(' ').slice(0, 4).join(' ')}...
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className='space-y-6'>
                    {contents.map((content) => (
                      <div key={content.id} className='border rounded-lg p-6'>
                        {/* Content Header */}
                        <div className='flex items-center justify-between mb-4'>
                          <div className='flex items-center space-x-2'>
                            <Badge variant='secondary'>
                              {contentTypes.find((t) => t.id === content.contentType)?.name}
                            </Badge>
                            <Badge variant='outline'>{content.topic}</Badge>
                          </div>
                          <div className='flex space-x-2'>
                            <Button variant='outline' size='sm' onClick={() => downloadContent(content)}>
                              <Download className='size-4 mr-2' />
                              Download
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => deleteContent(content.id)}
                              className='text-red-500 hover:text-red-700'>
                              <Trash2 className='size-4' />
                            </Button>
                          </div>
                        </div>

                        {/* Title */}
                        <div className='space-y-3 mb-4'>
                          <div className='flex items-center justify-between'>
                            <h4 className='font-semibold text-sm'>Title</h4>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => copyToClipboard(content.title)}
                              className='size-6 p-0'>
                              <Copy className='size-3' />
                            </Button>
                          </div>
                          <div className='p-3 bg-muted rounded-lg'>
                            <p className='text-sm font-medium'>{content.title}</p>
                          </div>
                        </div>

                        {/* Description */}
                        <div className='space-y-3 mb-4'>
                          <div className='flex items-center justify-between'>
                            <h4 className='font-semibold text-sm'>Description</h4>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => copyToClipboard(content.description)}
                              className='size-6 p-0'>
                              <Copy className='size-3' />
                            </Button>
                          </div>
                          <div className='p-3 bg-muted rounded-lg max-h-40 overflow-y-auto'>
                            <p className='text-sm whitespace-pre-wrap'>{content.description}</p>
                          </div>
                        </div>

                        {/* Script */}
                        {content.script && (
                          <div className='space-y-3 mb-4'>
                            <div className='flex items-center justify-between'>
                              <h4 className='font-semibold text-sm'>Script</h4>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => copyToClipboard(content.script!)}
                                className='size-6 p-0'>
                                <Copy className='size-3' />
                              </Button>
                            </div>
                            <div className='p-3 bg-muted rounded-lg max-h-60 overflow-y-auto'>
                              <pre className='text-sm whitespace-pre-wrap font-mono'>{content.script}</pre>
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        <div className='space-y-3'>
                          <div className='flex items-center justify-between'>
                            <h4 className='font-semibold text-sm'>Tags</h4>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => copyToClipboard(content.tags.join(', '))}
                              className='size-6 p-0'>
                              <Copy className='size-3' />
                            </Button>
                          </div>
                          <div className='flex flex-wrap gap-1'>
                            {content.tags.map((tag, index) => (
                              <Badge key={index} variant='outline' className='text-xs'>
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <p className='text-xs text-muted-foreground mt-4'>
                          Generated: {content.createdAt.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tips Section */}
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>YouTube Content Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Engaging Titles</h4>
                <p className='text-sm text-muted-foreground'>
                  Use numbers, questions, and power words. Include keywords for better SEO and
                  discoverability.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Script Structure</h4>
                <p className='text-sm text-muted-foreground'>
                  Start with a hook, provide value throughout, and end with a clear call-to-action.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>SEO Optimization</h4>
                <p className='text-sm text-muted-foreground'>
                  Use relevant tags, include keywords in description, and add timestamps for longer videos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
