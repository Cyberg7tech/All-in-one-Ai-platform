'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Zap,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle,
  X,
  Image as ImageIcon,
  ZoomIn,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UpscaleJob {
  id: string;
  originalImage: string;
  originalSize: { width: number; height: number };
  scale: number;
  enhanceType: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  resultImage?: string;
  resultSize?: { width: number; height: number };
  createdAt: Date;
}

export default function ImageUpscalerPage() {
  const [jobs, setJobs] = useState<UpscaleJob[]>([]);
  const [selectedScale, setSelectedScale] = useState(2);
  const [selectedEnhanceType, setSelectedEnhanceType] = useState('general');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scaleOptions = [
    { value: 2, label: '2x (Double)', description: 'Double the resolution' },
    { value: 4, label: '4x (Quadruple)', description: 'Quadruple the resolution' },
    { value: 8, label: '8x (Ultra)', description: 'Ultra high resolution' },
  ];

  const enhanceTypes = [
    { id: 'general', name: 'General', description: 'Best for most images' },
    { id: 'photo', name: 'Photo', description: 'Optimized for photographs' },
    { id: 'artwork', name: 'Artwork', description: 'Best for illustrations and art' },
    { id: 'anime', name: 'Anime', description: 'Specialized for anime/cartoon' },
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
        const img = new Image();
        img.onload = () => {
          const job: UpscaleJob = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            originalImage: e.target?.result as string,
            originalSize: { width: img.width, height: img.height },
            scale: selectedScale,
            enhanceType: selectedEnhanceType,
            status: 'uploading',
            progress: 0,
            createdAt: new Date(),
          };

          setJobs((prev) => [...prev, job]);
          processUpscale(job.id);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processUpscale = async (jobId: string) => {
    try {
      // UI: show upload progress
      for (let progress = 0; progress <= 40; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 80));
        setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, progress } : job)));
      }

      setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, status: 'processing' } : job)));

      // Call Together-backed upscale API
      const job = jobs.find((j) => j.id === jobId);
      if (!job) throw new Error('Job not found');

      const blob = await (await fetch(job.originalImage)).blob();
      const form = new FormData();
      form.append('file', blob, `upload-${jobId}.png`);
      form.append('scale', String(job.scale));
      form.append('enhanceType', job.enhanceType);

      const res = await fetch('/api/ai/image-upscale', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upscale failed');

      for (let progress = 40; progress <= 100; progress += 15) {
        await new Promise((resolve) => setTimeout(resolve, 120));
        setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, progress } : job)));
      }

      setJobs((prev) =>
        prev.map((j) => {
          if (j.id === jobId) {
            const resultSize = {
              width: j.originalSize.width * j.scale,
              height: j.originalSize.height * j.scale,
            };
            return { ...j, status: 'completed', progress: 100, resultImage: data.imageUrl, resultSize };
          }
          return j;
        })
      );

      toast({ title: 'Image upscaled successfully!', description: 'Your enhanced image is ready.' });
    } catch (error) {
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, status: 'error', progress: 0 } : job))
      );

      toast({ title: 'Upscaling failed', description: 'Please try again later.', variant: 'destructive' });
    }
  };

  const removeJob = (jobId: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
  };

  const downloadImage = async (imageUrl: string, jobId: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `upscaled_${jobId}.jpg`;
      a.click();

      URL.revokeObjectURL(url);

      toast({
        title: 'Download started',
        description: 'Your upscaled image is being downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const retryJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? { ...job, status: 'uploading', progress: 0, resultImage: undefined, resultSize: undefined }
          : job
      )
    );
    processUpscale(jobId);
  };

  const getStatusColor = (status: UpscaleJob['status']) => {
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

  const formatFileSize = (width: number, height: number) => {
    return `${width} × ${height}`;
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-3 mb-4'>
            <div className='p-2 bg-cyan-100 rounded-lg'>
              <Zap className='size-6 text-cyan-600' />
            </div>
            <div>
              <h1 className='text-3xl font-bold'>Image Upscaler & Enhancer</h1>
              <p className='text-muted-foreground'>Enhance and upscale images with AI</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Settings Panel */}
          <div className='lg:col-span-1'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <ZoomIn className='size-5' />
                  Upscale Settings
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Scale Selection */}
                <div className='space-y-3'>
                  <label className='text-sm font-medium'>Upscale Factor</label>
                  <div className='space-y-2'>
                    {scaleOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={selectedScale === option.value ? 'default' : 'outline'}
                        onClick={() => setSelectedScale(option.value)}
                        className='w-full justify-start h-auto p-3'>
                        <div className='text-left'>
                          <div className='font-medium'>{option.label}</div>
                          <div className='text-xs text-muted-foreground'>{option.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Enhancement Type */}
                <div className='space-y-3'>
                  <label className='text-sm font-medium'>Enhancement Type</label>
                  <select
                    value={selectedEnhanceType}
                    onChange={(e) => setSelectedEnhanceType(e.target.value)}
                    className='w-full p-2 border border-input rounded-md bg-background'>
                    {enhanceTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upload Button */}
                <div className='space-y-3'>
                  <label className='text-sm font-medium'>Upload Images</label>
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
                    Choose Images
                  </Button>
                  <p className='text-xs text-muted-foreground'>Supported formats: JPG, PNG, WebP</p>
                </div>

                {/* Current Settings Display */}
                <div className='p-3 bg-muted rounded-lg'>
                  <h4 className='font-medium text-sm mb-2'>Current Settings:</h4>
                  <div className='space-y-1 text-xs text-muted-foreground'>
                    <div>Scale: {selectedScale}x upscale</div>
                    <div>Type: {enhanceTypes.find((t) => t.id === selectedEnhanceType)?.name}</div>
                  </div>
                </div>

                {/* Tips */}
                <div className='p-3 bg-muted rounded-lg'>
                  <h4 className='font-medium text-sm mb-2'>Tips for best results:</h4>
                  <ul className='text-xs text-muted-foreground space-y-1'>
                    <li>• Use high-quality source images</li>
                    <li>• Choose appropriate enhancement type</li>
                    <li>• Higher scales take longer to process</li>
                    <li>• Photos work best at 2x-4x scale</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Jobs Panel */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Sparkles className='size-5' />
                  Upscale Jobs ({jobs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className='text-center py-12'>
                    <ImageIcon className='size-16 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-semibold mb-2'>No images uploaded yet</h3>
                    <p className='text-muted-foreground mb-4'>
                      Upload images to enhance and upscale them with AI
                    </p>
                    <div className='grid grid-cols-2 gap-2 max-w-sm mx-auto'>
                      {scaleOptions.slice(0, 2).map((option) => (
                        <Badge key={option.value} variant='outline' className='justify-center p-2'>
                          {option.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className='space-y-6'>
                    {jobs.map((job) => (
                      <div key={job.id} className='border rounded-lg p-6'>
                        {/* Job Header */}
                        <div className='flex items-center justify-between mb-4'>
                          <div className='flex items-center space-x-3'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={job.originalImage}
                              alt='Original'
                              className='w-16 h-12 rounded object-cover'
                            />
                            <div>
                              <div className='flex items-center space-x-2'>
                                <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                                <Badge variant='outline'>{job.scale}x upscale</Badge>
                                <Badge variant='outline'>
                                  {enhanceTypes.find((t) => t.id === job.enhanceType)?.name}
                                </Badge>
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                Original: {formatFileSize(job.originalSize.width, job.originalSize.height)}
                                {job.resultSize &&
                                  ` → ${formatFileSize(job.resultSize.width, job.resultSize.height)}`}
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
                                {job.status === 'uploading' ? 'Uploading' : 'Enhancing'}... {job.progress}%
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Results */}
                        {job.status === 'completed' && job.resultImage && (
                          <div className='space-y-4'>
                            <div className='flex items-center space-x-2 text-green-600'>
                              <CheckCircle className='size-4' />
                              <span className='text-sm font-medium'>Image enhanced successfully</span>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                              <div>
                                <h5 className='text-sm font-medium mb-2'>Original</h5>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={job.originalImage}
                                  alt='Original'
                                  className='w-full aspect-video object-cover rounded-lg border'
                                />
                                <p className='text-xs text-muted-foreground mt-1 text-center'>
                                  {formatFileSize(job.originalSize.width, job.originalSize.height)}
                                </p>
                              </div>
                              <div>
                                <h5 className='text-sm font-medium mb-2'>Enhanced ({job.scale}x)</h5>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={job.resultImage}
                                  alt='Enhanced'
                                  className='w-full aspect-video object-cover rounded-lg border'
                                />
                                <p className='text-xs text-muted-foreground mt-1 text-center'>
                                  {job.resultSize &&
                                    formatFileSize(job.resultSize.width, job.resultSize.height)}
                                </p>
                              </div>
                            </div>
                            <div className='flex space-x-2'>
                              <Button
                                onClick={() => downloadImage(job.resultImage!, job.id)}
                                className='flex-1'>
                                <Download className='size-4 mr-2' />
                                Download Enhanced
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Error State */}
                        {job.status === 'error' && (
                          <div className='text-center py-6 text-red-500'>
                            <X className='size-12 mx-auto mb-2' />
                            <p className='text-sm mb-3'>Enhancement failed</p>
                            <Button variant='outline' size='sm' onClick={() => retryJob(job.id)}>
                              <RefreshCw className='size-4 mr-2' />
                              Retry
                            </Button>
                          </div>
                        )}

                        <p className='text-xs text-muted-foreground mt-4'>
                          Created: {job.createdAt.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhancement Guide */}
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>Enhancement Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {enhanceTypes.map((type) => (
                <div key={type.id} className='space-y-2'>
                  <h4 className='font-semibold'>{type.name}</h4>
                  <p className='text-sm text-muted-foreground'>{type.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
