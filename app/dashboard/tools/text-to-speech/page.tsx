'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Volume2, Play, Pause, Download, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { downloadAudioData, generateUniqueFilename } from '@/lib/utils/download';
import { toast } from 'sonner';

interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  accent: string;
  style: string;
  preview?: string;
}

interface GeneratedAudio {
  id: string;
  text: string;
  voice: Voice;
  speed: number;
  pitch: number;
  audioUrl: string;
  duration: number;
  status: 'generating' | 'completed' | 'failed';
  createdAt: Date;
}

export default function TextToSpeechPage() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('professional-female');
  const [speed, setSpeed] = useState([1]);
  const [pitch, setPitch] = useState([1]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [generatedAudios, setGeneratedAudios] = useState<GeneratedAudio[]>([]);

  const voices: Voice[] = [
    {
      id: 'professional-female',
      name: 'Sarah Professional',
      gender: 'female',
      accent: 'American',
      style: 'Business',
    },
    {
      id: 'professional-male',
      name: 'David Professional',
      gender: 'male',
      accent: 'American',
      style: 'Business',
    },
    { id: 'friendly-female', name: 'Emma Friendly', gender: 'female', accent: 'British', style: 'Casual' },
    { id: 'friendly-male', name: 'James Friendly', gender: 'male', accent: 'British', style: 'Casual' },
    {
      id: 'narrator-male',
      name: 'Morgan Narrator',
      gender: 'male',
      accent: 'American',
      style: 'Documentary',
    },
    {
      id: 'energetic-female',
      name: 'Lisa Energetic',
      gender: 'female',
      accent: 'Australian',
      style: 'Upbeat',
    },
    { id: 'calm-male', name: 'Alex Calm', gender: 'male', accent: 'Canadian', style: 'Meditation' },
    { id: 'child-female', name: 'Sophie Young', gender: 'female', accent: 'American', style: 'Child' },
  ];

  const presetTexts = [
    'Hello! Welcome to our AI-powered text-to-speech service. This technology can convert any written text into natural-sounding speech.',
    'The quick brown fox jumps over the lazy dog. This sentence contains all letters of the alphabet and is commonly used for testing.',
    'Artificial Intelligence is transforming the way we communicate and interact with technology in our daily lives.',
    'Thank you for choosing our service. We hope you find this tool helpful for your projects and applications.',
  ];

  const selectedVoiceData = voices.find((v) => v.id === selectedVoice);

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);

    const newAudio: GeneratedAudio = {
      id: Date.now().toString(),
      text: text.trim(),
      voice: selectedVoiceData!,
      speed: speed[0],
      pitch: pitch[0],
      audioUrl: '',
      duration: 0,
      status: 'generating',
      createdAt: new Date(),
    };

    setGeneratedAudios((prev) => [newAudio, ...prev]);

    try {
      const response = await fetch('/api/ai/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voiceId: selectedVoice,
          speed: speed[0],
          pitch: pitch[0],
          userId: user?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedAudios((prev) =>
          prev.map((audio) =>
            audio.id === newAudio.id
              ? { ...audio, audioUrl: data.audioUrl, duration: data.duration, status: 'completed' }
              : audio
          )
        );
      } else {
        throw new Error(data.message || 'Speech generation failed');
      }
    } catch (error) {
      console.error('TTS generation error:', error);
      setGeneratedAudios((prev) =>
        prev.map((audio) => (audio.id === newAudio.id ? { ...audio, status: 'failed' } : audio))
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = async (audioUrl: string) => {
    try {
      if (!audioUrl) {
        toast.error('No audio available to play');
        return;
      }

      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setIsPlaying(false);
        return;
      }

      if (!isPlaying) {
        const audio = new Audio(audioUrl);

        // Add error handling for audio loading
        audio.onerror = () => {
          toast.error('Failed to load audio file');
          setIsPlaying(false);
          setCurrentAudio(null);
        };

        audio.onended = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
        };

        audio.onloadstart = () => {
          toast.info('Loading audio...');
        };

        audio.oncanplay = () => {
          toast.success('Audio ready!');
        };

        try {
          await audio.play();
          setCurrentAudio(audio);
          setIsPlaying(true);
        } catch (playError) {
          console.error('Audio play failed:', playError);
          toast.error('Failed to play audio. This might be a demo audio file.');
          setIsPlaying(false);
          setCurrentAudio(null);
        }
      }
    } catch (error) {
      console.error('Play/pause error:', error);
      toast.error('Audio playback failed');
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  };

  const handleDownload = async (audioUrl: string, text: string) => {
    try {
      if (!audioUrl) {
        toast.error('No audio available to download');
        return;
      }

      const filename = generateUniqueFilename(text.replace(/[^a-zA-Z0-9]/g, '_'), 'mp3');
      await downloadAudioData(audioUrl, filename);
      toast.success('Audio downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download audio file');
    }
  };

  const estimatedDuration = text.trim() ? Math.ceil((text.trim().split(' ').length / 150) * 60) : 0;

  return (
    <div className='p-6 max-w-7xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <Volume2 className='size-8' />
            AI Text to Speech
          </h1>
          <p className='text-muted-foreground mt-1'>
            Convert text into natural-sounding speech with AI voices
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Text Input & Generation */}
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Text Input</CardTitle>
              <CardDescription>Enter the text you want to convert to speech</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='text'>Text Content</Label>
                <Textarea
                  id='text'
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder='Enter the text you want to convert to speech...'
                  className='min-h-[120px] mt-2'
                />
                <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                  <span>Enter text to generate natural speech</span>
                  <span>
                    {
                      text
                        .trim()
                        .split(' ')
                        .filter((w) => w).length
                    }{' '}
                    words • ~{estimatedDuration}s
                  </span>
                </div>
              </div>

              {/* Preset Texts */}
              <div>
                <Label>Quick Start Examples</Label>
                <div className='grid grid-cols-1 gap-2 mt-2'>
                  {presetTexts.map((preset, index) => (
                    <Button
                      key={index}
                      variant='outline'
                      size='sm'
                      className='justify-start text-left h-auto py-2 px-3'
                      onClick={() => setText(preset)}>
                      <div className='truncate'>{preset}</div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice & Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Voice Settings</CardTitle>
              <CardDescription>Customize the voice and speech parameters</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Voice Selection */}
              <div>
                <Label>Voice</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className='mt-2'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className='flex items-center justify-between w-full'>
                          <div>
                            <span className='font-medium'>{voice.name}</span>
                            <div className='flex items-center gap-2 mt-1'>
                              <Badge variant='outline' className='text-xs'>
                                {voice.gender}
                              </Badge>
                              <Badge variant='outline' className='text-xs'>
                                {voice.accent}
                              </Badge>
                              <Badge variant='outline' className='text-xs'>
                                {voice.style}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Speed Control */}
              <div>
                <Label>Speech Speed</Label>
                <div className='mt-2'>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className='w-full'
                  />
                  <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                    <span>0.5x (Slow)</span>
                    <span>{speed[0]}x</span>
                    <span>2.0x (Fast)</span>
                  </div>
                </div>
              </div>

              {/* Pitch Control */}
              <div>
                <Label>Pitch</Label>
                <div className='mt-2'>
                  <Slider
                    value={pitch}
                    onValueChange={setPitch}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className='w-full'
                  />
                  <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                    <span>0.5x (Low)</span>
                    <span>{pitch[0]}x</span>
                    <span>2.0x (High)</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleGenerate} disabled={!text.trim() || isGenerating} className='w-full'>
                {isGenerating ? (
                  <>
                    <Loader2 className='size-4 mr-2 animate-spin' />
                    Generating Speech...
                  </>
                ) : (
                  <>
                    <Volume2 className='size-4 mr-2' />
                    Generate Speech
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
              <CardTitle>Voice Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedVoiceData && (
                <div className='space-y-3'>
                  <div className='text-center p-4 bg-muted/50 rounded-lg'>
                    <Volume2 className='size-8 mx-auto mb-2 text-primary' />
                    <h3 className='font-medium'>{selectedVoiceData.name}</h3>
                    <p className='text-sm text-muted-foreground'>{selectedVoiceData.style} Style</p>
                  </div>
                  <div className='text-xs space-y-1'>
                    <div className='flex justify-between'>
                      <span>Gender:</span>
                      <span className='capitalize'>{selectedVoiceData.gender}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Accent:</span>
                      <span>{selectedVoiceData.accent}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Speed:</span>
                      <span>{speed[0]}x</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Pitch:</span>
                      <span>{pitch[0]}x</span>
                    </div>
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
                <p>• Use punctuation for natural pauses</p>
                <p>• Spell out numbers and abbreviations</p>
                <p>• Add commas for short pauses</p>
                <p>• Use periods for longer pauses</p>
                <p>• Test different voices for your content</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generated Audio */}
      {generatedAudios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Speech</CardTitle>
            <CardDescription>Your converted text-to-speech audio files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {generatedAudios.map((audio) => (
                <div key={audio.id} className='border rounded-lg p-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <p className='font-medium text-sm mb-2'>{audio.text}</p>
                      <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                        <span>Voice: {audio.voice.name}</span>
                        <span>Speed: {audio.speed}x</span>
                        <span>Pitch: {audio.pitch}x</span>
                        {audio.duration > 0 && <span>Duration: {audio.duration}s</span>}
                      </div>
                    </div>

                    <div className='flex items-center gap-2 ml-4'>
                      {audio.status === 'generating' ? (
                        <Loader2 className='size-4 animate-spin' />
                      ) : audio.status === 'completed' ? (
                        <>
                          <Button variant='outline' size='sm' onClick={() => handlePlayPause(audio.audioUrl)}>
                            {isPlaying ? <Pause className='size-4' /> : <Play className='size-4' />}
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDownload(audio.audioUrl, audio.text)}>
                            <Download className='size-4' />
                          </Button>
                        </>
                      ) : (
                        <span className='text-red-500 text-sm'>Failed</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
