'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Video, Play, Pause, Download, Loader2, User, Mic } from 'lucide-react';
import { downloadFromUrl, generateUniqueFilename } from '@/lib/utils/download';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';

interface Avatar {
  id: string;
  name: string;
  gender: 'male' | 'female';
  style: string;
  thumbnail: string;
}

interface TalkingVideo {
  id: string;
  script: string;
  avatar: Avatar;
  voice: string;
  videoUrl: string;
  status: 'generating' | 'completed' | 'failed';
  duration: number;
  createdAt: Date;
}

export default function TalkingVideosPage() {
  const { user } = useAuth();
  const [script, setScript] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('professional-female');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<TalkingVideo[]>([]);

  const avatars: Avatar[] = [
    { id: '1', name: 'Emma', gender: 'female', style: 'Professional', thumbnail: '/avatars/emma.jpg' },
    { id: '2', name: 'David', gender: 'male', style: 'Business', thumbnail: '/avatars/david.jpg' },
    { id: '3', name: 'Sarah', gender: 'female', style: 'Casual', thumbnail: '/avatars/sarah.jpg' },
    { id: '4', name: 'Michael', gender: 'male', style: 'Formal', thumbnail: '/avatars/michael.jpg' },
    { id: '5', name: 'Lisa', gender: 'female', style: 'Friendly', thumbnail: '/avatars/lisa.jpg' },
    { id: '6', name: 'James', gender: 'male', style: 'Technical', thumbnail: '/avatars/james.jpg' },
  ];

  const voices = [
    { id: 'professional-female', name: 'Professional Female', gender: 'female', accent: 'American' },
    { id: 'professional-male', name: 'Professional Male', gender: 'male', accent: 'American' },
    { id: 'friendly-female', name: 'Friendly Female', gender: 'female', accent: 'British' },
    { id: 'friendly-male', name: 'Friendly Male', gender: 'male', accent: 'British' },
    { id: 'energetic-female', name: 'Energetic Female', gender: 'female', accent: 'Australian' },
    { id: 'calm-male', name: 'Calm Male', gender: 'male', accent: 'Canadian' },
  ];

  const handleGenerate = async () => {
    if (!script.trim() || !selectedAvatar) return;

    setIsGenerating(true);

    const newVideo: TalkingVideo = {
      id: Date.now().toString(),
      script: script.trim(),
      avatar: selectedAvatar,
      voice: selectedVoice,
      videoUrl: '',
      status: 'generating',
      duration: Math.ceil((script.trim().split(' ').length / 150) * 60), // Estimate duration
      createdAt: new Date(),
    };

    setGeneratedVideos((prev) => [newVideo, ...prev]);

    try {
      const response = await fetch('/api/ai/generate-talking-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: script.trim(),
          avatarId: selectedAvatar.id,
          voiceId: selectedVoice,
          userId: user?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedVideo = {
          ...newVideo,
          videoUrl: data.video_url,
          status: data.status || 'completed',
          note: data.note,
          provider: data.provider,
          heygenVideoId: data.metadata?.heygen_video_id,
        };

        setGeneratedVideos((prev) => prev.map((v) => (v.id === newVideo.id ? updatedVideo : v)));

        // If HeyGen video is processing, start polling for status
        if (data.provider === 'heygen' && data.status === 'processing' && data.metadata?.heygen_video_id) {
          pollHeyGenStatus(newVideo.id, data.metadata.heygen_video_id);
        }
      } else {
        throw new Error(data.message || 'Video generation failed');
      }
    } catch (error) {
      console.error('Talking video generation error:', error);
      setGeneratedVideos((prev) =>
        prev.map((video) => (video.id === newVideo.id ? { ...video, status: 'failed' } : video))
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadVideo = async (videoUrl: string, script: string) => {
    try {
      if (!videoUrl || videoUrl === 'null' || videoUrl === null) {
        toast.error('No video URL available for download');
        return;
      }

      const filename = generateUniqueFilename(script.replace(/[^a-zA-Z0-9]/g, '_'), 'mp4');
      await downloadFromUrl(videoUrl, filename);
      toast.success('Video downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download video');
    }
  };

  // Poll HeyGen video status
  const pollHeyGenStatus = async (videoId: string, heygenVideoId: string) => {
    const maxAttempts = 30; // Poll for up to 5 minutes (10s intervals)
    let attempts = 0;

    const checkStatus = async () => {
      try {
        attempts++;
        console.log(`Polling HeyGen status (${attempts}/${maxAttempts}):`, heygenVideoId);

        const statusResponse = await fetch(`/api/ai/heygen-status?video_id=${heygenVideoId}`);

        if (!statusResponse.ok) {
          throw new Error(`Status check failed: ${statusResponse.status}`);
        }

        const statusData = await statusResponse.json();
        console.log('HeyGen status data:', statusData);

        if (statusData.status === 'completed' && statusData.video_url) {
          // Update video with final URL
          setGeneratedVideos((prev) =>
            prev.map((video) =>
              video.id === videoId
                ? {
                    ...video,
                    videoUrl: statusData.video_url,
                    status: 'completed',
                    note: `✅ HeyGen video generation completed! Your talking video is ready to download.`,
                  }
                : video
            )
          );
          toast.success('Talking video generation completed!');
          return; // Stop polling
        }

        if (statusData.status === 'failed') {
          // Update video status to failed
          setGeneratedVideos((prev) =>
            prev.map((video) =>
              video.id === videoId
                ? {
                    ...video,
                    status: 'failed',
                    note: `❌ Video generation failed: ${statusData.error_message || 'Unknown error'}`,
                  }
                : video
            )
          );
          toast.error('Video generation failed');
          return; // Stop polling
        }

        // Continue polling if still processing
        if (statusData.status === 'processing' && attempts < maxAttempts) {
          // Update progress if available
          setGeneratedVideos((prev) =>
            prev.map((video) =>
              video.id === videoId
                ? {
                    ...video,
                    note: `🔄 Generating video... ${statusData.progress || 0}% complete`,
                  }
                : video
            )
          );

          setTimeout(checkStatus, 10000); // Check again in 10 seconds
        } else if (attempts >= maxAttempts) {
          // Timeout
          setGeneratedVideos((prev) =>
            prev.map((video) =>
              video.id === videoId
                ? {
                    ...video,
                    status: 'failed',
                    note: '⏰ Video generation timed out. Please try again.',
                  }
                : video
            )
          );
          toast.error('Video generation timed out');
        }
      } catch (error) {
        console.error('Status polling error:', error);

        if (attempts >= maxAttempts) {
          setGeneratedVideos((prev) =>
            prev.map((video) =>
              video.id === videoId
                ? {
                    ...video,
                    status: 'failed',
                    note: '❌ Failed to check video status',
                  }
                : video
            )
          );
          toast.error('Failed to check video status');
        } else {
          // Retry on error
          setTimeout(checkStatus, 10000);
        }
      }
    };

    // Start polling
    setTimeout(checkStatus, 5000); // Wait 5 seconds before first check
  };

  const estimatedDuration = script.trim() ? Math.ceil((script.trim().split(' ').length / 150) * 60) : 0;

  return (
    <div className='p-6 max-w-7xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <User className='size-8' />
            AI Talking Videos
          </h1>
          <p className='text-muted-foreground mt-1'>
            Create professional talking head videos with AI avatars and natural voices
          </p>
        </div>
        <Badge variant='secondary' className='px-3 py-1'>
          <Video className='size-4 mr-1' />
          New
        </Badge>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Video Generation Form */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Script Input */}
          <Card>
            <CardHeader>
              <CardTitle>Video Script</CardTitle>
              <CardDescription>Write the script for your talking head video</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='script'>Script Content</Label>
                <Textarea
                  id='script'
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Hello! Welcome to our presentation. Today I'll be talking about the benefits of AI technology and how it can transform your business operations..."
                  className='min-h-[150px] mt-2'
                />
                <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                  <span>Be clear and natural - this will be spoken by the avatar</span>
                  <span>
                    {script.trim().split(' ').length} words • ~{estimatedDuration}s duration
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avatar Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Avatar</CardTitle>
              <CardDescription>Select an AI avatar to present your content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                {avatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    className={`relative border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedAvatar?.id === avatar.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedAvatar(avatar)}>
                    <div className='aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-2 flex items-center justify-center'>
                      <User className='size-8 text-blue-600' />
                    </div>
                    <div className='text-center'>
                      <h3 className='font-medium text-sm'>{avatar.name}</h3>
                      <p className='text-xs text-muted-foreground'>{avatar.style}</p>
                      <Badge variant='outline' className='text-xs mt-1'>
                        {avatar.gender}
                      </Badge>
                    </div>
                    {selectedAvatar?.id === avatar.id && (
                      <div className='absolute top-2 right-2 size-6 bg-primary rounded-full flex items-center justify-center'>
                        <div className='size-2 bg-white rounded-full'></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Voice Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Voice Settings</CardTitle>
              <CardDescription>Choose the voice for your avatar</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Voice Type</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className='mt-2'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className='flex items-center justify-between w-full'>
                          <span>{voice.name}</span>
                          <div className='flex items-center gap-2 ml-4'>
                            <Badge variant='outline' className='text-xs'>
                              {voice.accent}
                            </Badge>
                            <Mic className='size-3' />
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!script.trim() || !selectedAvatar || isGenerating}
                className='w-full mt-4'>
                {isGenerating ? (
                  <>
                    <Loader2 className='size-4 mr-2 animate-spin' />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Play className='size-4 mr-2' />
                    Generate Talking Video
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Video Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAvatar ? (
                <div className='space-y-3'>
                  <div className='aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center'>
                    <User className='size-12 text-blue-600' />
                  </div>
                  <div className='text-center'>
                    <h3 className='font-medium'>{selectedAvatar.name}</h3>
                    <p className='text-sm text-muted-foreground'>{selectedAvatar.style} Style</p>
                  </div>
                  <div className='text-xs text-muted-foreground space-y-1'>
                    <div className='flex justify-between'>
                      <span>Avatar:</span>
                      <span>{selectedAvatar.name}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Voice:</span>
                      <span>{voices.find((v) => v.id === selectedVoice)?.name}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Duration:</span>
                      <span>~{estimatedDuration}s</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='aspect-video bg-muted rounded-lg flex items-center justify-center'>
                  <div className='text-center'>
                    <User className='size-8 text-muted-foreground mx-auto mb-2' />
                    <p className='text-sm text-muted-foreground'>Select an avatar to preview</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='text-sm space-y-2'>
                <p>• Write natural, conversational scripts</p>
                <p>• Include pauses with commas and periods</p>
                <p>• Keep sentences clear and concise</p>
                <p>• Match avatar style to your content tone</p>
                <p>• Preview estimated duration before generating</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generated Videos */}
      {generatedVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Talking Videos</CardTitle>
            <CardDescription>Your AI-generated talking head videos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {generatedVideos.map((video) => (
                <div key={video.id} className='border rounded-lg p-4 space-y-3'>
                  <div className='aspect-video bg-muted rounded-lg flex items-center justify-center'>
                    {video.status === 'generating' ? (
                      <div className='text-center'>
                        <Loader2 className='size-8 animate-spin mx-auto mb-2' />
                        <p className='text-sm text-muted-foreground'>Generating...</p>
                      </div>
                    ) : video.status === 'completed' ? (
                      <video
                        className='w-full h-full object-cover rounded'
                        controls
                        poster='/api/placeholder/320/180'>
                        <source src={video.videoUrl} type='video/mp4' />
                      </video>
                    ) : (
                      <div className='text-center'>
                        <User className='size-8 mx-auto mb-2 text-muted-foreground' />
                        <p className='text-sm text-red-500'>Generation failed</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className='font-medium text-sm truncate'>{video.script}</p>
                    <div className='flex items-center justify-between mt-2 text-xs text-muted-foreground'>
                      <span>{video.avatar.name}</span>
                      <span>{video.duration}s</span>
                    </div>
                  </div>

                  {video.status === 'completed' && (
                    <div className='space-y-2'>
                      {video.videoUrl ? (
                        <Button
                          variant='outline'
                          size='sm'
                          className='w-full'
                          onClick={() => downloadVideo(video.videoUrl, video.script)}>
                          <Download className='size-4 mr-2' />
                          Download
                        </Button>
                      ) : (
                        <div className='text-center'>
                          <Button variant='outline' size='sm' className='w-full' disabled>
                            <Download className='size-4 mr-2' />
                            Demo Mode - No Download
                          </Button>
                          <p className='text-xs text-muted-foreground mt-1'>
                            Configure talking video API for real downloads
                          </p>
                        </div>
                      )}
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
