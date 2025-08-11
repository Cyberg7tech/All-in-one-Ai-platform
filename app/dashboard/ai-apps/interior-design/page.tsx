'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Home, Download, Eye, Trash2, RefreshCw, Loader2, CheckCircle, X, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DesignProject {
  id: string;
  originalImage: string;
  roomType: string;
  designStyle: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  results?: string[];
  createdAt: Date;
}

export default function InteriorDesignPage() {
  const [projects, setProjects] = useState<DesignProject[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState('living-room');
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const roomTypes = [
    { id: 'living-room', name: 'Living Room', description: 'Main living space' },
    { id: 'bedroom', name: 'Bedroom', description: 'Sleeping area' },
    { id: 'kitchen', name: 'Kitchen', description: 'Cooking space' },
    { id: 'bathroom', name: 'Bathroom', description: 'Bathing area' },
    { id: 'dining-room', name: 'Dining Room', description: 'Eating area' },
    { id: 'office', name: 'Home Office', description: 'Work space' },
    { id: 'hallway', name: 'Hallway', description: 'Corridor' },
    { id: 'balcony', name: 'Balcony', description: 'Outdoor space' },
  ];

  const designStyles = [
    { id: 'modern', name: 'Modern', description: 'Clean lines, minimal decor' },
    { id: 'scandinavian', name: 'Scandinavian', description: 'Light colors, natural materials' },
    { id: 'industrial', name: 'Industrial', description: 'Raw materials, exposed elements' },
    { id: 'bohemian', name: 'Bohemian', description: 'Eclectic, colorful, relaxed' },
    { id: 'minimalist', name: 'Minimalist', description: 'Simple, uncluttered' },
    { id: 'traditional', name: 'Traditional', description: 'Classic, timeless' },
    { id: 'rustic', name: 'Rustic', description: 'Natural, weathered look' },
    { id: 'contemporary', name: 'Contemporary', description: 'Current trends, sophisticated' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload image files only.',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const project: DesignProject = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          originalImage: e.target?.result as string,
          roomType: selectedRoomType,
          designStyle: selectedStyle,
          status: 'uploading',
          progress: 0,
          createdAt: new Date(),
        };

        setProjects((prev) => [...prev, project]);
        processDesign(project.id);
      };
      reader.readAsDataURL(file);
    });

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processDesign = async (projectId: string) => {
    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setProjects((prev) =>
          prev.map((project) => (project.id === projectId ? { ...project, progress } : project))
        );
      }

      // Change to processing
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId ? { ...project, status: 'processing', progress: 0 } : project
        )
      );

      // Simulate processing progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setProjects((prev) =>
          prev.map((project) => (project.id === projectId ? { ...project, progress } : project))
        );
      }

      // Generate mock design results
      const mockResults = [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1551298370-9c50423918d8?w=400&h=300&fit=crop',
      ];

      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? {
                ...project,
                status: 'completed',
                progress: 100,
                results: mockResults,
              }
            : project
        )
      );

      toast({
        title: 'Design completed!',
        description: 'Your interior design suggestions are ready.',
      });
    } catch (error) {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId ? { ...project, status: 'error', progress: 0 } : project
        )
      );

      toast({
        title: 'Design generation failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const removeProject = (projectId: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== projectId));
  };

  const downloadImage = async (imageUrl: string, projectId: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `interior_design_${projectId}_${index + 1}.jpg`;
      a.click();

      URL.revokeObjectURL(url);

      toast({
        title: 'Download started',
        description: 'Your design image is being downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const retryProject = (projectId: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? { ...project, status: 'uploading', progress: 0, results: undefined }
          : project
      )
    );
    processDesign(projectId);
  };

  const getStatusColor = (status: DesignProject['status']) => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-3 mb-4'>
            <div className='p-2 bg-yellow-100 rounded-lg'>
              <Home className='size-6 text-yellow-600' />
            </div>
            <div>
              <h1 className='text-3xl font-bold'>Interior Design</h1>
              <p className='text-muted-foreground'>
                Get AI-powered interior design suggestions and visualizations
              </p>
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
                  Design Settings
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Room Type Selection */}
                <div className='space-y-3'>
                  <Label>Room Type</Label>
                  <select
                    value={selectedRoomType}
                    onChange={(e) => setSelectedRoomType(e.target.value)}
                    className='w-full p-2 border border-input rounded-md bg-background'>
                    {roomTypes.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} - {room.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Design Style Selection */}
                <div className='space-y-3'>
                  <Label>Design Style</Label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className='w-full p-2 border border-input rounded-md bg-background'>
                    {designStyles.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.name} - {style.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upload Button */}
                <div className='space-y-3'>
                  <Label>Upload Room Photo</Label>
                  <input
                    type='file'
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept='image/*'
                    multiple
                    className='hidden'
                  />
                  <Button onClick={() => fileInputRef.current?.click()} className='w-full'>
                    <Upload className='size-4 mr-2' />
                    Choose Photos
                  </Button>
                  <p className='text-xs text-muted-foreground'>
                    Upload clear photos of your room for best results
                  </p>
                </div>

                {/* Current Settings Display */}
                <div className='p-3 bg-muted rounded-lg'>
                  <h4 className='font-medium text-sm mb-2'>Current Settings:</h4>
                  <div className='space-y-1 text-xs text-muted-foreground'>
                    <div>Room: {roomTypes.find((r) => r.id === selectedRoomType)?.name}</div>
                    <div>Style: {designStyles.find((s) => s.id === selectedStyle)?.name}</div>
                  </div>
                </div>

                {/* Tips */}
                <div className='p-3 bg-muted rounded-lg'>
                  <h4 className='font-medium text-sm mb-2'>Tips for best results:</h4>
                  <ul className='text-xs text-muted-foreground space-y-1'>
                    <li>• Use well-lit photos</li>
                    <li>• Show the entire room</li>
                    <li>• Avoid cluttered spaces</li>
                    <li>• Multiple angles help</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Panel */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Eye className='size-5' />
                  Design Projects ({projects.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className='text-center py-12'>
                    <Home className='size-16 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-semibold mb-2'>No design projects yet</h3>
                    <p className='text-muted-foreground mb-4'>
                      Upload a room photo to get AI-powered design suggestions
                    </p>
                    <div className='grid grid-cols-2 gap-2 max-w-sm mx-auto'>
                      {roomTypes.slice(0, 4).map((room) => (
                        <Badge key={room.id} variant='outline' className='justify-center p-2'>
                          {room.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className='space-y-8'>
                    {projects.map((project) => (
                      <div key={project.id} className='border rounded-lg p-6'>
                        {/* Project Header */}
                        <div className='flex items-center justify-between mb-4'>
                          <div className='flex items-center space-x-3'>
                            <img
                              src={project.originalImage}
                              alt='Original room'
                              className='w-16 h-12 rounded object-cover'
                            />
                            <div>
                              <div className='flex items-center space-x-2'>
                                <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                                <Badge variant='outline'>
                                  {roomTypes.find((r) => r.id === project.roomType)?.name}
                                </Badge>
                                <Badge variant='outline'>
                                  {designStyles.find((s) => s.id === project.designStyle)?.name}
                                </Badge>
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                {project.createdAt.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => removeProject(project.id)}
                            className='text-red-500 hover:text-red-700'>
                            <Trash2 className='size-4' />
                          </Button>
                        </div>

                        {/* Progress */}
                        {(project.status === 'uploading' || project.status === 'processing') && (
                          <div className='space-y-2 mb-4'>
                            <Progress value={project.progress} />
                            <div className='flex items-center justify-center space-x-2 text-sm text-muted-foreground'>
                              <Loader2 className='size-4 animate-spin' />
                              <span>
                                {project.status === 'uploading' ? 'Uploading' : 'Generating designs'}...{' '}
                                {project.progress}%
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Results */}
                        {project.status === 'completed' && project.results && (
                          <div className='space-y-4'>
                            <div className='flex items-center space-x-2 text-green-600'>
                              <CheckCircle className='size-4' />
                              <span className='text-sm font-medium'>
                                {project.results.length} design suggestions generated
                              </span>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                              {project.results.map((result, index) => (
                                <div key={index} className='relative group'>
                                  <img
                                    src={result}
                                    alt={`Design suggestion ${index + 1}`}
                                    className='w-full aspect-video object-cover rounded-lg'
                                  />
                                  <div className='absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all rounded-lg flex items-center justify-center'>
                                    <div className='opacity-0 group-hover:opacity-100 flex space-x-2'>
                                      <Button
                                        size='sm'
                                        variant='secondary'
                                        onClick={() => downloadImage(result, project.id, index)}>
                                        <Download className='size-4' />
                                      </Button>
                                      <Button
                                        size='sm'
                                        variant='secondary'
                                        onClick={() => window.open(result, '_blank')}>
                                        <Eye className='size-4' />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className='absolute bottom-2 left-2'>
                                    <Badge variant='secondary' className='text-xs'>
                                      Option {index + 1}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Error State */}
                        {project.status === 'error' && (
                          <div className='text-center py-6 text-red-500'>
                            <X className='size-12 mx-auto mb-2' />
                            <p className='text-sm mb-3'>Design generation failed</p>
                            <Button variant='outline' size='sm' onClick={() => retryProject(project.id)}>
                              <RefreshCw className='size-4 mr-2' />
                              Retry
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

        {/* Design Styles Guide */}
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>Design Style Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {designStyles.slice(0, 4).map((style) => (
                <div key={style.id} className='space-y-2'>
                  <h4 className='font-semibold'>{style.name}</h4>
                  <p className='text-sm text-muted-foreground'>{style.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
