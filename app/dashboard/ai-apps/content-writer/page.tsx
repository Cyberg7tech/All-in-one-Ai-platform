'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Wand2, Copy, Download, Loader2, BookOpen, PenTool, Globe, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContentWriterPage() {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('blog');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const contentTypes = [
    { id: 'blog', name: 'Blog Post', icon: BookOpen },
    { id: 'article', name: 'Article', icon: FileText },
    { id: 'social', name: 'Social Media', icon: Globe },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'copy', name: 'Marketing Copy', icon: PenTool },
  ];

  const tones = [
    { id: 'professional', name: 'Professional' },
    { id: 'casual', name: 'Casual' },
    { id: 'friendly', name: 'Friendly' },
    { id: 'formal', name: 'Formal' },
    { id: 'persuasive', name: 'Persuasive' },
    { id: 'informative', name: 'Informative' },
  ];

  const lengths = [
    { id: 'short', name: 'Short (~200 words)' },
    { id: 'medium', name: 'Medium (~500 words)' },
    { id: 'long', name: 'Long (~1000 words)' },
  ];

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Please enter a topic',
        description: 'You need to provide a topic or prompt for content generation.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Write a ${contentType} about "${prompt}" in a ${tone} tone. The content should be ${length} length.`,
          model: 'gpt-4',
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data.message);

      toast({
        title: 'Content generated successfully!',
        description: 'Your content is ready for review and editing.',
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: 'Copied to clipboard!',
      description: 'Content has been copied to your clipboard.',
    });
  };

  const downloadContent = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-3 mb-4'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <FileText className='size-6 text-blue-600' />
            </div>
            <div>
              <h1 className='text-3xl font-bold'>Content Writer</h1>
              <p className='text-muted-foreground'>
                Generate high-quality content for blogs, articles, and marketing materials
              </p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Input Section */}
          <div className='lg:col-span-1'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Wand2 className='size-5' />
                  Content Settings
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Content Type */}
                <div className='space-y-3'>
                  <Label>Content Type</Label>
                  <div className='grid grid-cols-1 gap-2'>
                    {contentTypes.map((type) => (
                      <Button
                        key={type.id}
                        variant={contentType === type.id ? 'default' : 'outline'}
                        onClick={() => setContentType(type.id)}
                        className='justify-start'>
                        <type.icon className='size-4 mr-2' />
                        {type.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Tone */}
                <div className='space-y-3'>
                  <Label>Tone</Label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className='w-full p-2 border border-input rounded-md bg-background'>
                    {tones.map((toneOption) => (
                      <option key={toneOption.id} value={toneOption.id}>
                        {toneOption.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Length */}
                <div className='space-y-3'>
                  <Label>Length</Label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className='w-full p-2 border border-input rounded-md bg-background'>
                    {lengths.map((lengthOption) => (
                      <option key={lengthOption.id} value={lengthOption.id}>
                        {lengthOption.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic Input */}
                <div className='space-y-3'>
                  <Label htmlFor='prompt'>Topic/Prompt</Label>
                  <Textarea
                    id='prompt'
                    placeholder='Enter your topic or prompt here...'
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateContent}
                  disabled={isGenerating || !prompt.trim()}
                  className='w-full'>
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
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle>Generated Content</CardTitle>
                  {generatedContent && (
                    <div className='flex space-x-2'>
                      <Button variant='outline' size='sm' onClick={copyToClipboard}>
                        <Copy className='size-4 mr-2' />
                        Copy
                      </Button>
                      <Button variant='outline' size='sm' onClick={downloadContent}>
                        <Download className='size-4 mr-2' />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <div className='space-y-4'>
                    <div className='flex items-center space-x-2'>
                      <Badge variant='secondary'>
                        {contentTypes.find((t) => t.id === contentType)?.name}
                      </Badge>
                      <Badge variant='outline'>{tone}</Badge>
                      <Badge variant='outline'>{length}</Badge>
                    </div>
                    <div className='prose max-w-none'>
                      <div className='whitespace-pre-wrap p-4 bg-muted rounded-lg'>{generatedContent}</div>
                    </div>
                  </div>
                ) : (
                  <div className='text-center py-12'>
                    <FileText className='size-16 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-semibold mb-2'>No content generated yet</h3>
                    <p className='text-muted-foreground mb-4'>
                      Enter a topic and click "Generate Content" to create high-quality content
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tips Section */}
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>Content Writing Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Blog Posts</h4>
                <p className='text-sm text-muted-foreground'>
                  Include engaging headlines, clear structure, and actionable insights for your readers.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Social Media</h4>
                <p className='text-sm text-muted-foreground'>
                  Keep it concise, use relevant hashtags, and include a clear call-to-action.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Marketing Copy</h4>
                <p className='text-sm text-muted-foreground'>
                  Focus on benefits, create urgency, and address customer pain points.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
