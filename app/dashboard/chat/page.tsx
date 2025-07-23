'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Plus, Bot, User, Settings, Image, FileText, Mic, Camera, Code, Brain, Sparkles, ChevronDown, Upload, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  model?: string
  tokens?: number
  attachments?: {
    type: 'image' | 'file' | 'audio'
    url: string
    name: string
  }[]
}

interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  model: string
  lastActivity: Date
}

const AI_MODELS = [
  // OpenAI Models
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    description: 'OpenAI\'s flagship model for complex tasks',
    consumption: '0.5x',
    category: 'OpenAI',
    premium: true
  },
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 mini',
    provider: 'openai', 
    description: 'Balance between intelligence, speed, and cost',
    consumption: '0.25x',
    category: 'OpenAI',
    premium: true
  },
  {
    id: 'gpt-4.1-nano',
    name: 'GPT-4.1 nano',
    provider: 'openai',
    description: 'Fastest, most cost-effective GPT 4.1 model',
    consumption: 'Unlimited',
    category: 'OpenAI',
    premium: false
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'openai',
    description: 'Intelligent small model optimized for fast, lightweight tasks',
    consumption: 'Unlimited',
    category: 'OpenAI',
    premium: false
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Most advanced system from OpenAI. 2x faster than GPT-4 Turbo',
    consumption: '0.5x',
    category: 'OpenAI',
    premium: true
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Latest GPT-4 with improved instruction following and vision',
    consumption: '1x',
    category: 'OpenAI',
    premium: true
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Very fast. Great for most use cases. 16k context length',
    consumption: 'Unlimited',
    category: 'OpenAI',
    premium: false
  },
  {
    id: 'o1-mini',
    name: 'o1-mini',
    provider: 'openai',
    description: 'Faster reasoning model for coding, math, and science',
    consumption: '0.5x',
    category: 'OpenAI Reasoning',
    premium: true
  },
  {
    id: 'o1',
    name: 'o1',
    provider: 'openai',
    description: 'Most powerful reasoning model for hard problems',
    consumption: '1x',
    category: 'OpenAI Reasoning',
    premium: true
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    provider: 'openai',
    description: 'Latest reasoning model optimized for math, coding, and science',
    consumption: '0.5x',
    category: 'OpenAI Reasoning',
    premium: true
  },
  {
    id: 'o3',
    name: 'o3',
    provider: 'openai',
    description: 'Well-rounded model setting new standards across domains',
    consumption: '1x',
    category: 'OpenAI Reasoning',
    premium: true
  },
  {
    id: 'o4-mini',
    name: 'o4-mini',
    provider: 'openai',
    description: 'Latest small o-series model optimized for fast reasoning',
    consumption: '0.25x',
    category: 'OpenAI Reasoning',
    premium: true
  },

  // Anthropic Models
  {
    id: 'claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    description: 'Next generation fastest model from Anthropic',
    consumption: '0.25x',
    category: 'Anthropic',
    premium: false
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Most intelligent model from Anthropic. 200k context window',
    consumption: '0.5x',
    category: 'Anthropic',
    premium: true
  },
  {
    id: 'claude-3.7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'anthropic',
    description: 'First hybrid reasoning model and most intelligent to date',
    consumption: '0.5x',
    category: 'Anthropic',
    premium: true
  },
  {
    id: 'claude-3.7-sonnet-reasoning',
    name: 'Claude 3.7 Sonnet Reasoning',
    provider: 'anthropic',
    description: 'First hybrid reasoning model with enhanced reasoning',
    consumption: '0.5x',
    category: 'Anthropic',
    premium: true
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'Most powerful model for highly complex tasks',
    consumption: '1x',
    category: 'Anthropic',
    premium: true
  },
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    description: 'Balanced model for enterprise workloads, next generation',
    consumption: '0.5x',
    category: 'Anthropic',
    premium: true
  },
  {
    id: 'claude-sonnet-4-reasoning',
    name: 'Claude Sonnet 4 Reasoning',
    provider: 'anthropic',
    description: 'Balanced reasoning model for enterprise workloads',
    consumption: '0.5x',
    category: 'Anthropic',
    premium: true
  },
  {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    description: 'Most powerful model for highly complex tasks, next generation',
    consumption: '1x',
    category: 'Anthropic',
    premium: true
  },
  {
    id: 'claude-opus-4-reasoning',
    name: 'Claude Opus 4 Reasoning',
    provider: 'anthropic',
    description: 'Most powerful reasoning model for complex tasks',
    consumption: '1x',
    category: 'Anthropic',
    premium: true
  },

  // Open Source Models
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral-8x7B',
    provider: 'mistral',
    description: 'Uncensored model from Mistral AI. Most powerful open-source',
    consumption: 'Unlimited',
    category: 'Open Source',
    premium: false
  },
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'meta',
    description: 'Outperforms many open source chat models on benchmarks',
    consumption: 'Unlimited',
    category: 'Open Source',
    premium: false
  },
  {
    id: 'llama-3.1-405b',
    name: 'Llama 3.1 405B',
    provider: 'meta',
    description: 'Meta\'s biggest open source model, competitive with GPT-4',
    consumption: '0.25x',
    category: 'Open Source',
    premium: true
  },
  {
    id: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'meta',
    description: 'Powerful model excelling at reasoning, coding, and NLP',
    consumption: '0.25x',
    category: 'Open Source',
    premium: true
  },

  // Google Models
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    description: 'Google\'s largest and most capable AI model. 1M context window',
    consumption: '1x',
    category: 'Google',
    premium: true
  },
  {
    id: 'gemini-flash-2.0',
    name: 'Gemini Flash 2.0',
    provider: 'google',
    description: 'Fast and versatile multimodal model for diverse tasks',
    consumption: 'Unlimited',
    category: 'Google',
    premium: false
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    description: 'State-of-the-art thinking model for complex reasoning',
    consumption: '0.5x',
    category: 'Google',
    premium: true
  },

  // xAI Models
  {
    id: 'grok-2',
    name: 'Grok 2',
    provider: 'xai',
    description: 'xAI\'s witty assistant inspired by Hitchhiker\'s Guide',
    consumption: '0.5x',
    category: 'xAI',
    premium: true
  },
  {
    id: 'grok-3-mini',
    name: 'Grok 3 Mini',
    provider: 'xai',
    description: 'Lightweight model that thinks before responding',
    consumption: 'Unlimited',
    category: 'xAI',
    premium: false
  },
  {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xai',
    description: 'Flagship model for enterprise use cases with deep domain knowledge',
    consumption: '0.5x',
    category: 'xAI',
    premium: true
  },
  {
    id: 'grok-4',
    name: 'Grok 4',
    provider: 'xai',
    description: 'Latest flagship model with unparalleled performance',
    consumption: '0.5x',
    category: 'xAI',
    premium: true
  },

  // DeepSeek Models
  {
    id: 'deepseek-v3',
    name: 'Deepseek V3',
    provider: 'deepseek',
    description: 'Chinese open-source model excelling in code generation',
    consumption: '0.25x',
    category: 'DeepSeek',
    premium: false
  },
  {
    id: 'deepseek-r1',
    name: 'Deepseek R1',
    provider: 'deepseek',
    description: 'State-of-the-art model optimized for reasoning, math, and code',
    consumption: '0.25x',
    category: 'DeepSeek',
    premium: false
  },
  {
    id: 'deepseek-r1-0528',
    name: 'Deepseek R1 0528',
    provider: 'deepseek',
    description: 'New version of Deepseek R1 from 05/28/2025. Hosted in USA',
    consumption: '0.25x',
    category: 'DeepSeek',
    premium: false
  },

  // Kimi Models
  {
    id: 'kimi-k2',
    name: 'Kimi K2',
    provider: 'kimi',
    description: 'State-of-the-art MoE model optimized for agentic capabilities',
    consumption: '0.1x',
    category: 'Kimi',
    premium: false
  },

  // Together.ai Models (High-performance open-source models)
  {
    id: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
    name: 'Llama 3.1 8B Turbo',
    provider: 'together',
    description: 'Fast and efficient Llama model for general conversations',
    consumption: 'Unlimited',
    category: 'Together.ai',
    premium: false
  },
  {
    id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    name: 'Llama 3.1 70B Turbo',
    provider: 'together',
    description: 'Large context Llama model with superior reasoning',
    consumption: '0.5x',
    category: 'Together.ai',
    premium: true
  },
  {
    id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    name: 'Llama 3.3 70B Turbo',
    provider: 'together',
    description: 'Latest Llama model with enhanced capabilities',
    consumption: '0.5x',
    category: 'Together.ai',
    premium: true
  },
  {
    id: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    name: 'Mixtral 8x7B Instruct',
    provider: 'together',
    description: 'Mixture of experts model with excellent performance',
    consumption: '0.75x',
    category: 'Together.ai',
    premium: true
  },
  {
    id: 'deepseek-ai/DeepSeek-R1',
    name: 'DeepSeek R1',
    provider: 'together',
    description: 'Advanced reasoning model optimized for complex tasks',
    consumption: '0.5x',
    category: 'Together.ai',
    premium: true
  },
  {
    id: 'Qwen/Qwen2.5-72B-Instruct-Turbo',
    name: 'Qwen 2.5 72B Turbo',
    provider: 'together',
    description: 'Alibaba\'s flagship model with multilingual capabilities',
    consumption: '0.5x',
    category: 'Together.ai',
    premium: true
  }
]

