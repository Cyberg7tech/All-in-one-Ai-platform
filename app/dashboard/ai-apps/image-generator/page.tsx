'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Wand2, Download, Copy, Trash2, RefreshCw, Heart, Loader2, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  model: string;
  size: string;
  style: string;
  createdAt: Date;
  isLiked: boolean;
}

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('dall-e-3');
  const [selectedSize, setSelectedSize] = useState('1024x1024');
  const [selectedStyle, setSelectedStyle] = useState('natural');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const models = [
    { id: 'dall-e-3', name: 'DALL-E 3', description: 'Best quality, slower generation' },
    { id: 'dall-e-2', name: 'DALL-E 2', description: 'Good quality, faster generation' },
    { id: 'stable-diffusion', name: 'Stable Diffusion', description: 'Open source, creative' },
    { id: 'midjourney', name: 'Midjourney', description: 'Artistic style' },
  ];

  const sizes = [
    { id: '1024x1024', name: '1024×1024', description: 'Square (1:1)' },
    { id: '1024x1792', name: '1024×1792', description: 'Portrait (9:16)' },
    { id: '1792x1024', name: '1792×1024', description: 'Landscape (16:9)' },
    { id: '512x512', name: '512×512', description: 'Square (small)' },
  ];

  const styles = [
    { id: 'natural', name: 'Natural', description: 'Realistic photos' },
    { id: 'artistic', name: 'Artistic', description: 'Stylized artwork' },
    { id: 'digital-art', name: 'Digital Art', description: 'Digital illustrations' },
    { id: 'oil-painting', name: 'Oil Painting', description: 'Traditional oil painting' },
    { id: 'watercolor', name: 'Watercolor', description: 'Watercolor style' },
    { id: 'anime', name: 'Anime', description: 'Anime/manga style' },
    { id: 'cartoon', name: 'Cartoon', description: 'Cartoon illustration' },
    { id: 'photorealistic', name: 'Photorealistic', description: 'Ultra realistic' },
  ];

  const promptSuggestions = [
    'A serene mountain landscape at sunset with a crystal clear lake',
    'A futuristic cityscape with flying cars and neon lights',
    'A cozy coffee shop interior with warm lighting and books',
    'A magical forest with glowing mushrooms and fairy lights',
    'A space station orbiting Earth with stars in the background',
    'A vintage bicycle in a European cobblestone street',
  ];

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Please enter a prompt',
        description: 'You need to provide a description for image generation.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate API call to image generation service
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Generate mock image URL (in real implementation, this would come from the API)
      const mockImageUrl = `https://picsum.photos/800/800?random=${Date.now()}`;

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        imageUrl: mockImageUrl,
        model: selectedModel,
        size: selectedSize,
        style: selectedStyle,
        createdAt: new Date(),
        isLiked: false,
      };

      setGeneratedImages((prev) => [newImage, ...prev]);

      toast({
        title: 'Image generated successfully!',
        description: 'Your AI-generated image is ready.',
      });
    } catch (error) {
      toast({
        title: 'Error generating image',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-image-${Date.now()}.jpg`;
      a.click();

      URL.revokeObjectURL(url);

      toast({
        title: 'Download started',
        description: 'Your image is being downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: 'Copied to clipboard',
      description: 'Prompt has been copied.',
    });
  };

  const deleteImage = (imageId: string) => {
    setGeneratedImages((prev) => prev.filter((img) => img.id !== imageId));
    toast({
      title: 'Image deleted',
      description: 'The image has been removed.',
    });
  };

  const regenerateImage = (imagePrompt: string) => {
    setPrompt(imagePrompt);
    generateImage();
  };

  const toggleLike = (imageId: string) => {
    setGeneratedImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, isLiked: !img.isLiked } : img))
    );
  };

  const handleSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-3 mb-4'>
            <div className='p-2 bg-indigo-100 rounded-lg'>
              <Palette className='size-6 text-indigo-600' />
            </div>
            <div>
              <h1 className='text-3xl font-bold'>Image Generator</h1>
              <p className='text-muted-foreground'>Generate stunning images from text descriptions</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Settings Panel */}
          <div className='lg:col-span-1'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Wand2 className='size-5' />
                  Generation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Prompt Input */}
                <div className='space-y-3'>
                  <Label htmlFor='prompt'>Prompt</Label>
                  <Textarea
                    id='prompt'
                    placeholder='Describe the image you want to generate...'
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Model Selection */}
                <div className='space-y-3'>
                  <Label>AI Model</Label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className='w-full p-2 border border-input rounded-md bg-background'>
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                  <p className='text-xs text-muted-foreground'>
                    {models.find((m) => m.id === selectedModel)?.description}
                  </p>
                </div>

                {/* Size Selection */}
                <div className='space-y-3'>
                  <Label>Image Size</Label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className='w-full p-2 border border-input rounded-md bg-background'>
                    {sizes.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.name} - {size.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Style Selection */}
                <div className='space-y-3'>
                  <Label>Style</Label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className='w-full p-2 border border-input rounded-md bg-background'>
                    {styles.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Generate Button */}
                <Button onClick={generateImage} disabled={isGenerating || !prompt.trim()} className='w-full'>
                  {isGenerating ? (
                    <>
                      <Loader2 className='size-4 mr-2 animate-spin' />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className='size-4 mr-2' />
                      Generate Image
                    </>
                  )}
                </Button>

                {/* Prompt Suggestions */}
                <div className='space-y-3'>
                  <Label>Prompt Suggestions</Label>
                  <div className='space-y-2'>
                    {promptSuggestions.slice(0, 3).map((suggestion, index) => (
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

          {/* Generated Images */}
          <div className='lg:col-span-3'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span className='flex items-center gap-2'>
                    <Palette className='size-5' />
                    Generated Images ({generatedImages.length})
                  </span>
                  {generatedImages.length > 0 && (
                    <Button variant='outline' size='sm' onClick={() => setGeneratedImages([])}>
                      <Trash2 className='size-4 mr-2' />
                      Clear All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedImages.length === 0 ? (
                  <div className='text-center py-12'>
                    <Palette className='size-16 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-semibold mb-2'>No images generated yet</h3>
                    <p className='text-muted-foreground mb-4'>
                      Enter a prompt and click "Generate Image" to create AI artwork
                    </p>
                    <div className='space-y-2'>
                      <p className='text-sm text-muted-foreground'>Try these examples:</p>
                      <div className='flex flex-wrap gap-2 justify-center'>
                        {promptSuggestions.slice(3, 6).map((suggestion, index) => (
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
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                    {generatedImages.map((image) => (
                      <div key={image.id} className='group relative'>
                        <Card>
                          <CardContent className='p-0'>
                            <div className='relative'>
                              <img
                                src={image.imageUrl}
                                alt={image.prompt}
                                className='w-full aspect-square object-cover rounded-t-lg'
                              />
                              <div className='absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all rounded-t-lg flex items-center justify-center'>
                                <div className='opacity-0 group-hover:opacity-100 flex space-x-2'>
                                  <Button
                                    size='sm'
                                    variant='secondary'
                                    onClick={() => downloadImage(image.imageUrl)}>
                                    <Download className='size-4' />
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='secondary'
                                    onClick={() => copyPrompt(image.prompt)}>
                                    <Copy className='size-4' />
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='secondary'
                                    onClick={() => regenerateImage(image.prompt)}>
                                    <RefreshCw className='size-4' />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className='p-4 space-y-3'>
                              <p className='text-sm text-muted-foreground line-clamp-2'>{image.prompt}</p>
                              <div className='flex items-center justify-between'>
                                <div className='flex space-x-1'>
                                  <Badge variant='secondary' className='text-xs'>
                                    {models.find((m) => m.id === image.model)?.name}
                                  </Badge>
                                  <Badge variant='outline' className='text-xs'>
                                    {image.size}
                                  </Badge>
                                </div>
                                <div className='flex space-x-1'>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => toggleLike(image.id)}
                                    className={`size-8 p-0 ${image.isLiked ? 'text-red-500' : ''}`}>
                                    <Heart className={`size-4 ${image.isLiked ? 'fill-current' : ''}`} />
                                  </Button>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => deleteImage(image.id)}
                                    className='size-8 p-0 text-red-500 hover:text-red-700'>
                                    <Trash2 className='size-4' />
                                  </Button>
                                </div>
                              </div>
                              <p className='text-xs text-muted-foreground'>
                                {image.createdAt.toLocaleString()}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
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
            <CardTitle>Image Generation Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Writing Prompts</h4>
                <p className='text-sm text-muted-foreground'>
                  Be specific about style, lighting, composition, and mood. Include details like
                  "photorealistic", "oil painting", or "digital art".
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Model Selection</h4>
                <p className='text-sm text-muted-foreground'>
                  DALL-E 3 offers the highest quality, while Stable Diffusion excels at artistic styles.
                  Choose based on your needs.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Best Practices</h4>
                <p className='text-sm text-muted-foreground'>
                  Use clear, descriptive language. Mention camera angles, color schemes, and artistic
                  techniques for better results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
