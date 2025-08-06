'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Camera, Download, Share2, User } from 'lucide-react';
import { toast } from 'sonner';

interface HeadshotResult {
  id: string;
  original_image: string;
  headshot_url: string;
  style: string;
  background: string;
  status: 'completed' | 'processing' | 'failed';
  created_at: string;
  note?: string;
}

export default function HeadshotsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [style, setStyle] = useState('professional');
  const [background, setBackground] = useState('office');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedHeadshots, setGeneratedHeadshots] = useState<HeadshotResult[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!imageFile) {
      toast.error('Please upload an image first');
      return;
    }

    setIsGenerating(true);

    try {
      // Convert file to base64 for demo
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;

        // Create demo headshot result
        const newHeadshot: HeadshotResult = {
          id: `headshot_${Date.now()}`,
          original_image: base64,
          headshot_url: `https://via.placeholder.com/400x400/3B82F6/FFFFFF?text=Professional+Headshot`,
          style,
          background,
          status: 'processing',
          created_at: new Date().toISOString(),
        };

        setGeneratedHeadshots((prev) => [newHeadshot, ...prev]);

        // Simulate processing
        setTimeout(() => {
          setGeneratedHeadshots((prev) =>
            prev.map((headshot) =>
              headshot.id === newHeadshot.id
                ? {
                    ...headshot,
                    status: 'completed' as const,
                    note: `Professional headshot generated in ${style} style with ${background} background.

**To enable real AI headshot generation:**
1. **Professional AI Services:**
   - **HeadShot Pro**: AI-powered professional headshots
   - **Profile Picture AI**: Generate multiple headshot styles
   - **Aragon AI**: Professional headshot creation
   - **BetterPic**: AI headshot generator

2. **API Integrations:**
   - **Replicate API**: Various headshot models
   - **Stable Diffusion**: Custom headshot generation
   - **Midjourney API**: High-quality portrait generation
   - **OpenAI DALL-E**: AI image generation

**Your Settings:**
- **Style**: ${style}
- **Background**: ${background}
- **Custom Prompt**: ${customPrompt || 'None'}`,
                  }
                : headshot
            )
          );
          toast.success('Professional headshot generated!');
        }, 3000);
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      console.error('Headshot generation error:', error);
      toast.error('Failed to generate headshot');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadHeadshot = async (headshotUrl: string, style: string) => {
    try {
      const filename = `headshot_${style}_${Date.now()}.jpg`;
      const link = document.createElement('a');
      link.href = headshotUrl;
      link.download = filename;
      link.click();
      toast.success('Headshot downloaded!');
    } catch (error) {
      toast.error('Failed to download headshot');
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>AI Headshots</h1>
        <p className='text-gray-600'>Generate professional headshots using AI technology</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Input Section */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Camera className='h-5 w-5' />
                Upload Your Photo
              </CardTitle>
              <CardDescription>Upload a clear photo of yourself for AI headshot generation</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='image'>Photo Upload</Label>
                <Input
                  id='image'
                  type='file'
                  accept='image/*'
                  onChange={handleImageUpload}
                  className='mt-1'
                />
              </div>

              {imagePreview && (
                <div className='mt-4'>
                  <Label>Preview</Label>
                  <div className='mt-2 border rounded-lg p-4 bg-gray-50'>
                    <Image
                      src={imagePreview}
                      alt='Preview'
                      width={128}
                      height={128}
                      className='size-32 object-cover rounded-lg mx-auto'
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Headshot Settings</CardTitle>
              <CardDescription>Customize your professional headshot style</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='style'>Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select style' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='professional'>Professional</SelectItem>
                    <SelectItem value='corporate'>Corporate</SelectItem>
                    <SelectItem value='creative'>Creative</SelectItem>
                    <SelectItem value='casual'>Casual</SelectItem>
                    <SelectItem value='formal'>Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='background'>Background</Label>
                <Select value={background} onValueChange={setBackground}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select background' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='office'>Office</SelectItem>
                    <SelectItem value='studio'>Studio</SelectItem>
                    <SelectItem value='outdoor'>Outdoor</SelectItem>
                    <SelectItem value='gradient'>Gradient</SelectItem>
                    <SelectItem value='white'>White</SelectItem>
                    <SelectItem value='dark'>Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='prompt'>Custom Instructions (Optional)</Label>
                <Textarea
                  id='prompt'
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder='Add specific instructions for your headshot...'
                  rows={3}
                />
              </div>

              <Button onClick={handleGenerate} disabled={isGenerating || !imageFile} className='w-full'>
                {isGenerating ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Generating Headshot...
                  </>
                ) : (
                  <>
                    <Camera className='mr-2 h-4 w-4' />
                    Generate Professional Headshot
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                Generated Headshots
              </CardTitle>
              <CardDescription>Your AI-generated professional headshots</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedHeadshots.length === 0 ? (
                <div className='text-center py-12 text-gray-500'>
                  <Camera className='h-12 w-12 mx-auto mb-4 opacity-50' />
                  <p>No headshots generated yet</p>
                  <p className='text-sm'>Upload a photo and generate your first professional headshot</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {generatedHeadshots.map((headshot) => (
                    <div key={headshot.id} className='border rounded-lg p-4'>
                      <div className='flex justify-between items-start mb-4'>
                        <div>
                          <h3 className='font-semibold'>
                            {headshot.style.charAt(0).toUpperCase() + headshot.style.slice(1)} Headshot
                          </h3>
                          <p className='text-sm text-gray-600'>{headshot.background} background</p>
                        </div>
                        <Badge
                          variant={
                            headshot.status === 'completed'
                              ? 'default'
                              : headshot.status === 'processing'
                                ? 'secondary'
                                : 'destructive'
                          }>
                          {headshot.status}
                        </Badge>
                      </div>

                      <div className='grid grid-cols-2 gap-4 mb-4'>
                        <div>
                          <p className='text-sm font-medium mb-2'>Original</p>
                          <Image
                            src={headshot.original_image}
                            alt='Original'
                            width={400}
                            height={128}
                            className='w-full h-32 object-cover rounded border'
                          />
                        </div>
                        <div>
                          <p className='text-sm font-medium mb-2'>Professional Headshot</p>
                          {headshot.status === 'processing' ? (
                            <div className='w-full h-32 bg-gray-100 rounded border flex items-center justify-center'>
                              <Loader2 className='h-6 w-6 animate-spin' />
                            </div>
                          ) : (
                            <Image
                              src={headshot.headshot_url}
                              alt='Headshot'
                              width={400}
                              height={128}
                              className='w-full h-32 object-cover rounded border'
                            />
                          )}
                        </div>
                      </div>

                      {headshot.note && (
                        <div className='bg-blue-50 p-3 rounded text-sm text-blue-800 mb-4'>
                          <pre className='whitespace-pre-wrap font-sans'>{headshot.note}</pre>
                        </div>
                      )}

                      {headshot.status === 'completed' && (
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            onClick={() => downloadHeadshot(headshot.headshot_url, headshot.style)}>
                            <Download className='mr-2 h-4 w-4' />
                            Download
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => {
                              navigator.share?.({
                                title: 'My Professional Headshot',
                                url: headshot.headshot_url,
                              }) || toast.info('Sharing not supported on this device');
                            }}>
                            <Share2 className='mr-2 h-4 w-4' />
                            Share
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