const CHAT_TEMPLATES = [
  {
    title: 'Creative Writing',
    prompt: 'Help me write a creative story about...',
    icon: '✍️'
  },
  {
    title: 'Code Review',
    prompt: 'Please review this code and suggest improvements:\n\n```\n// Paste your code here\n```',
    icon: '💻'
  },
  {
    title: 'Data Analysis',
    prompt: 'Analyze this data and provide insights...',
    icon: '📊'
  },
  {
    title: 'Business Strategy',
    prompt: 'Help me develop a business strategy for...',
    icon: '💼'
  },
  {
    title: 'Learning Assistant',
    prompt: 'Explain this concept in simple terms...',
    icon: '🎓'
  },
  {
    title: 'Content Creation',
    prompt: 'Create engaging content for...',
    icon: '📝'
  }
]

export default function ChatPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [modelSearch, setModelSearch] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Filter and group models
  const filteredModels = AI_MODELS.filter(model => 
    model.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
    model.description.toLowerCase().includes(modelSearch.toLowerCase())
  )

  const groupedModels = filteredModels.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = []
    }
    acc[model.category].push(model)
    return acc
  }, {} as Record<string, typeof AI_MODELS>)

  const currentSession = sessions.find(s => s.id === currentSessionId)
  const selectedModelInfo = AI_MODELS.find(m => m.id === selectedModel)

  // Remove demo sessions - start with empty chat
  // useEffect(() => {
  //   // Load demo sessions
  //   const demoSessions: ChatSession[] = [...]
  //   setSessions(demoSessions)
  //   setCurrentSessionId(demoSessions[0].id)
  // }, [])

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      model: selectedModel,
      lastActivity: new Date(),
      messages: []
    }
    setSessions(prev => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
  }

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    }

    // Update session with user message
    setSessions(prev => prev.map(session => 
      session.id === currentSessionId 
        ? { 
            ...session, 
            messages: [...session.messages, userMessage],
            lastActivity: new Date(),
            title: session.messages.length === 0 ? message.substring(0, 50) + '...' : session.title
          }
        : session
    ))

    setMessage('')
    setIsLoading(true)

    try {
      // Get conversation history for current session
      const currentSessionData = sessions.find(s => s.id === currentSessionId)
      const conversationHistory = currentSessionData?.messages || []
      
      // Prepare messages for API
      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: userMessage.content
        }
      ]

      // Call the real AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model: selectedModel,
          maxTokens: 1000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content,
          timestamp: new Date(),
          model: data.model,
          tokens: data.usage?.total_tokens || data.usage?.input_tokens + data.usage?.output_tokens || 0
        }

        setSessions(prev => prev.map(session => 
          session.id === currentSessionId 
            ? { ...session, messages: [...session.messages, assistantMessage] }
            : session
        ))
      } else {
        throw new Error(data.message || 'API request failed')
      }

    } catch (error) {
      console.error('Chat error:', error)
      
      // Show error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. This might be due to API configuration or network issues. Please make sure your API keys are properly configured in the environment variables.`,
        timestamp: new Date(),
        model: selectedModel,
        tokens: 0
      }

      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { ...session, messages: [...session.messages, errorMessage] }
          : session
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const loadTemplate = (template: typeof CHAT_TEMPLATES[0]) => {
    setMessage(template.prompt)
    textareaRef.current?.focus()
  }

  // File upload handlers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setMessage(prev => prev + `\n[Image uploaded: ${file.name}]`)
        // In real implementation, you'd upload the file and get a URL
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setMessage(prev => prev + `\n[File uploaded: ${file.name}]`)
      // In real implementation, you'd upload the file and get a URL
    }
  }

  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        // In real implementation, you'd:
        // 1. Upload the audio file
        // 2. Convert speech to text using the speech-to-text API
        // 3. Add the transcribed text to the message
        setMessage(prev => prev + '\n[Voice recording transcribed: "Your voice message here"]')
        
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

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
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <Button onClick={createNewSession} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Model Selector */}
        <div className="p-4 border-b">
          <div className="flex space-x-4 mb-6 relative">
            <Button
              variant={showModelSelector ? 'default' : 'outline'}
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center space-x-2"
            >
              <Brain className="w-4 h-4" />
              <span>{AI_MODELS.find(m => m.id === selectedModel)?.name || selectedModel}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>

            {showModelSelector && (
              <div className="absolute top-12 left-0 z-50 w-96 bg-background border border-border rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search models..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                  />
                </div>
                
                {Object.entries(groupedModels).map(([category, models]) => (
                  <div key={category} className="mb-4">
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2 px-2">{category}</h4>
                    <div className="space-y-1">
                      {models.map((model) => (
                        <div
                          key={model.id}
                          className={`p-3 rounded-md cursor-pointer transition-colors ${
                            selectedModel === model.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => {
                            setSelectedModel(model.id)
                            setShowModelSelector(false)
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">{model.name}</span>
                                {model.premium && (
                                  <Badge variant="secondary" className="text-xs">Premium</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
                            </div>
                            <div className="ml-2">
                              <Badge 
                                variant={model.consumption === 'Unlimited' ? 'default' : 'outline'}
                                className="text-xs"
                              >
                                {model.consumption}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Sessions */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">Recent Chats</h3>
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                  currentSessionId === session.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                }`}
                onClick={() => setCurrentSessionId(session.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{session.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {AI_MODELS.find(m => m.id === session.model)?.name || session.model}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {session.messages.length} messages
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentSession ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold">{currentSession.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    Using {selectedModelInfo?.name} • {currentSession.messages.length} messages
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge>{selectedModelInfo?.provider}</Badge>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentSession.messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Bot className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
                  <p className="text-muted-foreground mb-8">
                    Choose a template below or start typing your message
                  </p>

                  {/* Chat Templates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                    {CHAT_TEMPLATES.map((template, index) => (
                      <Card 
                        key={index}
                        className="p-4 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]"
                        onClick={() => loadTemplate(template)}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{template.icon}</span>
                          <div className="text-left">
                            <h3 className="font-medium">{template.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {template.prompt.substring(0, 40)}...
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {currentSession.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            msg.role === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            {msg.role === 'user' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </div>
                          <div className={`px-4 py-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground ml-auto'
                              : 'bg-muted'
                          }`}>
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              {msg.content.split('\n').map((line, i) => (
                                <p key={i} className="mb-2 last:mb-0">
                                  {line.startsWith('## ') ? (
                                    <strong>{line.substring(3)}</strong>
                                  ) : line.startsWith('**') && line.endsWith('**') ? (
                                    <strong>{line.substring(2, -2)}</strong>
                                  ) : (
                                    line
                                  )}
                                </p>
                              ))}
                            </div>
                            {msg.role === 'assistant' && (
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <span>{msg.model}</span>
                                  {msg.tokens && <span>• {msg.tokens} tokens</span>}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {msg.timestamp.toLocaleTimeString()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-muted px-4 py-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="w-full p-3 pr-16 border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px] max-h-32"
                        rows={1}
                      />
                      <div className="absolute right-3 bottom-2 flex items-center space-x-1">
                        {/* Image Upload Button */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => imageInputRef.current?.click()}
                          title="Upload Image"
                        >
                          <Image className="w-4 h-4" />
                        </Button>
                        
                        {/* File Upload Button */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => fileInputRef.current?.click()}
                          title="Upload File"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        
                        {/* Voice Recording Button */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`h-8 w-8 p-0 ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
                          onClick={isRecording ? stopRecording : startRecording}
                          title={isRecording ? `Recording ${formatTime(recordingTime)}` : "Voice Recording"}
                        >
                          {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={sendMessage}
                    disabled={!message.trim() || isLoading}
                    className="h-11"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <span>Model: {selectedModelInfo?.name}</span>
                </div>
              </div>
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Select a chat to continue</h2>
              <p className="text-muted-foreground">Or start a new conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 