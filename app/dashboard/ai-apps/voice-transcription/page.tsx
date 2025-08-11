'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Mic, FileAudio, Download, Copy, Trash2, Square, CheckCircle, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AudioFile {
  id: string;
  name: string;
  size: number;
  duration?: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  transcription?: string;
  url?: string;
}

export default function VoiceTranscriptionPage() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioFile: AudioFile = {
          id: Date.now().toString(),
          name: `Recording_${new Date().toLocaleString()}.wav`,
          size: audioBlob.size,
          status: 'processing',
          progress: 0,
          url: URL.createObjectURL(audioBlob),
        };

        setAudioFiles((prev) => [...prev, audioFile]);
        processTranscription(audioFile.id);

        // Cleanup
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

      toast({
        title: 'Recording started',
        description: 'Speak clearly into your microphone.',
      });
    } catch (error) {
      toast({
        title: 'Recording failed',
        description: 'Please check your microphone permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      toast({
        title: 'Recording stopped',
        description: 'Processing transcription...',
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    selectedFiles.forEach((file) => {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload audio files only.',
          variant: 'destructive',
        });
        return;
      }

      const audioFile: AudioFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        status: 'uploading',
        progress: 0,
        url: URL.createObjectURL(file),
      };

      setAudioFiles((prev) => [...prev, audioFile]);
      simulateUpload(audioFile.id);
    });

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateUpload = async (fileId: string) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setAudioFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress } : f)));
    }

    // Start processing
    setAudioFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, status: 'processing', progress: 0 } : f))
    );

    processTranscription(fileId);
  };

  const processTranscription = async (fileId: string) => {
    try {
      // Simulate processing progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setAudioFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress } : f)));
      }

      // Simulate transcription result
      const mockTranscription = `This is a sample transcription result. In a real implementation, this would be the actual transcribed text from the audio file. The transcription would be generated using services like OpenAI Whisper, Google Speech-to-Text, or similar AI-powered speech recognition services.

The text would accurately reflect what was spoken in the audio file, including proper punctuation and formatting. Advanced transcription services can also handle multiple speakers, different accents, and various audio qualities.`;

      setAudioFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: 'completed',
                progress: 100,
                transcription: mockTranscription,
              }
            : f
        )
      );

      toast({
        title: 'Transcription completed',
        description: 'Your audio has been successfully transcribed.',
      });
    } catch (error) {
      setAudioFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: 'error', progress: 0 } : f))
      );

      toast({
        title: 'Transcription failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const removeFile = (fileId: string) => {
    setAudioFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const copyTranscription = (transcription: string) => {
    navigator.clipboard.writeText(transcription);
    toast({
      title: 'Copied to clipboard',
      description: 'Transcription has been copied.',
    });
  };

  const downloadTranscription = (transcription: string, fileName: string) => {
    const blob = new Blob([transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}_transcription.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: AudioFile['status']) => {
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
            <div className='p-2 bg-orange-100 rounded-lg'>
              <Mic className='size-6 text-orange-600' />
            </div>
            <div>
              <h1 className='text-3xl font-bold'>Voice Transcription</h1>
              <p className='text-muted-foreground'>Convert audio files to text with high accuracy</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Recording & Upload Section */}
          <div className='lg:col-span-1'>
            <Card>
              <CardHeader>
                <CardTitle>Audio Input</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Language Selection */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className='w-full p-2 border border-input rounded-md bg-background'>
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recording */}
                <div className='space-y-4'>
                  <h4 className='font-medium'>Record Audio</h4>
                  <div className='text-center space-y-4'>
                    <div className='flex justify-center'>
                      <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        variant={isRecording ? 'destructive' : 'default'}
                        size='lg'
                        className='rounded-full size-16'>
                        {isRecording ? <Square className='size-6' /> : <Mic className='size-6' />}
                      </Button>
                    </div>
                    {isRecording && (
                      <div className='space-y-2'>
                        <div className='text-red-500 font-medium'>Recording: {formatTime(recordingTime)}</div>
                        <div className='w-full bg-red-100 rounded-full h-2'>
                          <div
                            className='bg-red-500 h-2 rounded-full animate-pulse'
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* File Upload */}
                <div className='space-y-4'>
                  <h4 className='font-medium'>Upload Audio</h4>
                  <input
                    type='file'
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept='audio/*'
                    multiple
                    className='hidden'
                  />
                  <Button onClick={() => fileInputRef.current?.click()} variant='outline' className='w-full'>
                    <Upload className='size-4 mr-2' />
                    Choose Audio Files
                  </Button>
                  <p className='text-xs text-muted-foreground'>Supported formats: MP3, WAV, M4A, FLAC</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audio Files & Transcriptions */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileAudio className='size-5' />
                  Audio Files & Transcriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {audioFiles.length === 0 ? (
                  <div className='text-center py-12'>
                    <FileAudio className='size-16 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-semibold mb-2'>No audio files</h3>
                    <p className='text-muted-foreground'>
                      Record audio or upload files to start transcription
                    </p>
                  </div>
                ) : (
                  <div className='space-y-6'>
                    {audioFiles.map((file) => (
                      <div key={file.id} className='border rounded-lg p-4'>
                        {/* File Header */}
                        <div className='flex items-center justify-between mb-3'>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center space-x-2'>
                              <h4 className='font-medium truncate'>{file.name}</h4>
                              <Badge className={getStatusColor(file.status)}>{file.status}</Badge>
                            </div>
                            <p className='text-sm text-muted-foreground'>{formatFileSize(file.size)}</p>
                          </div>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => removeFile(file.id)}
                            className='text-red-500 hover:text-red-700'>
                            <Trash2 className='size-4' />
                          </Button>
                        </div>

                        {/* Progress */}
                        {(file.status === 'uploading' || file.status === 'processing') && (
                          <div className='space-y-2 mb-4'>
                            <Progress value={file.progress} />
                            <div className='flex items-center justify-center space-x-2 text-sm text-muted-foreground'>
                              <Loader2 className='size-4 animate-spin' />
                              <span>
                                {file.status === 'uploading' ? 'Uploading' : 'Transcribing'}...{' '}
                                {file.progress}%
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Transcription Result */}
                        {file.status === 'completed' && file.transcription && (
                          <div className='space-y-3'>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center space-x-2 text-green-600'>
                                <CheckCircle className='size-4' />
                                <span className='text-sm font-medium'>Transcription completed</span>
                              </div>
                              <div className='flex space-x-2'>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => copyTranscription(file.transcription!)}>
                                  <Copy className='size-4 mr-2' />
                                  Copy
                                </Button>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => downloadTranscription(file.transcription!, file.name)}>
                                  <Download className='size-4 mr-2' />
                                  Download
                                </Button>
                              </div>
                            </div>
                            <Textarea
                              value={file.transcription}
                              readOnly
                              className='min-h-[120px] bg-muted'
                            />
                          </div>
                        )}

                        {/* Error State */}
                        {file.status === 'error' && (
                          <div className='text-center py-4 text-red-500'>
                            <X className='size-8 mx-auto mb-2' />
                            <p className='text-sm'>Transcription failed</p>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => processTranscription(file.id)}
                              className='mt-2'>
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

        {/* Tips Section */}
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>Transcription Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Audio Quality</h4>
                <p className='text-sm text-muted-foreground'>
                  Use clear audio with minimal background noise for best results.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Speaking Pace</h4>
                <p className='text-sm text-muted-foreground'>
                  Speak at a moderate pace with clear pronunciation.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>File Formats</h4>
                <p className='text-sm text-muted-foreground'>
                  MP3, WAV, and M4A formats provide the best transcription accuracy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
