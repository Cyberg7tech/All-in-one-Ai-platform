'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Music, Play, Pause, Download, Loader2, Copy, RotateCcw, Clock, Volume2, Wand2 } from 'lucide-react'
import { downloadAudioData, copyToClipboard, generateUniqueFilename } from '@/lib/utils/download'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'

interface GeneratedMusic {
  id: string
  prompt: string
  genre: string
  mood: string
  duration: number
  audioUrl: string
  status: 'generating' | 'completed' | 'failed'
  createdAt: Date
}

export default function MusicGeneratorPage() {
  const { user } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [genre, setGenre] = useState('pop')
  const [mood, setMood] = useState('upbeat')
  const [duration, setDuration] = useState([30])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [generatedMusic, setGeneratedMusic] = useState<GeneratedMusic[]>([])

  const genres = [
    { value: 'pop', label: 'Pop', description: 'Catchy and mainstream' },
    { value: 'rock', label: 'Rock', description: 'Guitar-driven energy' },
    { value: 'electronic', label: 'Electronic', description: 'Synthesized sounds' },
    { value: 'jazz', label: 'Jazz', description: 'Improvised and smooth' },
    { value: 'classical', label: 'Classical', description: 'Orchestra and piano' },
    { value: 'ambient', label: 'Ambient', description: 'Atmospheric and calming' },
    { value: 'hip-hop', label: 'Hip-Hop', description: 'Rhythmic and urban' },
    { value: 'folk', label: 'Folk', description: 'Acoustic and traditional' },
    { value: 'blues', label: 'Blues', description: 'Soulful and expressive' },
    { value: 'reggae', label: 'Reggae', description: 'Island rhythm' },
  ]

  const moods = [
    { value: 'upbeat', label: 'Upbeat', emoji: '😄' },
    { value: 'relaxed', label: 'Relaxed', emoji: '😌' },
    { value: 'energetic', label: 'Energetic', emoji: '⚡' },
    { value: 'melancholy', label: 'Melancholy', emoji: '😔' },
    { value: 'mysterious', label: 'Mysterious', emoji: '🕵️' },
    { value: 'romantic', label: 'Romantic', emoji: '💕' },
    { value: 'epic', label: 'Epic', emoji: '🎬' },
    { value: 'peaceful', label: 'Peaceful', emoji: '🕊️' },
  ]

  const samplePrompts = [
    "A catchy summer song with guitar and uplifting vocals",
    "Peaceful piano melody for meditation and relaxation",
    "Energetic electronic dance music with heavy bass",
    "Acoustic folk song with storytelling lyrics",
    "Epic orchestral theme for a movie soundtrack",
    "Smooth jazz with saxophone and piano",
    "Ambient soundscape for focus and concentration",
    "Upbeat pop song with modern production"
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    
    const newMusic: GeneratedMusic = {
      id: Date.now().toString(),
      prompt: prompt.trim(),
      genre,
      mood,
      duration: duration[0],
      audioUrl: '',
      status: 'generating',
      createdAt: new Date()
    }

    setGeneratedMusic(prev => [newMusic, ...prev])

    try {
      const response = await fetch('/api/ai/generate-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          genre,
          mood,
          duration: duration[0],
          userId: user?.id
        })
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedMusic(prev => 
          prev.map(music => 
            music.id === newMusic.id 
              ? { ...music, audioUrl: data.audioUrl, status: 'completed' }
              : music
          )
        )
      } else {
        throw new Error(data.message || 'Music generation failed')
      }

    } catch (error) {
      console.error('Music generation error:', error)
      setGeneratedMusic(prev => 
        prev.map(music => 
          music.id === newMusic.id 
            ? { ...music, status: 'failed' }
            : music
        )
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlayPause = (musicId: string, audioUrl: string) => {
    if (isPlaying === musicId) {
      setIsPlaying(null)
      // Pause audio logic here
    } else {
      setIsPlaying(musicId)
      // Play audio logic here
    }
  }

  const downloadAudio = async (audioUrl: string, title: string) => {
    try {
      const filename = generateUniqueFilename(title.replace(/[^a-zA-Z0-9]/g, '_'), 'mp3')
      await downloadAudioData(audioUrl, filename)
      toast.success('Music downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download music')
      console.error('Download error:', error)
    }
  }

  const copyPrompt = async (prompt: string) => {
    try {
      await copyToClipboard(prompt)
      toast.success('Prompt copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy prompt')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Music className="w-8 h-8" />
            AI Music Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Create original music compositions using AI technology
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Wand2 className="w-4 h-4 mr-1" />
          New
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Music Generation Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Music Description</CardTitle>
              <CardDescription>
                Describe the music you want to create
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prompt">Music Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A relaxing piano melody with soft strings in the background, perfect for a peaceful evening..."
                  className="min-h-[100px] mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Describe instruments, style, energy level, and mood
                </p>
              </div>

              {/* Sample Prompts */}
              <div>
                <Label>Quick Start Examples</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {samplePrompts.slice(0, 4).map((sample, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2 px-3"
                      onClick={() => setPrompt(sample)}
                    >
                      <div className="truncate">{sample}</div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Music Settings</CardTitle>
              <CardDescription>
                Customize the style and characteristics of your music
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Genre Selection */}
              <div>
                <Label>Genre</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {genres.slice(0, 6).map((genreOption) => (
                    <div
                      key={genreOption.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        genre === genreOption.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setGenre(genreOption.value)}
                    >
                      <div className="font-medium text-sm">{genreOption.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {genreOption.description}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="mt-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genreOption) => (
                      <SelectItem key={genreOption.value} value={genreOption.value}>
                        {genreOption.label} - {genreOption.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mood Selection */}
              <div>
                <Label>Mood</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {moods.map((moodOption) => (
                    <div
                      key={moodOption.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors text-center ${
                        mood === moodOption.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setMood(moodOption.value)}
                    >
                      <div className="text-lg mb-1">{moodOption.emoji}</div>
                      <div className="font-medium text-sm">{moodOption.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label>Duration (seconds)</Label>
                <div className="mt-2">
                  <Slider
                    value={duration}
                    onValueChange={setDuration}
                    max={120}
                    min={15}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>15s</span>
                    <span>{duration[0]}s</span>
                    <span>2 min</span>
                  </div>
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
                    Generating Music...
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4 mr-2" />
                    Generate Music
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Genre:</span>
                  <span className="capitalize">{genre}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Mood:</span>
                  <span className="capitalize">{mood}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Duration:</span>
                  <span>{duration[0]}s</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Music Creation Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-2">
                <p>• Specify instruments you want to hear</p>
                <p>• Mention the energy level (calm, energetic, etc.)</p>
                <p>• Describe the intended use (background, dance, etc.)</p>
                <p>• Include tempo preferences (slow, fast, medium)</p>
                <p>• Mention any musical elements you want</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Genres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {genres.slice(0, 5).map((g) => (
                  <div key={g.value} className="flex justify-between text-sm">
                    <span>{g.label}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setGenre(g.value)}
                      className="h-6 px-2 text-xs"
                    >
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generated Music */}
      {generatedMusic.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Music</CardTitle>
            <CardDescription>
              Your AI-generated music compositions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedMusic.map((music) => (
                <div key={music.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-2">{music.prompt}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          {music.genre}
                        </span>
                        <span>{music.mood}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {music.duration}s
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {music.status === 'generating' ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Generating...</span>
                        </div>
                      ) : music.status === 'completed' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePlayPause(music.id, music.audioUrl)}
                          >
                            {isPlaying === music.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => downloadAudio(music.audioUrl, music.prompt)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => copyPrompt(music.prompt)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-red-500 text-sm">Generation failed</span>
                      )}
                    </div>
                  </div>

                  {music.status === 'completed' && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1 h-2 bg-muted-foreground/20 rounded-full">
                          <div className="h-full bg-primary rounded-full w-0 transition-all duration-300"></div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          0:00 / {Math.floor(music.duration / 60)}:{(music.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
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