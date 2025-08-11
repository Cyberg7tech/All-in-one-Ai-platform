'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Palette, Wand2, Download, Copy, Trash2, RefreshCw, Loader2, Heart, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GhibliImage {
  id: string;
  prompt: string;
  style: string;
  mood: string;
  imageUrl: string;
  isLiked: boolean;
  createdAt: Date;
}

export default function GhibliGeneratorPage() {
  const [images, setImages] = useState<GhibliImage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('classic');
  const [selectedMood, setSelectedMood] = useState('peaceful');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const ghibliStyles = [
    { id: 'classic', name: 'Classic Ghibli', description: 'Traditional Studio Ghibli style' },
    { id: 'spirited-away', name: 'Spirited Away', description: 'Mystical and magical atmosphere' },
    { id: 'totoro', name: 'My Neighbor Totoro', description: 'Whimsical forest creatures' },
    { id: 'howl', name: "Howl's Moving Castle", description: 'Steampunk and magical elements' },
    { id: 'princess-mononoke', name: 'Princess Mononoke', description: 'Nature and ancient spirits' },
    { id: 'kiki', name: "Kiki's Delivery Service", description: 'Charming European town vibes' },
  ];

  const moods = [
    { id: 'peaceful', name: 'Peaceful', emoji: '🌸', description: 'Serene and calming' },
    { id: 'magical', name: 'Magical', emoji: '✨', description: 'Enchanted and mystical' },
    { id: 'adventurous', name: 'Adventurous', emoji: '🌟', description: 'Exciting journey vibes' },
    { id: 'nostalgic', name: 'Nostalgic', emoji: '🍂', description: 'Warm childhood memories' },
    { id: 'dreamy', name: 'Dreamy', emoji: '🌙', description: 'Ethereal and fantastical' },
    { id: 'cozy', name: 'Cozy', emoji: '🏠', description: 'Warm and homey feeling' },
  ];

  const promptSuggestions = [
    'A young girl walking through a magical forest with glowing spirits',
    'A small cottage on a hill surrounded by wildflowers and floating islands',
    'An ancient tree guardian in a misty forest clearing',
    'A flying castle above the clouds with steampunk elements',
    'A peaceful village market scene with anthropomorphic animals',
    'A magical train station where spirits board ethereal trains',
    'A wise old dragon resting in a field of lavender',
    'Children playing in a meadow with friendly forest creatures',
  ];

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Please enter a prompt',
        description: 'Describe the Ghibli-style image you want to create.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate image generation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Generate mock Ghibli-style image
      const mockImageUrl = `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format`;

      const newImage: GhibliImage = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        style: selectedStyle,
        mood: selectedMood,
        imageUrl: mockImageUrl,
        isLiked: false,
        createdAt: new Date(),
      };

      setImages((prev) => [newImage, ...prev]);
      setPrompt('');

      toast({
        title: 'Ghibli image generated!',
        description: 'Your Studio Ghibli-style artwork is ready.',
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
      a.download = `ghibli-${Date.now()}.jpg`;
      a.click();

      URL.revokeObjectURL(url);

      toast({
        title: 'Download started',
        description: 'Your Ghibli image is being downloaded.',
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
    setImages((prev) => prev.filter((img) => img.id !== imageId));
    toast({
      title: 'Image deleted',
      description: 'The image has been removed.',
    });
  };

  const regenerateImage = (image: GhibliImage) => {
    setPrompt(image.prompt);
    setSelectedStyle(image.style);
    setSelectedMood(image.mood);
    generateImage();
  };

  const toggleLike = (imageId: string) => {
    setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, isLiked: !img.isLiked } : img)));
  };

  const handleSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-3 mb-4'>
            <div className='p-2 bg-green-100 rounded-lg'>
              <Palette className='size-6 text-green-600' />
            </div>
            <div>
              <h1 className='text-3xl font-bold'>Ghibli Image Generator</h1>
              <p className='text-muted-foreground'>Generate images in Studio Ghibli style</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
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
                  <Label htmlFor='prompt'>Scene Description</Label>
                  <Textarea
                    id='prompt'
                    placeholder='Describe the magical scene you want to create in Ghibli style...'
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Style Selection */}
                <div className='space-y-3'>
                  <Label>Ghibli Style</Label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className='w-full p-2 border border-input rounded-md bg-background'>
                    {ghibliStyles.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.name}
                      </option>
                    ))}
                  </select>
                  <p className='text-xs text-muted-foreground'>
                    {ghibliStyles.find((s) => s.id === selectedStyle)?.description}
                  </p>
                </div>

                {/* Mood Selection */}
                <div className='space-y-3'>
                  <Label>Mood & Atmosphere</Label>
                  <div className='grid grid-cols-2 gap-2'>
                    {moods.map((mood) => (
                      <Button
                        key={mood.id}
                        variant={selectedMood === mood.id ? 'default' : 'outline'}
                        onClick={() => setSelectedMood(mood.id)}
                        className='justify-start h-auto p-3'
                        size='sm'>
                        <div className='text-left'>
                          <div className='flex items-center space-x-2'>
                            <span>{mood.emoji}</span>
                            <span className='font-medium text-xs'>{mood.name}</span>
                          </div>
                          <div className='text-xs text-muted-foreground'>{mood.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button onClick={generateImage} disabled={isGenerating || !prompt.trim()} className='w-full'>
                  {isGenerating ? (
                    <>
                      <Loader2 className='size-4 mr-2 animate-spin' />
                      Creating Magic...
                    </>
                  ) : (
                    <>
                      <Sparkles className='size-4 mr-2' />
                      Generate Ghibli Art
                    </>
                  )}
                </Button>

                {/* Prompt Suggestions */}
                <div className='space-y-3'>
                  <Label>Magical Inspiration</Label>
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

                {/* Style Info */}
                <div className='p-3 bg-muted rounded-lg'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <Palette className='size-4 text-green-600' />
                    <span className='text-sm font-medium'>Ghibli Elements</span>
                  </div>
                  <ul className='text-xs text-muted-foreground space-y-1'>
                    <li>• Soft, hand-drawn aesthetics</li>
                    <li>• Magical creatures & spirits</li>
                    <li>• Lush natural environments</li>
                    <li>• Warm, nostalgic atmosphere</li>
                    <li>• Detailed character expressions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Images */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='flex items-center gap-2'>
                    <Palette className='size-5' />
                    Ghibli Gallery ({images.length})
                  </CardTitle>
                  {images.length > 0 && (
                    <Button variant='outline' size='sm' onClick={() => setImages([])}>
                      <Trash2 className='size-4 mr-2' />
                      Clear Gallery
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {images.length === 0 ? (
                  <div className='text-center py-12'>
                    <Palette className='size-16 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-semibold mb-2'>Your magical gallery awaits</h3>
                    <p className='text-muted-foreground mb-4'>
                      Create enchanting Studio Ghibli-style artwork with AI
                    </p>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2 max-w-lg mx-auto'>
                      {promptSuggestions.slice(3, 7).map((suggestion, index) => (
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
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {images.map((image) => (
                      <div key={image.id} className='group relative'>
                        <Card className='overflow-hidden'>
                          <div className='relative'>
                            <img
                              src={image.imageUrl}
                              alt={image.prompt}
                              className='w-full aspect-[4/3] object-cover'
                            />
                            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center'>
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
                                <Button size='sm' variant='secondary' onClick={() => regenerateImage(image)}>
                                  <RefreshCw className='size-4' />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <CardContent className='p-4'>
                            <div className='space-y-3'>
                              <p className='text-sm line-clamp-2'>{image.prompt}</p>

                              <div className='flex items-center justify-between'>
                                <div className='flex space-x-1'>
                                  <Badge variant='secondary' className='text-xs'>
                                    {ghibliStyles.find((s) => s.id === image.style)?.name}
                                  </Badge>
                                  <Badge variant='outline' className='text-xs'>
                                    {moods.find((m) => m.id === image.mood)?.emoji}{' '}
                                    {moods.find((m) => m.id === image.mood)?.name}
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
            <CardTitle>Creating Perfect Ghibli Art</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Magical Elements</h4>
                <p className='text-sm text-muted-foreground'>
                  Include spirits, floating objects, glowing elements, or magical creatures to capture the
                  Ghibli essence.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Natural Settings</h4>
                <p className='text-sm text-muted-foreground'>
                  Emphasize forests, meadows, ancient trees, or mystical landscapes that are central to Ghibli
                  films.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Emotional Tone</h4>
                <p className='text-sm text-muted-foreground'>
                  Focus on peaceful, nostalgic, or wonder-filled moments that evoke the emotional depth of
                  Studio Ghibli.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
