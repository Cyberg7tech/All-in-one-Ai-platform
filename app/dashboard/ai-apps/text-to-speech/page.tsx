'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Mic,
  Play,
  Pause,
  Square,
  Download,
  Copy,
  Trash2,
  Volume2,
  Settings,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AudioGeneration {
  id: string;
  text: string;
  voice: string;
  speed: number;
  pitch: number;
  status: 'generating' | 'completed' | 'error';
  audioUrl?: string;
  duration?: number;
  createdAt: Date;
}

export default function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [speed, setSpeed] = useState([1.0]);
  const [pitch, setPitch] = useState([1.0]);
  const [audioGenerations, setAudioGenerations] = useState<AudioGeneration[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const { toast } = useToast();

  const voices = [
    { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced voice' },
    { id: 'echo', name: 'Echo', description: 'Clear, crisp voice' },
    { id: 'fable', name: 'Fable', description: 'Warm, storytelling voice' },
    { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative voice' },
    { id: 'nova', name: 'Nova', description: 'Bright, energetic voice' },
    { id: 'shimmer', name: 'Shimmer', description: 'Soft, gentle voice' },
  ];

  const presetTexts = [
    'Welcome to our AI-powered text-to-speech service. This technology converts written text into natural-sounding speech.',
    'Artificial Intelligence is transforming how we interact with technology. Voice synthesis has never been more realistic.',
    'The quick brown fox jumps over the lazy dog. This sentence contains all letters of the alphabet.',
    'In a world where technology connects us all, the power of voice brings content to life in remarkable ways.',
  ];

  const generateAudio = async () => {
    if (!text.trim()) {
      toast({
        title: 'Please enter text',
        description: 'You need to provide text to convert to speech.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    const generation: AudioGeneration = {
      id: Date.now().toString(),
      text: text.trim(),
      voice: selectedVoice,
      speed: speed[0],
      pitch: pitch[0],
      status: 'generating',
      createdAt: new Date(),
    };

    setAudioGenerations((prev) => [generation, ...prev]);

    try {
      // Simulate audio generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create a mock audio URL (in real implementation, this would be from the TTS API)
      const mockAudioUrl =
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+f3xm8iBkPE2N+AOxAPU6zg5bNmGgU+ltryuWMdBD2a4vC2YxsEPZPY88p9KgUme8j13IQ7DhBYpuXp';

      setAudioGenerations((prev) =>
        prev.map((gen) =>
          gen.id === generation.id
            ? {
                ...gen,
                status: 'completed',
                audioUrl: mockAudioUrl,
                duration: Math.floor(text.length / 10), // Rough estimate
              }
            : gen
        )
      );

      toast({
        title: 'Audio generated successfully!',
        description: 'Your text has been converted to speech.',
      });
    } catch (error) {
      setAudioGenerations((prev) =>
        prev.map((gen) => (gen.id === generation.id ? { ...gen, status: 'error' } : gen))
      );

      toast({
        title: 'Error generating audio',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = (generationId: string, audioUrl: string) => {
    // Stop any currently playing audio
    if (currentlyPlaying) {
      audioRefs.current[currentlyPlaying]?.pause();
    }

    if (currentlyPlaying === generationId) {
      setCurrentlyPlaying(null);
      return;
    }

    // Create or get audio element
    if (!audioRefs.current[generationId]) {
      audioRefs.current[generationId] = new Audio(audioUrl);
      audioRefs.current[generationId].addEventListener('ended', () => {
        setCurrentlyPlaying(null);
      });
    }

    audioRefs.current[generationId].play();
    setCurrentlyPlaying(generationId);
  };

  const stopAudio = () => {
    if (currentlyPlaying) {
      audioRefs.current[currentlyPlaying]?.pause();
      setCurrentlyPlaying(null);
    }
  };

  const downloadAudio = (generation: AudioGeneration) => {
    if (!generation.audioUrl) return;

    const a = document.createElement('a');
    a.href = generation.audioUrl;
    a.download = `tts_${generation.id}.wav`;
    a.click();

    toast({
      title: 'Download started',
      description: 'Your audio file is being downloaded.',
    });
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Text has been copied to your clipboard.',
    });
  };

  const deleteGeneration = (generationId: string) => {
    // Stop audio if playing
    if (currentlyPlaying === generationId) {
      stopAudio();
    }

    // Remove audio element
    if (audioRefs.current[generationId]) {
      delete audioRefs.current[generationId];
    }

    setAudioGenerations((prev) => prev.filter((gen) => gen.id !== generationId));
    toast({
      title: 'Audio deleted',
      description: 'The audio generation has been removed.',
    });
  };

  const retryGeneration = (generation: AudioGeneration) => {
    setText(generation.text);
    setSelectedVoice(generation.voice);
    setSpeed([generation.speed]);
    setPitch([generation.pitch]);
    generateAudio();
  };

  const handlePresetText = (presetText: string) => {
    setText(presetText);
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
            <div className='p-2 bg-emerald-100 rounded-lg'>
              <Mic className='size-6 text-emerald-600' />
            </div>
            <div>
              <h1 className='text-3xl font-bold'>Text to Speech</h1>
              <p className='text-muted-foreground'>Convert text to natural-sounding speech</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Input Section */}
          <div className='lg:col-span-1'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Settings className='size-5' />
                  Speech Settings
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Text Input */}
                <div className='space-y-3'>
                  <Label htmlFor='text'>Text to Convert</Label>
                  <Textarea
                    id='text'
                    placeholder='Enter the text you want to convert to speech...'
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={6}
                  />
                  <div className='text-xs text-muted-foreground'>Characters: {text.length} / 4000</div>
                </div>

                {/* Voice Selection */}
                <div className='space-y-3'>
                  <Label>Voice</Label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className='w-full p-2 border border-input rounded-md bg-background'>
                    {voices.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name} - {voice.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Speed Control */}
                <div className='space-y-3'>
                  <Label>Speed: {speed[0]}x</Label>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    max={2}
                    min={0.25}
                    step={0.25}
                    className='w-full'
                  />
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>0.25x</span>
                    <span>2x</span>
                  </div>
                </div>

                {/* Pitch Control */}
                <div className='space-y-3'>
                  <Label>Pitch: {pitch[0]}x</Label>
                  <Slider
                    value={pitch}
                    onValueChange={setPitch}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className='w-full'
                  />
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>0.5x</span>
                    <span>2x</span>
                  </div>
                </div>

                {/* Generate Button */}
                <Button onClick={generateAudio} disabled={isGenerating || !text.trim()} className='w-full'>
                  {isGenerating ? (
                    <>
                      <Loader2 className='size-4 mr-2 animate-spin' />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Volume2 className='size-4 mr-2' />
                      Generate Speech
                    </>
                  )}
                </Button>

                {/* Preset Texts */}
                <div className='space-y-3'>
                  <Label>Quick Presets</Label>
                  <div className='space-y-2'>
                    {presetTexts.slice(0, 2).map((preset, index) => (
                      <Button
                        key={index}
                        variant='outline'
                        size='sm'
                        onClick={() => handlePresetText(preset)}
                        className='w-full text-left h-auto p-2 text-xs justify-start'>
                        {preset.substring(0, 50)}...
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Audio Section */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='flex items-center gap-2'>
                    <Volume2 className='size-5' />
                    Generated Audio ({audioGenerations.length})
                  </CardTitle>
                  {audioGenerations.length > 0 && (
                    <Button variant='outline' size='sm' onClick={() => setAudioGenerations([])}>
                      <Trash2 className='size-4 mr-2' />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {audioGenerations.length === 0 ? (
                  <div className='text-center py-12'>
                    <Volume2 className='size-16 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-semibold mb-2'>No audio generated yet</h3>
                    <p className='text-muted-foreground mb-4'>
                      Enter text and click "Generate Speech" to create audio
                    </p>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md mx-auto'>
                      {presetTexts.slice(2, 4).map((preset, index) => (
                        <Button
                          key={index}
                          variant='outline'
                          size='sm'
                          onClick={() => handlePresetText(preset)}
                          className='text-xs'>
                          Try: "{preset.substring(0, 20)}..."
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {audioGenerations.map((generation) => (
                      <div key={generation.id} className='border rounded-lg p-4'>
                        {/* Generation Header */}
                        <div className='flex items-center justify-between mb-3'>
                          <div className='flex items-center space-x-2'>
                            <Badge
                              variant={
                                generation.status === 'completed'
                                  ? 'default'
                                  : generation.status === 'error'
                                    ? 'destructive'
                                    : 'secondary'
                              }>
                              {generation.status}
                            </Badge>
                            <Badge variant='outline'>
                              {voices.find((v) => v.id === generation.voice)?.name}
                            </Badge>
                            <Badge variant='outline'>{generation.speed}x speed</Badge>
                          </div>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => deleteGeneration(generation.id)}
                            className='text-red-500 hover:text-red-700'>
                            <Trash2 className='size-4' />
                          </Button>
                        </div>

                        {/* Text Content */}
                        <div className='mb-4'>
                          <div className='flex items-center justify-between mb-2'>
                            <span className='text-sm font-medium'>Text:</span>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => copyText(generation.text)}
                              className='size-6 p-0'>
                              <Copy className='size-3' />
                            </Button>
                          </div>
                          <div className='p-2 bg-muted rounded text-sm'>
                            {generation.text.length > 200
                              ? `${generation.text.substring(0, 200)}...`
                              : generation.text}
                          </div>
                        </div>

                        {/* Audio Controls */}
                        {generation.status === 'completed' && generation.audioUrl && (
                          <div className='space-y-3'>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center space-x-2'>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => playAudio(generation.id, generation.audioUrl!)}>
                                  {currentlyPlaying === generation.id ? (
                                    <Pause className='size-4' />
                                  ) : (
                                    <Play className='size-4' />
                                  )}
                                </Button>
                                {currentlyPlaying === generation.id && (
                                  <Button variant='outline' size='sm' onClick={stopAudio}>
                                    <Square className='size-4' />
                                  </Button>
                                )}
                                {generation.duration && (
                                  <span className='text-sm text-muted-foreground'>
                                    {formatDuration(generation.duration)}
                                  </span>
                                )}
                              </div>
                              <Button variant='outline' size='sm' onClick={() => downloadAudio(generation)}>
                                <Download className='size-4 mr-2' />
                                Download
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Generating State */}
                        {generation.status === 'generating' && (
                          <div className='flex items-center justify-center space-x-2 py-4'>
                            <Loader2 className='size-4 animate-spin' />
                            <span className='text-sm text-muted-foreground'>Generating audio...</span>
                          </div>
                        )}

                        {/* Error State */}
                        {generation.status === 'error' && (
                          <div className='text-center py-4'>
                            <p className='text-sm text-red-500 mb-3'>Generation failed</p>
                            <Button variant='outline' size='sm' onClick={() => retryGeneration(generation)}>
                              <RotateCcw className='size-4 mr-2' />
                              Retry
                            </Button>
                          </div>
                        )}

                        <p className='text-xs text-muted-foreground mt-3'>
                          {generation.createdAt.toLocaleString()}
                        </p>
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
            <CardTitle>Text-to-Speech Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Text Formatting</h4>
                <p className='text-sm text-muted-foreground'>
                  Use punctuation for natural pauses. Add emphasis with CAPS or italics for better expression.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Voice Selection</h4>
                <p className='text-sm text-muted-foreground'>
                  Choose voices based on content type: authoritative for presentations, warm for storytelling.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Speed & Pitch</h4>
                <p className='text-sm text-muted-foreground'>
                  Adjust speed for clarity and pitch for emotional tone. Slower speeds work better for complex
                  content.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
