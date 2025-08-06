'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Download,
  Share,
  Heart,
  Copy,
  Sparkles,
  Image as ImageIcon,
  Wand2,
  Palette,
  Camera,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  downloadFromUrl,
  downloadMultipleFiles,
  copyToClipboard,
  shareContent,
  generateUniqueFilename,
} from '@/lib/utils/download';
import { toast } from 'sonner';
import { dbHelpers } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';

interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  model: string;
  style: string;
  timestamp: Date;
  liked: boolean;
}

const ART_STYLES = [
  { id: 'vivid', name: 'Vivid', description: 'Hyper-real and dramatic images' },
  { id: 'natural', name: 'Natural', description: 'More natural, less hyper-real images' },
  { id: 'cartoon', name: 'Cartoon', description: 'Cartoon and animation style' },
  { id: 'sketch', name: 'Sketch', description: 'Pencil sketch style' },
  { id: 'watercolor', name: 'Watercolor', description: 'Watercolor painting style' },
  { id: 'oil-painting', name: 'Oil Painting', description: 'Classic oil painting' },
  { id: 'digital-art', name: 'Digital Art', description: 'Modern digital artwork' },
];

const AI_MODELS = [
  { id: 'dall-e-3', name: 'DALL-E 3', description: 'Best for creative and artistic images', cost: '$$$' },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion XL',
    description: 'Great for realistic images',
    cost: '$$',
  },
  { id: 'midjourney', name: 'Midjourney Style', description: 'Artistic and stylized outputs', cost: '$$' },
];

const PROMPT_TEMPLATES = [
  'A majestic landscape with mountains and lakes at sunset',
  'A futuristic cityscape with flying cars and neon lights',
  'A cozy coffee shop interior with warm lighting',
  'A portrait of a person in renaissance painting style',
  'An abstract geometric pattern with vibrant colors',
  'A magical forest with glowing mushrooms and fairy lights',
  'A steampunk mechanical device with intricate details',
  'A minimalist modern architecture building',
];

const SAMPLE_IMAGES: GeneratedImage[] = [
  {
    id: '1',
    prompt: 'A beautiful sunset over mountains with a lake',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop',
    model: 'dalle-3',
    style: 'vivid',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    liked: true,
  },
  {
    id: '2',
    prompt: 'Futuristic city with neon lights and flying cars',
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=500&fit=crop',
    model: 'stable-diffusion',
    style: 'digital-art',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    liked: false,
  },
  {
    id: '3',
    prompt: 'Magical forest with glowing mushrooms',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500&h=500&fit=crop',
    model: 'midjourney',
    style: 'vivid',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    liked: true,
  },
];

