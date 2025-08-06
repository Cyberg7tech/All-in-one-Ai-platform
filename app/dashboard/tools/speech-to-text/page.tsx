'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Mic, Upload, Download, Copy, Clock, FileAudio, Pause, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { downloadAsTextFile, copyToClipboard, generateUniqueFilename } from '@/lib/utils/download';
import { toast } from 'sonner';

interface TranscriptionResult {
  id: string;
  fileName: string;
  audioUrl: string;
  transcript: string;
  language: string;
  duration: number;
  confidence: number;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  segments?: {
    start: number;
    end: number;
    text: string;
    confidence: number;
  }[];
}

export default function SpeechToTextPage() {
  const { user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French (France)', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German (Germany)', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian (Italy)', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
    { code: 'ja-JP', name: 'Japanese (Japan)', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean (South Korea)', flag: '🇰🇷' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
    { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', flag: '🇸🇦' },
    { code: 'hi-IN', name: 'Hindi (India)', flag: '🇮🇳' },
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        handleTranscription(audioBlob, `Recording_${Date.now()}.wav`, audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const audioUrl = URL.createObjectURL(file);
      handleTranscription(file, file.name, audioUrl);
    }
  };

  const handleTranscription = async (audioBlob: Blob, fileName: string, audioUrl: string) => {
    setIsProcessing(true);

    const newTranscription: TranscriptionResult = {
      id: Date.now().toString(),
      fileName,
      audioUrl,
      transcript: '',
      language: selectedLanguage,
      duration: 0,
      confidence: 0,
      status: 'processing',
      createdAt: new Date(),
    };

    setTranscriptions((prev) => [newTranscription, ...prev]);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, fileName);
      formData.append('language', selectedLanguage);
      formData.append('userId', user?.id || '');

      const response = await fetch('/api/ai/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setTranscriptions((prev) =>
          prev.map((transcription) =>
            transcription.id === newTranscription.id
              ? {
                  ...transcription,
                  transcript: data.transcript,
                  duration: data.duration,
                  confidence: data.confidence,
                  segments: data.segments,
                  status: 'completed',
                }
              : transcription
          )
        );
      } else {
        throw new Error(data.message || 'Transcription failed');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscriptions((prev) =>
        prev.map((transcription) =>
          transcription.id === newTranscription.id ? { ...transcription, status: 'failed' } : transcription
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTranscription = (transcription: TranscriptionResult) => {
    try {
      const filename = generateUniqueFilename(`transcription_${transcription.language}`, 'txt');

      const content = `Transcription Results
Language: ${transcription.language}
Confidence: ${transcription.confidence}%
Duration: ${transcription.duration}s
Created: ${transcription.createdAt.toLocaleString()}

Transcript:
${transcription.transcript}

Segments:
${
  transcription.segments?.map((seg) => `[${seg.start}s - ${seg.end}s] ${seg.text}`).join('\n') ||
  'No segments available'
}`;

      downloadAsTextFile(content, filename);
      toast.success('Transcription downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download transcription');
      console.error('Download error:', error);
    }
  };

  const copyTranscript = async (transcript: string) => {
    try {
      await copyToClipboard(transcript);
      toast.success('Transcript copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy transcript');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className='p-6 max-w-7xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <Mic className='size-8' />
            AI Speech to Text
          </h1>
          <p className='text-muted-foreground mt-1'>
            Convert audio recordings and files into accurate text transcriptions
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Audio Input */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Language Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Language Settings</CardTitle>
              <CardDescription>Select the language of your audio for better accuracy</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Audio Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className='mt-2'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        <div className='flex items-center gap-2'>
                          <span>{language.flag}</span>
                          <span>{language.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Recording */}
          <Card>
            <CardHeader>
              <CardTitle>Record Audio</CardTitle>
              <CardDescription>Record directly from your microphone</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='text-center'>
                {isRecording ? (
                  <div className='space-y-4'>
                    <div className='size-24 bg-red-100 rounded-full flex items-center justify-center mx-auto animate-pulse'>
                      <Mic className='size-8 text-red-500' />
                    </div>
                    <div>
                      <p className='text-lg font-medium'>Recording...</p>
                      <p className='text-2xl font-mono text-red-500'>{formatTime(recordingTime)}</p>
                    </div>
                    <Button onClick={stopRecording} variant='destructive'>
                      <Pause className='size-4 mr-2' />
                      Stop Recording
                    </Button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div className='size-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto'>
                      <Mic className='size-8 text-primary' />
                    </div>
                    <Button onClick={startRecording} disabled={isProcessing}>
                      <Mic className='size-4 mr-2' />
                      Start Recording
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Audio File</CardTitle>
              <CardDescription>Upload an existing audio file for transcription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='border-2 border-dashed border-border rounded-lg p-8 text-center'>
                  <Upload className='size-8 mx-auto mb-4 text-muted-foreground' />
                  <p className='text-sm text-muted-foreground mb-4'>
                    Drag and drop an audio file, or click to browse
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
                    <Upload className='size-4 mr-2' />
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='audio/*'
                    onChange={handleFileUpload}
                    className='hidden'
                  />
                </div>
                <p className='text-xs text-muted-foreground text-center'>
                  Supported formats: MP3, WAV, M4A, FLAC, OGG (Max size: 25MB)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Current Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span>Language:</span>
                  <span>{languages.find((l) => l.code === selectedLanguage)?.name}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Status:</span>
                  <span>
                    {isRecording ? (
                      <Badge variant='destructive'>Recording</Badge>
                    ) : isProcessing ? (
                      <Badge variant='secondary'>Processing</Badge>
                    ) : (
                      <Badge variant='outline'>Ready</Badge>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips for Better Results</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='text-sm space-y-2'>
                <p>• Speak clearly and at a moderate pace</p>
                <p>• Use a quiet environment with minimal background noise</p>
                <p>• Keep the microphone at a consistent distance</p>
                <p>• Select the correct language for your audio</p>
                <p>• For best results, use high-quality audio files</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm'>
                  <div className='size-2 bg-green-500 rounded-full'></div>
                  <span>Real-time transcription</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <div className='size-2 bg-green-500 rounded-full'></div>
                  <span>Multi-language support</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <div className='size-2 bg-green-500 rounded-full'></div>
                  <span>Confidence scoring</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <div className='size-2 bg-green-500 rounded-full'></div>
                  <span>Timestamp segments</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transcription Results */}
      {transcriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transcription Results</CardTitle>
            <CardDescription>Your speech-to-text transcription results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {transcriptions.map((transcription) => (
                <div key={transcription.id} className='border rounded-lg p-4 space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <FileAudio className='size-5 text-muted-foreground' />
                      <div>
                        <h3 className='font-medium text-sm'>{transcription.fileName}</h3>
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <span>{languages.find((l) => l.code === transcription.language)?.name}</span>
                          {transcription.duration > 0 && (
                            <>
                              <span>•</span>
                              <span className='flex items-center gap-1'>
                                <Clock className='size-3' />
                                {Math.round(transcription.duration)}s
                              </span>
                            </>
                          )}
                          {transcription.confidence > 0 && (
                            <>
                              <span>•</span>
                              <span>Confidence: {Math.round(transcription.confidence * 100)}%</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      {transcription.status === 'processing' ? (
                        <Loader2 className='size-4 animate-spin' />
                      ) : transcription.status === 'completed' ? (
                        <>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => copyTranscript(transcription.transcript)}>
                            <Copy className='size-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => downloadTranscription(transcription)}>
                            <Download className='size-4' />
                          </Button>
                        </>
                      ) : (
                        <Badge variant='destructive'>Failed</Badge>
                      )}
                    </div>
                  </div>

                  {transcription.status === 'completed' && transcription.transcript && (
                    <div className='bg-muted/50 rounded-lg p-3'>
                      <p className='text-sm leading-relaxed'>{transcription.transcript}</p>
                    </div>
                  )}

                  {transcription.status === 'processing' && (
                    <div className='bg-muted/50 rounded-lg p-3 flex items-center justify-center'>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Loader2 className='size-4 animate-spin' />
                        <span>Processing audio...</span>
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
  );
}
