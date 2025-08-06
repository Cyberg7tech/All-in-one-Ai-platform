'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Upload,
  Download,
  Loader2,
  PaintBucket,
  Wand2,
  Image as ImageIcon,
  Eye,
  Palette,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface DesignProject {
  id: string;
  roomType: string;
  style: string;
  description: string;
  originalImageUrl?: string;
  designedImageUrl: string;
  suggestions: string[];
  colorPalette: string[];
  status: 'generating' | 'completed' | 'failed';
  createdAt: Date;
}

export default function InteriorDesignPage() {
  const { user } = useAuth();
  const [roomType, setRoomType] = useState('living-room');
  const [designStyle, setDesignStyle] = useState('modern');
  const [description, setDescription] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [designProjects, setDesignProjects] = useState<DesignProject[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const roomTypes = [
    { value: 'living-room', label: 'Living Room', emoji: '🛋️' },
    { value: 'bedroom', label: 'Bedroom', emoji: '🛏️' },
    { value: 'kitchen', label: 'Kitchen', emoji: '🍳' },
    { value: 'bathroom', label: 'Bathroom', emoji: '🛁' },
    { value: 'dining-room', label: 'Dining Room', emoji: '🍽️' },
    { value: 'office', label: 'Home Office', emoji: '💼' },
    { value: 'children-room', label: "Children's Room", emoji: '🧸' },
    { value: 'garage', label: 'Garage', emoji: '🚗' },
  ];

  const designStyles = [
    { value: 'modern', label: 'Modern', description: 'Clean lines and minimalist aesthetic' },
    { value: 'traditional', label: 'Traditional', description: 'Classic and timeless elegance' },
    { value: 'scandinavian', label: 'Scandinavian', description: 'Light, airy, and functional' },
    { value: 'industrial', label: 'Industrial', description: 'Raw materials and urban feel' },
    { value: 'bohemian', label: 'Bohemian', description: 'Eclectic and artistic vibe' },
    { value: 'minimalist', label: 'Minimalist', description: 'Less is more philosophy' },
    { value: 'rustic', label: 'Rustic', description: 'Natural and cozy countryside feel' },
    { value: 'contemporary', label: 'Contemporary', description: 'Current trends and styles' },
  ];

  const sampleDescriptions = [
    'A cozy living room with warm lighting and comfortable seating for family gatherings',
    'A modern kitchen with sleek appliances and plenty of storage space',
    'A peaceful bedroom with calming colors and good natural light',
    'An efficient home office with organized workspace and inspiring decor',
    'A bright bathroom with spa-like features and modern fixtures',
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleGenerate = async () => {
    if (!description.trim() && !uploadedImage) return;

    setIsGenerating(true);

    const newProject: DesignProject = {
      id: Date.now().toString(),
      roomType,
      style: designStyle,
      description: description.trim(),
      originalImageUrl: previewUrl,
      designedImageUrl: '',
      suggestions: [],
      colorPalette: [],
      status: 'generating',
      createdAt: new Date(),
    };

    setDesignProjects((prev) => [newProject, ...prev]);

    try {
      const formData = new FormData();
      if (uploadedImage) {
        formData.append('image', uploadedImage);
      }
      formData.append('roomType', roomType);
      formData.append('style', designStyle);
      formData.append('description', description.trim());
      formData.append('userId', user?.id || '');

      const response = await fetch('/api/ai/interior-design', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setDesignProjects((prev) =>
          prev.map((project) =>
            project.id === newProject.id
              ? {
                  ...project,
                  designedImageUrl: data.designedImageUrl,
                  suggestions: data.suggestions,
                  colorPalette: data.colorPalette,
                  status: 'completed',
                }
              : project
          )
        );
      } else {
        throw new Error(data.message || 'Design generation failed');
      }
    } catch (error) {
      console.error('Interior design error:', error);
      setDesignProjects((prev) =>
        prev.map((project) => (project.id === newProject.id ? { ...project, status: 'failed' } : project))
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className='p-6 max-w-7xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <PaintBucket className='w-8 h-8' />
            AI Interior Designer
          </h1>
          <p className='text-muted-foreground mt-1'>
            Transform your space with AI-powered interior design suggestions
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Design Form */}
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Room Details</CardTitle>
              <CardDescription>Tell us about the space you want to redesign</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Room Type */}
              <div>
                <Label>Room Type</Label>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mt-2'>
                  {roomTypes.map((room) => (
                    <div
                      key={room.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors text-center ${
                        roomType === room.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setRoomType(room.value)}>
                      <div className='text-xl mb-1'>{room.emoji}</div>
                      <div className='font-medium text-sm'>{room.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Design Style */}
              <div>
                <Label>Design Style</Label>
                <Select value={designStyle} onValueChange={setDesignStyle}>
                  <SelectTrigger className='mt-2'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {designStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div>
                          <div className='font-medium'>{style.label}</div>
                          <div className='text-xs text-muted-foreground'>{style.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor='description'>Design Requirements</Label>
                <Textarea
                  id='description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Describe your vision, preferences, and any specific requirements...'
                  className='min-h-[100px] mt-2'
                />
                <p className='text-xs text-muted-foreground mt-1'>
                  Include colors, furniture preferences, lighting, and functionality needs
                </p>
              </div>

              {/* Sample Descriptions */}
              <div>
                <Label>Quick Examples</Label>
                <div className='grid grid-cols-1 gap-2 mt-2'>
                  {sampleDescriptions.slice(0, 3).map((sample, index) => (
                    <Button
                      key={index}
                      variant='outline'
                      size='sm'
                      className='justify-start text-left h-auto py-2 px-3'
                      onClick={() => setDescription(sample)}>
                      <div className='truncate'>{sample}</div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Current Room Photo (Optional)</CardTitle>
              <CardDescription>
                Upload a photo of your current space for better design suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {previewUrl ? (
                  <div className='relative'>
                    <Image
                      src={previewUrl}
                      alt='Uploaded room'
                      width={800}
                      height={256}
                      className='w-full h-64 object-cover rounded-lg'
                    />
                    <Button
                      variant='destructive'
                      size='sm'
                      className='absolute top-2 right-2'
                      onClick={clearImage}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className='border-2 border-dashed border-border rounded-lg p-8 text-center'>
                    <Upload className='w-8 h-8 mx-auto mb-4 text-muted-foreground' />
                    <p className='text-sm text-muted-foreground mb-4'>
                      Drag and drop a room photo, or click to browse
                    </p>
                    <Button onClick={() => fileInputRef.current?.click()} disabled={isGenerating}>
                      <Upload className='w-4 h-4 mr-2' />
                      Choose Photo
                    </Button>
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      onChange={handleImageUpload}
                      className='hidden'
                    />
                  </div>
                )}
                <p className='text-xs text-muted-foreground text-center'>
                  Supported formats: JPG, PNG, WebP (Max size: 10MB)
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleGenerate}
            disabled={(!description.trim() && !uploadedImage) || isGenerating}
            className='w-full'
            size='lg'>
            {isGenerating ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Generating Design...
              </>
            ) : (
              <>
                <Wand2 className='w-4 h-4 mr-2' />
                Generate Interior Design
              </>
            )}
          </Button>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Current Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span>Room:</span>
                  <span className='capitalize'>{roomTypes.find((r) => r.value === roomType)?.label}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Style:</span>
                  <span className='capitalize'>{designStyle}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Has Photo:</span>
                  <span>{uploadedImage ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Design Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span>AI-powered suggestions</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span>Color palette recommendations</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span>Furniture placement ideas</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span>Lighting recommendations</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span>Style-specific suggestions</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Design Tips</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='text-sm space-y-2'>
                <p>• Be specific about your preferences</p>
                <p>• Include budget considerations</p>
                <p>• Mention any existing furniture to keep</p>
                <p>• Consider the room's natural lighting</p>
                <p>• Think about the room's primary function</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Design Results */}
      {designProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Design Projects</CardTitle>
            <CardDescription>AI-generated interior design suggestions for your spaces</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {designProjects.map((project) => (
                <div key={project.id} className='border rounded-lg p-6 space-y-4'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h3 className='font-semibold text-lg capitalize'>
                        {roomTypes.find((r) => r.value === project.roomType)?.label} - {project.style}
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>{project.description}</p>
                    </div>
                    <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                      {project.status === 'generating' ? 'Generating...' : project.status}
                    </Badge>
                  </div>

                  {project.status === 'generating' && (
                    <div className='flex items-center justify-center py-8'>
                      <div className='text-center'>
                        <Loader2 className='w-8 h-8 animate-spin mx-auto mb-2' />
                        <p className='text-sm text-muted-foreground'>Creating your design...</p>
                      </div>
                    </div>
                  )}

                  {project.status === 'completed' && (
                    <div className='space-y-4'>
                      {/* Before/After Images */}
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {project.originalImageUrl && (
                          <div>
                            <h4 className='font-medium text-sm mb-2 flex items-center gap-2'>
                              <Eye className='w-4 h-4' />
                              Current Room
                            </h4>
                            <Image
                              src={project.originalImageUrl}
                              alt='Original room'
                              width={400}
                              height={192}
                              className='w-full h-48 object-cover rounded-lg'
                            />
                          </div>
                        )}
                        <div>
                          <h4 className='font-medium text-sm mb-2 flex items-center gap-2'>
                            <Wand2 className='w-4 h-4' />
                            AI Design Suggestion
                          </h4>
                          <Image
                            src={project.designedImageUrl || '/api/placeholder/400/300'}
                            alt='AI designed room'
                            width={400}
                            height={192}
                            className='w-full h-48 object-cover rounded-lg'
                          />
                        </div>
                      </div>

                      {/* Color Palette */}
                      {project.colorPalette.length > 0 && (
                        <div>
                          <h4 className='font-medium text-sm mb-2 flex items-center gap-2'>
                            <Palette className='w-4 h-4' />
                            Recommended Color Palette
                          </h4>
                          <div className='flex gap-2'>
                            {project.colorPalette.map((color, index) => (
                              <div
                                key={index}
                                className='w-8 h-8 rounded-full border-2 border-white shadow-md'
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Design Suggestions */}
                      {project.suggestions.length > 0 && (
                        <div>
                          <h4 className='font-medium text-sm mb-2'>Design Suggestions</h4>
                          <div className='space-y-2'>
                            {project.suggestions.map((suggestion, index) => (
                              <div key={index} className='flex items-start gap-2 text-sm'>
                                <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                                <span>{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className='flex gap-2'>
                        <Button variant='outline' size='sm'>
                          <Download className='w-4 h-4 mr-2' />
                          Download Design
                        </Button>
                        <Button variant='outline' size='sm'>
                          <ImageIcon className='w-4 h-4 mr-2' />
                          Save to Gallery
                        </Button>
                      </div>
                    </div>
                  )}

                  {project.status === 'failed' && (
                    <div className='text-center py-8'>
                      <p className='text-sm text-red-500'>Design generation failed. Please try again.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