export default function ImageGeneratorPage() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('dall-e-3');
  const [selectedStyle, setSelectedStyle] = useState('vivid');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(SAMPLE_IMAGES);
  const [activeTab, setActiveTab] = useState<'generate' | 'gallery'>('generate');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      // Call the real image generation API
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model: selectedModel,
          size: '1024x1024',
          style: selectedStyle,
          quality: 'standard',
        }),
      });

      console.log('Image generation response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Image generation API error:', errorData);
        throw new Error(`API error (${response.status}): ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('Image generation response data:', data);

      if (data.success && data.images && data.images.length > 0) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          prompt: prompt.trim(),
          url: data.images[0], // Use the actual generated image URL
          model: selectedModel,
          style: selectedStyle,
          timestamp: new Date(),
          liked: false,
        };

        setGeneratedImages((prev) => [newImage, ...prev]);
        setActiveTab('gallery');

        // Track activity
        if (user) {
          try {
            await dbHelpers.addActivity(
              user.id,
              'Image Generation',
              'Generated Image',
              `Created image with ${selectedModel}: "${prompt.trim().substring(0, 50)}${prompt.trim().length > 50 ? '...' : ''}"`,
              '🖼️',
              { model: selectedModel, style: selectedStyle }
            );
          } catch (activityError) {
            console.log('Activity tracking failed (non-critical):', activityError);
          }
        }
      } else {
        const errorMsg = data.error || data.message || 'Image generation failed';
        console.error('Image generation failed:', data);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Image generation error:', error);

      // Provide specific error messages based on the error type
      let errorMessage = 'Image generation failed. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = 'API authentication failed. Please check your OpenAI API key configuration.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Invalid request. Please check your prompt and try again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.length > 0) {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleLike = (imageId: string) => {
    setGeneratedImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, liked: !img.liked } : img))
    );
  };

  const copyPrompt = async (prompt: string) => {
    try {
      await copyToClipboard(prompt);
      toast.success('Prompt copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy prompt');
    }
  };

  // Download functionality
  const downloadImage = async (image: GeneratedImage) => {
    try {
      const filename = generateUniqueFilename(`oneai_${image.model}`, 'png');
      await downloadFromUrl(image.url, filename);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download image');
      console.error('Download error:', error);
    }
  };

  const downloadAllImages = async () => {
    try {
      if (generatedImages.length === 0) {
        toast.error('No images to download');
        return;
      }

      toast.info('Starting download of all images...');

      const files = generatedImages.map((image, index) => ({
        url: image.url,
        name: generateUniqueFilename(`oneai_${image.model}_${index + 1}`, 'png'),
      }));

      await downloadMultipleFiles(files);
      toast.success(`Downloaded ${files.length} images successfully!`);
    } catch (error) {
      toast.error('Failed to download images');
      console.error('Bulk download error:', error);
    }
  };

  const shareImage = async (image: GeneratedImage) => {
    try {
      await shareContent({
        title: 'AI Generated Image',
        text: `Check out this AI-generated image: "${image.prompt}"`,
        url: image.url,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('copied')) {
        toast.success(error.message);
      } else {
        toast.error('Failed to share image');
      }
    }
  };

  const shareGallery = async () => {
    try {
      await shareContent({
        title: 'My AI Image Gallery',
        text: `Check out my AI-generated images from One AI!`,
        url: window.location.href,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('copied')) {
        toast.success(error.message);
      } else {
        toast.error('Failed to share gallery');
      }
    }
  };

  const loadTemplate = (template: string) => {
    setPrompt(template);
  };

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='flex items-center mb-6'>
        <Button variant='ghost' asChild className='mr-4'>
          <Link href='/dashboard/explore'>
            <ArrowLeft className='size-4 mr-2' />
            Back to Explore
          </Link>
        </Button>
        <div>
          <h1 className='text-3xl font-bold flex items-center'>
            <ImageIcon className='size-8 mr-3 text-primary' />
            AI Image Generator
          </h1>
          <p className='text-muted-foreground'>
            Create stunning images with AI using DALL-E 3 and Stable Diffusion
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex space-x-4 mb-6'>
        <Button
          variant={activeTab === 'generate' ? 'default' : 'outline'}
          onClick={() => setActiveTab('generate')}>
          <Wand2 className='size-4 mr-2' />
          Generate
        </Button>
        <Button
          variant={activeTab === 'gallery' ? 'default' : 'outline'}
          onClick={() => setActiveTab('gallery')}>
          <Camera className='size-4 mr-2' />
          Gallery ({generatedImages.length})
        </Button>
      </div>

      {activeTab === 'generate' ? (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Generation Panel */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Prompt Input */}
            <Card>
              <CardHeader>
                <CardTitle>Describe Your Image</CardTitle>
                <CardDescription>Be specific and descriptive for best results</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder='A beautiful landscape with mountains, lakes, and a sunset sky...'
                  className='w-full p-3 border border-input rounded-md h-24 resize-none focus:outline-none focus:ring-2 focus:ring-ring'
                />

                <div className='flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>{prompt.length}/500 characters</span>
                  <Button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating}>
                    {isGenerating ? (
                      <>
                        <div className='size-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className='size-4 mr-2' />
                        Generate Image
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Prompt Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Prompt Templates</CardTitle>
                <CardDescription>Get started with these popular prompts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  {PROMPT_TEMPLATES.map((template, index) => (
                    <div
                      key={index}
                      className='p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors'
                      onClick={() => loadTemplate(template)}>
                      <p className='text-sm'>{template}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generation Progress */}
            {isGenerating && (
              <Card>
                <CardContent className='p-6'>
                  <div className='text-center'>
                    <div className='size-16 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
                    <h3 className='text-lg font-semibold mb-2'>Generating Your Image</h3>
                    <p className='text-muted-foreground'>This may take up to 30 seconds...</p>
                    <div className='w-full bg-muted rounded-full h-2 mt-4'>
                      <div
                        className='bg-primary h-2 rounded-full animate-pulse'
                        style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Settings Panel */}
          <div className='space-y-6'>
            {/* Model Selection */}
            <Card>
              <CardHeader>
                <CardTitle>AI Model</CardTitle>
                <CardDescription>Choose the AI model for generation</CardDescription>
              </CardHeader>
              <CardContent className='space-y-3'>
                {AI_MODELS.map((model) => (
                  <div
                    key={model.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedModel === model.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedModel(model.id)}>
                    <div className='flex items-center justify-between mb-1'>
                      <span className='font-medium'>{model.name}</span>
                      <Badge variant='outline'>{model.cost}</Badge>
                    </div>
                    <p className='text-sm text-muted-foreground'>{model.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Style Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Art Style</CardTitle>
                <CardDescription>Select the artistic style</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-2'>
                  {ART_STYLES.map((style) => (
                    <Button
                      key={style.id}
                      variant={selectedStyle === style.id ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setSelectedStyle(style.id)}
                      className='h-auto p-2 flex flex-col items-center'>
                      <Palette className='size-4 mb-1' />
                      <span className='text-xs'>{style.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2 text-sm'>
                <p>• Be specific about colors, lighting, and composition</p>
                <p>• Mention the art medium (oil painting, photograph, etc.)</p>
                <p>• Include mood and atmosphere descriptors</p>
                <p>• Add artist names for specific styles</p>
                <p>• Use aspect ratio keywords (portrait, landscape, square)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Gallery View */
        <div>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-semibold'>Your Generated Images</h2>
            <div className='flex space-x-2'>
              <Button variant='outline' size='sm' onClick={downloadAllImages}>
                <Download className='size-4 mr-2' />
                Download All
              </Button>
              <Button variant='outline' size='sm' onClick={shareGallery}>
                <Share className='size-4 mr-2' />
                Share Gallery
              </Button>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {generatedImages.map((image) => (
              <Card key={image.id} className='group hover:shadow-lg transition-all'>
                <div className='relative'>
                  <Image
                    src={image.url}
                    alt={image.prompt}
                    width={300}
                    height={192}
                    className='w-full h-48 object-cover rounded-t-lg'
                  />
                  <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <Button
                      size='sm'
                      variant='secondary'
                      className='size-8 p-0'
                      onClick={() => toggleLike(image.id)}>
                      <Heart className={`size-4 ${image.liked ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                  <div className='absolute bottom-2 left-2'>
                    <Badge variant='secondary' className='text-xs'>
                      {AI_MODELS.find((m) => m.id === image.model)?.name}
                    </Badge>
                  </div>
                </div>

                <CardContent className='p-4'>
                  <p className='text-sm text-muted-foreground mb-2 line-clamp-2'>{image.prompt}</p>

                  <div className='flex items-center justify-between text-xs text-muted-foreground mb-3'>
                    <span>{image.style}</span>
                    <span>{image.timestamp.toLocaleDateString()}</span>
                  </div>

                  <div className='flex space-x-2'>
                    <Button size='sm' variant='outline' onClick={() => downloadImage(image)}>
                      <Download className='size-3 mr-1' />
                      Download
                    </Button>
                    <Button size='sm' variant='outline' onClick={() => copyPrompt(image.prompt)}>
                      <Copy className='size-3' />
                    </Button>
                    <Button size='sm' variant='outline' onClick={() => shareImage(image)}>
                      <Share className='size-3' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {generatedImages.length === 0 && (
            <div className='text-center py-12'>
              <ImageIcon className='size-16 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No images generated yet</h3>
              <p className='text-muted-foreground mb-4'>Start creating amazing images with AI</p>
              <Button onClick={() => setActiveTab('generate')}>
                <Sparkles className='size-4 mr-2' />
                Generate Your First Image
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
