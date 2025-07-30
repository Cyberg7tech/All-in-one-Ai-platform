'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Play, Download, Loader2, Video, Clock, Settings, Wand2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { downloadFromUrl, generateUniqueFilename } from '@/lib/utils/download'
import { toast } from 'sonner'

interface GeneratedVideo {
  id: string
  prompt: string
  videoUrl: string
  duration: number
  style: string
  resolution: string
  status: 'generating' | 'completed' | 'failed'
  createdAt: Date
}

export default function VideoGeneratorPage() {
  const { user } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [duration, setDuration] = useState([10])
  const [resolution, setResolution] = useState('1080p')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([])

  const videoStyles = [
    { value: 'realistic', label: 'Realistic', description: 'Photorealistic video generation' },
    { value: 'animation', label: 'Animation', description: 'Animated cartoon style' },
    { value: 'cinematic', label: 'Cinematic', description: 'Movie-like quality' },
    { value: 'abstract', label: 'Abstract', description: 'Artistic and creative' },
    { value: 'vintage', label: 'Vintage', description: 'Retro film aesthetics' },
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    
    const newVideo: GeneratedVideo = {
      id: Date.now().toString(),
      prompt: prompt.trim(),
      videoUrl: '', // Will be populated after generation
      duration: duration[0],
      style,
      resolution,
      status: 'generating',
      createdAt: new Date()
    }

    setGeneratedVideos(prev => [newVideo, ...prev])

    try {
      const response = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          duration: duration[0],
          resolution,
          aspectRatio,
          userId: user?.id
        })
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedVideos(prev => 
          prev.map(video => 
            video.id === newVideo.id 
              ? { 
                  ...video, 
                  videoUrl: data.video_url, // Fix property name from API response
                  status: 'completed',
                  note: data.note // Add note for demo responses
                }
              : video
          )
        )
      } else {
        throw new Error(data.message || 'Video generation failed')
      }

    } catch (error) {
      console.error('Video generation error:', error)
      setGeneratedVideos(prev => 
        prev.map(video => 
          video.id === newVideo.id 
            ? { ...video, status: 'failed' }
            : video
        )
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadVideo = async (videoUrl: string, prompt: string) => {
    try {
      if (!videoUrl || videoUrl === 'null' || videoUrl === null) {
        toast.error('No video URL available for download')
        return
      }
      
      const filename = generateUniqueFilename(prompt.replace(/[^a-zA-Z0-9]/g, '_'), 'mp4')
      await downloadFromUrl(videoUrl, filename)
      toast.success('Video downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download video')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Video className="w-8 h-8" />
            AI Video Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate professional videos from text descriptions using advanced AI
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Wand2 className="w-4 h-4 mr-1" />
          New
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Generation Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Video</CardTitle>
              <CardDescription>
                Describe the video you want to create and customize the settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prompt Input */}
              <div>
                <Label htmlFor="prompt">Video Description</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A serene sunrise over a mountain lake with mist rising from the water, birds flying overhead, cinematic quality..."
                  className="min-h-[100px] mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Be specific and descriptive for better results
                </p>
              </div>

              {/* Style Selection */}
              <div>
                <Label>Video Style</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {videoStyles.map((styleOption) => (
                    <div
                      key={styleOption.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        style === styleOption.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setStyle(styleOption.value)}
                    >
                      <div className="font-medium">{styleOption.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {styleOption.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Duration (seconds)</Label>
                  <div className="mt-2">
                    <Slider
                      value={duration}
                      onValueChange={setDuration}
                      max={30}
                      min={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>5s</span>
                      <span>{duration[0]}s</span>
                      <span>30s</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Resolution</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p (HD)</SelectItem>
                      <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                      <SelectItem value="4k">4K (Ultra HD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                      <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                      <SelectItem value="1:1">1:1 (Square)</SelectItem>
                      <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={!prompt.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Generate Video
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Settings & Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quick Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <div className="flex justify-between mb-2">
                  <span>Style:</span>
                  <span className="capitalize">{style}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Duration:</span>
                  <span>{duration[0]}s</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Resolution:</span>
                  <span>{resolution}</span>
                </div>
                <div className="flex justify-between">
                  <span>Aspect Ratio:</span>
                  <span>{aspectRatio}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p>• Be specific about scenes, lighting, and camera angles</p>
                <p>• Mention the mood and atmosphere you want</p>
                <p>• Include details about subjects and actions</p>
                <p>• Use cinematic terms for better quality</p>
                <p>• Longer descriptions often yield better results</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generated Videos */}
      {generatedVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Videos</CardTitle>
            <CardDescription>
              Your AI-generated videos will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedVideos.map((video) => (
                <div key={video.id} className="border rounded-lg p-4 space-y-3">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    {video.status === 'generating' ? (
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Generating...</p>
                      </div>
                    ) : video.status === 'completed' ? (
                      <video 
                        className="w-full h-full object-cover rounded"
                        controls
                        poster="/api/placeholder/320/180"
                      >
                        <source src={video.videoUrl} type="video/mp4" />
                      </video>
                    ) : (
                      <div className="text-center">
                        <Video className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-red-500">Generation failed</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium text-sm truncate">{video.prompt}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {video.duration}s
                      </span>
                      <span className="capitalize">{video.style}</span>
                    </div>
                  </div>

                  {video.status === 'completed' && (
                    <div className="space-y-2">
                      {video.videoUrl ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full" 
                          onClick={() => downloadVideo(video.videoUrl, video.prompt)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      ) : (
                        <div className="text-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full" 
                            disabled
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Demo Mode - No Download
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">
                            Configure video generation API for real downloads
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
  )
} 