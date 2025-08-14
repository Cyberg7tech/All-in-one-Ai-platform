'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  User,
  Camera,
  CheckCircle,
  X,
  RefreshCw,
  Download,
  Eye,
  Trash2,
  Loader2,
  Copy,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HeadshotJob {
  id: string;
  originalImage: string;
  style: string;
  gender: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  results?: string[];
  createdAt: Date;
}

export default function HeadshotGeneratorPage() {
  const [jobs, setJobs] = useState<HeadshotJob[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [selectedGender, setSelectedGender] = useState('auto');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const styles = [
    { id: 'professional', name: 'Professional', description: 'Business suit, formal attire' },
    { id: 'casual', name: 'Casual', description: 'Relaxed, everyday clothing' },
    { id: 'corporate', name: 'Corporate', description: 'Executive, leadership style' },
    { id: 'creative', name: 'Creative', description: 'Artistic, modern look' },
    { id: 'linkedin', name: 'LinkedIn', description: 'Optimized for social media' },
    { id: 'headshot', name: 'Classic Headshot', description: 'Traditional portrait style' },
  ];

  const genderOptions = [
    { id: 'auto', name: 'Auto-detect' },
    { id: 'male', name: 'Male' },
    { id: 'female', name: 'Female' },
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
        const job: HeadshotJob = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          originalImage: e.target?.result as string,
          style: selectedStyle,
          gender: selectedGender,
          status: 'uploading',
          progress: 0,
          createdAt: new Date(),
        };

        setJobs((prev) => [...prev, job]);
        processHeadshot(job.id);
      };
      reader.readAsDataURL(file);
    });

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processHeadshot = async (jobId: string) => {
    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, progress } : job)));
      }

      // Change to processing
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, status: 'processing', progress: 0 } : job))
      );

      // Simulate processing progress
      for (let progress = 0; progress <= 100; progress += 15) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, progress } : job)));
      }

      // Generate mock results
      const mockResults = [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=300&h=300&fit=crop&crop=face',
      ];

      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status: 'completed',
                progress: 100,
                results: mockResults.slice(0, 4),
              }
            : job
        )
      );

      toast({
        title: 'Headshots generated!',
        description: 'Your professional headshots are ready for download.',
      });
    } catch (error) {
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, status: 'error', progress: 0 } : job))
      );

      toast({
        title: 'Generation failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const removeJob = (jobId: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
  };

  const downloadImage = async (imageUrl: string, jobId: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `headshot_${jobId}_${index + 1}.jpg`;
      a.click();

      URL.revokeObjectURL(url);

      toast({
        title: 'Download started',
        description: 'Your headshot is being downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const copyImageUrl = (imageUrl: string) => {
    navigator.clipboard.writeText(imageUrl);
    toast({
      title: 'Copied to clipboard',
      description: 'Image URL has been copied.',
    });
  };

  const retryJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: 'uploading', progress: 0, results: undefined } : job
      )
    );
    processHeadshot(jobId);
  };

  const getStatusColor = (status: HeadshotJob['status']) => {
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
            <div className='p-2 bg-pink-100 rounded-lg'>
              <Eye className='size-6 text-pink-600' />
            </div>
            <div>
              <h1 className='text-3xl font-bold'>Headshot Generator</h1>
              <p className='text-muted-foreground'>Create professional headshots from your photos</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Settings Panel */}
          <div className='lg:col-span-1'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Camera className='size-5' />
                  Headshot Settings
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Style Selection */}
                <div className='space-y-3'>
                  <Label>Style</Label>
                  <div className='space-y-2'>
                    {styles.map((style) => (
                      <Button
                        key={style.id}
                        variant={selectedStyle === style.id ? 'default' : 'outline'}
                        onClick={() => setSelectedStyle(style.id)}
                        className='w-full justify-start text-left h-auto p-3'>
                        <div>
                          <div className='font-medium'>{style.name}</div>
                          <div className='text-xs text-muted-foreground'>{style.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Gender Selection */}
                <div className='space-y-3'>
                  <Label>Gender</Label>
                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className='w-full p-2 border border-input rounded-md bg-background'>
                    {genderOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upload Button */}
                <div className='space-y-3'>
                  <Label>Upload Photo</Label>
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
                    Upload clear photos of faces for best results
                  </p>
                </div>

                {/* Tips */}
                <div className='p-3 bg-muted rounded-lg'>
                  <h4 className='font-medium text-sm mb-2'>Tips for best results:</h4>
                  <ul className='text-xs text-muted-foreground space-y-1'>
                    <li>• Use high-resolution images</li>
                    <li>• Ensure face is clearly visible</li>
                    <li>• Avoid heavy shadows or filters</li>
                    <li>• Front-facing photos work best</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <User className='size-5' />
                  Generated Headshots
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className='text-center py-12'>
                    <User className='size-16 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-semibold mb-2'>No headshots generated yet</h3>
                    <p className='text-muted-foreground'>Upload a photo to generate professional headshots</p>
                  </div>
                ) : (
                  <div className='space-y-8'>
                    {jobs.map((job) => (
                      <div key={job.id} className='border rounded-lg p-6'>
                        {/* Job Header */}
                        <div className='flex items-center justify-between mb-4'>
                          <div className='flex items-center space-x-3'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={job.originalImage}
                              alt='Original'
                              className='size-12 rounded-full object-cover'
                            />
                            <div>
                              <div className='flex items-center space-x-2'>
                                <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                                <Badge variant='outline'>
                                  {styles.find((s) => s.id === job.style)?.name}
                                </Badge>
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                {job.createdAt.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => removeJob(job.id)}
                            className='text-red-500 hover:text-red-700'>
                            <Trash2 className='size-4' />
                          </Button>
                        </div>

                        {/* Progress */}
                        {(job.status === 'uploading' || job.status === 'processing') && (
                          <div className='space-y-2 mb-4'>
                            <Progress value={job.progress} />
                            <div className='flex items-center justify-center space-x-2 text-sm text-muted-foreground'>
                              <Loader2 className='size-4 animate-spin' />
                              <span>
                                {job.status === 'uploading' ? 'Uploading' : 'Generating headshots'}...{' '}
                                {job.progress}%
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Results */}
                        {job.status === 'completed' && job.results && (
                          <div className='space-y-4'>
                            <div className='flex items-center space-x-2 text-green-600'>
                              <CheckCircle className='size-4' />
                              <span className='text-sm font-medium'>
                                {job.results.length} headshots generated
                              </span>
                            </div>
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                              {job.results.map((result, index) => (
                                <div key={index} className='relative group'>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={result}
                                    alt={`Headshot ${index + 1}`}
                                    className='w-full aspect-square object-cover rounded-lg'
                                  />
                                  <div className='absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all rounded-lg flex items-center justify-center'>
                                    <div className='opacity-0 group-hover:opacity-100 flex space-x-2'>
                                      <Button
                                        size='sm'
                                        variant='secondary'
                                        onClick={() => downloadImage(result, job.id, index)}>
                                        <Download className='size-4' />
                                      </Button>
                                      <Button
                                        size='sm'
                                        variant='secondary'
                                        onClick={() => copyImageUrl(result)}>
                                        <Copy className='size-4' />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Error State */}
                        {job.status === 'error' && (
                          <div className='text-center py-6 text-red-500'>
                            <X className='size-12 mx-auto mb-2' />
                            <p className='text-sm mb-3'>Headshot generation failed</p>
                            <Button variant='outline' size='sm' onClick={() => retryJob(job.id)}>
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

        {/* Guidelines Section */}
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>Headshot Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Photo Quality</h4>
                <p className='text-sm text-muted-foreground'>
                  Use high-resolution images (at least 512x512px) with good lighting and clear facial
                  features.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Styling Options</h4>
                <p className='text-sm text-muted-foreground'>
                  Choose from professional, casual, corporate, or creative styles to match your needs.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Best Practices</h4>
                <p className='text-sm text-muted-foreground'>
                  Face should be centered, well-lit, and free from obstructions like sunglasses or hats.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
