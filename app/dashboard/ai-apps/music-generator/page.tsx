'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Music, Wand2, Play, Pause, Download, Copy, Trash2, Loader2, Heart, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MusicTrack {
  id: string;
  prompt: string;
  title: string;
  genre: string;
  mood: string;
  duration: number;
  tempo: number;
  status: 'generating' | 'completed' | 'error';
  audioUrl?: string;
  isPlaying: boolean;
  isLiked: boolean;
  createdAt: Date;
}

export default function MusicGeneratorPage() {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [prompt, setPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('electronic');
  const [selectedMood, setSelectedMood] = useState('upbeat');
  const [duration, setDuration] = useState([30]);
  const [tempo, setTempo] = useState([120]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const { toast } = useToast();

  const genres = [
    { id: 'electronic', name: 'Electronic', description: 'Synth, EDM, ambient' },
    { id: 'jazz', name: 'Jazz', description: 'Smooth, improvisational' },
    { id: 'classical', name: 'Classical', description: 'Orchestral, traditional' },
    { id: 'rock', name: 'Rock', description: 'Guitar-driven, energetic' },
    { id: 'pop', name: 'Pop', description: 'Catchy, mainstream' },
    { id: 'hip-hop', name: 'Hip-Hop', description: 'Rhythmic, urban' },
    { id: 'folk', name: 'Folk', description: 'Acoustic, storytelling' },
    { id: 'ambient', name: 'Ambient', description: 'Atmospheric, peaceful' },
  ];

  const moods = [
    { id: 'upbeat', name: 'Upbeat', emoji: '😊' },
    { id: 'calm', name: 'Calm', emoji: '😌' },
    { id: 'energetic', name: 'Energetic', emoji: '⚡' },
    { id: 'melancholic', name: 'Melancholic', emoji: '😔' },
    { id: 'mysterious', name: 'Mysterious', emoji: '🔮' },
    { id: 'romantic', name: 'Romantic', emoji: '💕' },
    { id: 'epic', name: 'Epic', emoji: '🎭' },
    { id: 'relaxing', name: 'Relaxing', emoji: '🧘' },
  ];

  const promptSuggestions = [
    'A dreamy synthwave track perfect for late night drives',
    'Uplifting orchestral piece with soaring melodies',
    'Chill lo-fi hip-hop beats for studying',
    'Epic cinematic music for an adventure scene',
    'Peaceful acoustic guitar with nature sounds',
    'Energetic electronic dance music for workouts',
  ];

  const generateMusic = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Please enter a prompt',
        description: 'Describe the music you want to generate.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    const track: MusicTrack = {
      id: Date.now().toString(),
      prompt: prompt.trim(),
      title: generateTitle(prompt.trim(), selectedGenre),
      genre: selectedGenre,
      mood: selectedMood,
      duration: duration[0],
      tempo: tempo[0],
      status: 'generating',
      isPlaying: false,
      isLiked: false,
      createdAt: new Date(),
    };

    setTracks((prev) => [track, ...prev]);

    try {
      const res = await fetch('/api/ai/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: track.prompt,
          genre: track.genre,
          mood: track.mood,
          duration: track.duration,
          tempo: track.tempo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Music generation failed');

      setTracks((prev) =>
        prev.map((t) =>
          t.id === track.id
            ? {
                ...t,
                status: 'completed',
                audioUrl: data?.track?.url,
              }
            : t
        )
      );

      setPrompt('');

      toast({
        title: 'Music generated successfully!',
        description: 'Your AI-generated track is ready to play.',
      });
    } catch (error) {
      setTracks((prev) => prev.map((t) => (t.id === track.id ? { ...t, status: 'error' } : t)));

      toast({
        title: 'Error generating music',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTitle = (prompt: string, genre: string) => {
    const words = prompt.split(' ').slice(0, 3);
    const genreName = genres.find((g) => g.id === genre)?.name || '';
    return `${words.join(' ')} (${genreName})`;
  };

  const togglePlayback = (trackId: string) => {
    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null);
      setTracks((prev) => prev.map((t) => ({ ...t, isPlaying: false })));
    } else {
      setCurrentlyPlaying(trackId);
      setTracks((prev) =>
        prev.map((t) => ({
          ...t,
          isPlaying: t.id === trackId,
        }))
      );
    }
  };

  const stopPlayback = () => {
    setCurrentlyPlaying(null);
    setTracks((prev) => prev.map((t) => ({ ...t, isPlaying: false })));
  };

  const downloadTrack = (track: MusicTrack) => {
    if (!track.audioUrl) return;

    const a = document.createElement('a');
    a.href = track.audioUrl;
    a.download = `${track.title.replace(/[^a-zA-Z0-9]/g, '_')}.wav`;
    a.click();

    toast({
      title: 'Download started',
      description: 'Your music track is being downloaded.',
    });
  };

  const toggleLike = (trackId: string) => {
    setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, isLiked: !t.isLiked } : t)));
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: 'Copied to clipboard',
      description: 'Prompt has been copied.',
    });
  };

  const deleteTrack = (trackId: string) => {
    if (currentlyPlaying === trackId) {
      stopPlayback();
    }
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    toast({
      title: 'Track deleted',
      description: 'The music track has been removed.',
    });
  };

  const retryGeneration = (track: MusicTrack) => {
    setPrompt(track.prompt);
    setSelectedGenre(track.genre);
    setSelectedMood(track.mood);
    setDuration([track.duration]);
    setTempo([track.tempo]);
    generateMusic();
  };

  const handleSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-3 mb-4'>
            <div className='p-2 bg-purple-100 rounded-lg'>
              <Music className='size-6 text-purple-600' />
            </div>
            <div>
              <h1 className='text-3xl font-bold'>Music Generator</h1>
              <p className='text-muted-foreground'>Create original music compositions with AI</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Generator Panel */}
          <div className='lg:col-span-1'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Wand2 className='size-5' />
                  Music Settings
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Prompt */}
                <div className='space-y-3'>
                  <Label htmlFor='prompt'>Music Description</Label>
                  <Textarea
                    id='prompt'
                    placeholder='Describe the music you want to generate...'
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Genre */}
                <div className='space-y-3'>
                  <Label>Genre</Label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className='w-full p-2 border border-input rounded-md bg-background'>
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.id}>
                        {genre.name} - {genre.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mood */}
                <div className='space-y-3'>
                  <Label>Mood</Label>
                  <div className='grid grid-cols-2 gap-2'>
                    {moods.map((mood) => (
                      <Button
                        key={mood.id}
                        variant={selectedMood === mood.id ? 'default' : 'outline'}
                        onClick={() => setSelectedMood(mood.id)}
                        className='justify-start'
                        size='sm'>
                        <span className='mr-2'>{mood.emoji}</span>
                        {mood.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className='space-y-3'>
                  <Label>Duration: {duration[0]}s</Label>
                  <Slider
                    value={duration}
                    onValueChange={setDuration}
                    max={120}
                    min={15}
                    step={15}
                    className='w-full'
                  />
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>15s</span>
                    <span>120s</span>
                  </div>
                </div>

                {/* Tempo */}
                <div className='space-y-3'>
                  <Label>Tempo: {tempo[0]} BPM</Label>
                  <Slider
                    value={tempo}
                    onValueChange={setTempo}
                    max={180}
                    min={60}
                    step={10}
                    className='w-full'
                  />
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>60 BPM</span>
                    <span>180 BPM</span>
                  </div>
                </div>

                {/* Generate Button */}
                <Button onClick={generateMusic} disabled={isGenerating || !prompt.trim()} className='w-full'>
                  {isGenerating ? (
                    <>
                      <Loader2 className='size-4 mr-2 animate-spin' />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Music className='size-4 mr-2' />
                      Generate Music
                    </>
                  )}
                </Button>

                {/* Suggestions */}
                <div className='space-y-3'>
                  <Label>Inspiration</Label>
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

          {/* Generated Music */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='flex items-center gap-2'>
                    <Music className='size-5' />
                    Generated Music ({tracks.length})
                  </CardTitle>
                  {tracks.length > 0 && (
                    <Button variant='outline' size='sm' onClick={() => setTracks([])}>
                      <Trash2 className='size-4 mr-2' />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {tracks.length === 0 ? (
                  <div className='text-center py-12'>
                    <Music className='size-16 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-semibold mb-2'>No music generated yet</h3>
                    <p className='text-muted-foreground mb-4'>
                      Describe your musical vision and let AI create it for you
                    </p>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md mx-auto'>
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
                ) : (
                  <div className='space-y-4'>
                    {tracks.map((track) => (
                      <div key={track.id} className='border rounded-lg p-4'>
                        {/* Track Header */}
                        <div className='flex items-center justify-between mb-3'>
                          <div className='flex-1'>
                            <h4 className='font-semibold'>{track.title}</h4>
                            <div className='flex items-center space-x-2 mt-1'>
                              <Badge variant='secondary'>
                                {genres.find((g) => g.id === track.genre)?.name}
                              </Badge>
                              <Badge variant='outline'>
                                {moods.find((m) => m.id === track.mood)?.emoji}{' '}
                                {moods.find((m) => m.id === track.mood)?.name}
                              </Badge>
                              <Badge variant='outline'>
                                <Sparkles className='size-3 mr-1' />
                                {formatDuration(track.duration)}
                              </Badge>
                              <Badge variant='outline'>{track.tempo} BPM</Badge>
                            </div>
                          </div>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => deleteTrack(track.id)}
                            className='text-red-500 hover:text-red-700'>
                            <Trash2 className='size-4' />
                          </Button>
                        </div>

                        {/* Prompt */}
                        <div className='mb-4'>
                          <div className='flex items-center justify-between mb-2'>
                            <span className='text-sm font-medium'>Prompt:</span>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => copyPrompt(track.prompt)}
                              className='size-6 p-0'>
                              <Copy className='size-3' />
                            </Button>
                          </div>
                          <p className='text-sm text-muted-foreground p-2 bg-muted rounded'>{track.prompt}</p>
                        </div>

                        {/* Audio Controls */}
                        {track.status === 'completed' && track.audioUrl && (
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-2'>
                              <Button variant='outline' size='sm' onClick={() => togglePlayback(track.id)}>
                                {track.isPlaying ? <Pause className='size-4' /> : <Play className='size-4' />}
                              </Button>
                              {track.isPlaying && (
                                <Button variant='outline' size='sm' onClick={stopPlayback}>
                                  <Sparkles className='size-4' />
                                </Button>
                              )}
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => toggleLike(track.id)}
                                className={track.isLiked ? 'text-red-500' : ''}>
                                <Heart className={`size-4 ${track.isLiked ? 'fill-current' : ''}`} />
                              </Button>
                            </div>
                            <Button variant='outline' size='sm' onClick={() => downloadTrack(track)}>
                              <Download className='size-4 mr-2' />
                              Download
                            </Button>
                          </div>
                        )}

                        {/* Generating State */}
                        {track.status === 'generating' && (
                          <div className='flex items-center justify-center space-x-2 py-4'>
                            <Loader2 className='size-4 animate-spin' />
                            <span className='text-sm text-muted-foreground'>Composing your music...</span>
                          </div>
                        )}

                        {/* Error State */}
                        {track.status === 'error' && (
                          <div className='text-center py-4'>
                            <p className='text-sm text-red-500 mb-3'>Generation failed</p>
                            <Button variant='outline' size='sm' onClick={() => retryGeneration(track)}>
                              <Sparkles className='size-4 mr-2' />
                              Retry
                            </Button>
                          </div>
                        )}

                        <p className='text-xs text-muted-foreground mt-3'>
                          {track.createdAt.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Music Tips */}
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>Music Generation Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Descriptive Prompts</h4>
                <p className='text-sm text-muted-foreground'>
                  Use specific adjectives like "dreamy", "energetic", or "mysterious" to guide the AI's
                  composition.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Instrument Mentions</h4>
                <p className='text-sm text-muted-foreground'>
                  Specify instruments you want featured: "piano melody", "electric guitar riffs", "orchestral
                  strings".
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Mood & Genre</h4>
                <p className='text-sm text-muted-foreground'>
                  Combine mood and genre settings with your prompt for more targeted musical compositions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
