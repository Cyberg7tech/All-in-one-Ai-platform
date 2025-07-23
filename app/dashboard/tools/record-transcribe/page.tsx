'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Mic, Square, Play, Pause, Download, Copy, Loader2, FileAudio, Clock, Volume2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface Recording {
  id: string
  name: string
  duration: number
  audioUrl: string
  transcript: string
  language: string
  confidence: number
  status: 'recording' | 'processing' | 'completed' | 'failed'
  createdAt: Date
  waveformData?: number[]
}

export default function RecordTranscribePage() {
  const { user } = useAuth()
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState('en-US')
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [recordings, setRecordings] = useState<Recording[]>([])
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Portuguese', flag: '🇧🇷' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳' },
  ]

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      audioStreamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      const chunks: Blob[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        const newRecording: Recording = {
          id: Date.now().toString(),
          name: `Recording ${new Date().toLocaleTimeString()}`,
          duration: recordingTime,
          audioUrl,
          transcript: '',
          language: selectedLanguage,
          confidence: 0,
          status: 'processing',
          createdAt: new Date()
        }
        
        setRecordings(prev => [newRecording, ...prev])
        processTranscription(audioBlob, newRecording.id)
        
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      // Set up audio visualization
      setupAudioVisualization(stream)

    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }

  const setupAudioVisualization = (stream: MediaStream) => {
    try {
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 256
      source.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
    } catch (error) {
      console.error('Error setting up audio visualization:', error)
    }
  }

  const processTranscription = async (audioBlob: Blob, recordingId: string) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, `recording_${recordingId}.webm`)
      formData.append('language', selectedLanguage)
      formData.append('userId', user?.id || '')

      const response = await fetch('/api/ai/speech-to-text', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setRecordings(prev => 
          prev.map(recording => 
            recording.id === recordingId 
              ? { 
                  ...recording, 
                  transcript: data.transcript,
                  confidence: data.confidence,
                  status: 'completed' 
                }
              : recording
          )
        )
      } else {
        throw new Error(data.message || 'Transcription failed')
      }

    } catch (error) {
      console.error('Transcription error:', error)
      setRecordings(prev => 
        prev.map(recording => 
          recording.id === recordingId 
            ? { ...recording, status: 'failed' }
            : recording
        )
      )
    }
  }

  const handlePlayPause = (recordingId: string, audioUrl: string) => {
    if (isPlaying === recordingId) {
      setIsPlaying(null)
      // Pause audio logic
    } else {
      setIsPlaying(recordingId)
      // Play audio logic
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const deleteRecording = (recordingId: string) => {
    setRecordings(prev => prev.filter(r => r.id !== recordingId))
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileAudio className="w-8 h-8" />
            Record & Transcribe
          </h1>
          <p className="text-muted-foreground mt-1">
            Record audio and get instant AI-powered transcriptions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recording Interface */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audio Recording</CardTitle>
              <CardDescription>
                Record high-quality audio with real-time transcription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selection */}
              <div>
                <Label>Recording Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isRecording}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        <div className="flex items-center gap-2">
                          <span>{language.flag}</span>
                          <span>{language.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Recording Controls */}
              <div className="text-center space-y-6">
                {isRecording ? (
                  <div className="space-y-4">
                    <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                      <Mic className="w-12 h-12 text-red-500" />
                    </div>
                    
                    {/* Audio Waveform Visualization */}
                    <div className="h-16 bg-muted/50 rounded-lg flex items-end justify-center gap-1 px-4">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-red-500 rounded-t animate-pulse"
                          style={{
                            height: `${Math.random() * 100}%`,
                            minHeight: '2px',
                            animationDelay: `${i * 50}ms`
                          }}
                        />
                      ))}
                    </div>
                    
                    <div>
                      <p className="text-lg font-medium">Recording in progress...</p>
                      <p className="text-3xl font-mono text-red-500 font-bold">
                        {formatTime(recordingTime)}
                      </p>
                    </div>
                    
                    <Button onClick={stopRecording} variant="destructive" size="lg">
                      <Square className="w-5 h-5 mr-2" />
                      Stop Recording
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Mic className="w-12 h-12 text-primary" />
                    </div>
                    
                    <div>
                      <p className="text-lg font-medium mb-2">Ready to Record</p>
                      <p className="text-sm text-muted-foreground">
                        Click the button below to start recording
                      </p>
                    </div>
                    
                    <Button onClick={startRecording} size="lg" className="px-8">
                      <Mic className="w-5 h-5 mr-2" />
                      Start Recording
                    </Button>
                  </div>
                )}
              </div>

              {/* Recording Tips */}
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="text-sm space-y-2">
                    <h4 className="font-medium mb-2">📝 Recording Tips:</h4>
                    <p>• Speak clearly and at a normal pace</p>
                    <p>• Use a quiet environment for best results</p>
                    <p>• Keep microphone 6-12 inches from your mouth</p>
                    <p>• Transcription will start automatically after recording</p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recording Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <span>
                    {isRecording ? (
                      <Badge variant="destructive">Recording</Badge>
                    ) : (
                      <Badge variant="outline">Ready</Badge>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Language:</span>
                  <span>{languages.find(l => l.code === selectedLanguage)?.name}</span>
                </div>
                {isRecording && (
                  <div className="flex justify-between text-sm">
                    <span>Duration:</span>
                    <span className="font-mono">{formatTime(recordingTime)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>High-quality recording</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Real-time visualization</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Automatic transcription</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Multi-language support</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Export & download</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{recordings.length}</p>
                  <p className="text-sm text-muted-foreground">Total Recordings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {recordings.reduce((acc, r) => acc + r.duration, 0)}s
                  </p>
                  <p className="text-sm text-muted-foreground">Total Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recording History */}
      {recordings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recording History</CardTitle>
            <CardDescription>
              Your recorded audio files and transcriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recordings.map((recording) => (
                <div key={recording.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileAudio className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{recording.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(recording.duration)}
                          </span>
                          <span>•</span>
                          <span>{languages.find(l => l.code === recording.language)?.name}</span>
                          {recording.confidence > 0 && (
                            <>
                              <span>•</span>
                              <span>Confidence: {Math.round(recording.confidence * 100)}%</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {recording.status === 'processing' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : recording.status === 'completed' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePlayPause(recording.id, recording.audioUrl)}
                          >
                            {isPlaying === recording.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(recording.transcript)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                    </div>
                  </div>

                  {recording.status === 'completed' && recording.transcript && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-2">Transcription:</h4>
                      <p className="text-sm leading-relaxed">{recording.transcript}</p>
                    </div>
                  )}

                  {recording.status === 'processing' && (
                    <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transcribing audio...</span>
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