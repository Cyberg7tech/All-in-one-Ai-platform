'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Send,
  Plus,
  Bot,
  User,
  Settings,
  Image as ImageIcon,
  FileText,
  Mic,
  ChevronDown,
  Square,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
// import { dbHelpers } from '@/lib/supabase/client'; // Removed in BuilderKit restructure

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  user_name?: string;
  user_email?: string;
  model?: string;
  tokens?: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  lastActivity: Date;
}

const CHAT_TEMPLATES = [
  {
    title: 'Creative Writing',
    prompt: 'Help me write a creative story about...',
    icon: '✍️',
  },
  {
    title: 'Code Review',
    prompt: 'Please review this code and suggest improvements:\n\n```\n// Paste your code here\n```',
    icon: '💻',
  },
  {
    title: 'Data Analysis',
    prompt: 'Analyze this data and provide insights...',
    icon: '📊',
  },
  {
    title: 'Business Strategy',
    prompt: 'Help me develop a business strategy for...',
    icon: '💼',
  },
  {
    title: 'Learning Assistant',
    prompt: 'Explain this concept in simple terms...',
    icon: '🎓',
  },
  {
    title: 'Content Creation',
    prompt: 'Create engaging content for...',
    icon: '📝',
  },
];

// Fallback list; replaced at runtime by models from the API when available
const MULTI_LLM_MODELS = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    category: 'chat',
    tier: 'standard',
    capabilities: ['chat', 'reasoning'],
    contextWindow: 128000,
    speed: 'fast',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    category: 'chat',
    tier: 'premium',
    capabilities: ['chat', 'reasoning', 'vision'],
    contextWindow: 128000,
    speed: 'fast',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    category: 'chat',
    tier: 'premium',
    capabilities: ['chat', 'reasoning'],
    contextWindow: 200000,
    speed: 'fast',
  },
  {
    id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    name: 'Llama 3.1 70B Turbo ⚡',
    provider: 'Together AI',
    category: 'chat',
    tier: 'premium',
    capabilities: ['chat', 'reasoning'],
    contextWindow: 131072,
    speed: 'fast',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    category: 'chat',
    tier: 'premium',
    capabilities: ['chat', 'reasoning', 'vision'],
    contextWindow: 1000000,
    speed: 'fast',
  },
];

export default function MultiLLMChatPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [modelSearch, setModelSearch] = useState('');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [availableModels, setAvailableModels] = useState<typeof MULTI_LLM_MODELS>(MULTI_LLM_MODELS);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter and group models
  const filteredModels = useMemo(
    () =>
      availableModels.filter(
        (model) =>
          model.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
          model.provider.toLowerCase().includes(modelSearch.toLowerCase()) ||
          model.capabilities.some((cap) => cap.toLowerCase().includes(modelSearch.toLowerCase()))
      ),
    [modelSearch, availableModels]
  );

  const groupedModels = useMemo(
    () =>
      filteredModels.reduce(
        (acc, model) => {
          if (!acc[model.category]) {
            acc[model.category] = [];
          }
          acc[model.category].push(model);
          return acc;
        },
        {} as Record<string, typeof MULTI_LLM_MODELS>
      ),
    [filteredModels]
  );

  const currentSession = useMemo(
    () => sessions.find((s) => s.id === currentSessionId),
    [sessions, currentSessionId]
  );
  const selectedModelInfo = useMemo(
    () => availableModels.find((m) => m.id === selectedModel),
    [availableModels, selectedModel]
  );

  // Refs for preventing infinite loops
  const hasFetchedSessions = useRef(false);

  // Load available models from API once
  useEffect(() => {
    const loadModels = async () => {
      try {
        const res = await fetch('/api/ai/models');
        if (!res.ok) return;
        const data = await res.json();
        const models = (data?.models?.all || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          provider: m.provider,
          category: m.category,
          tier: m.tier,
          capabilities: m.capabilities || ['chat'],
          contextWindow: m.contextWindow || 32768,
          speed: m.speed || 'fast',
        }));
        if (models.length > 0) {
          setAvailableModels(models);
          const preferred = models.find((m: any) => m.provider === 'together') || models[0];
          if (preferred) setSelectedModel(preferred.id);
        }
      } catch (e) {
        console.warn('Failed to load models; using fallback list');
      }
    };
    loadModels();
  }, []);

  // Load chat sessions from DB only once when user.id is available
  useEffect(() => {
    if (!user?.id || hasFetchedSessions.current) return;

    const fetchSessions = async () => {
      console.log('🔄 Fetching chat sessions for user:', user.id);
      setIsLoadingSessions(true);
      try {
        // TODO: Replace with direct Supabase calls
        // const dbSessions = await dbHelpers.getChatSessions(user.id);
        const dbSessions: any[] = [];

        if (dbSessions && dbSessions.length > 0) {
          const mappedSessions = dbSessions.map((s: any) => ({
            id: String(s.id),
            title: String(s.title || 'New Chat'),
            model: String(s.model_id || 'gpt-4o-mini'),
            lastActivity: new Date(String(s.updated_at || s.created_at)),
            messages: (s.chat_messages || []).map((m: any) => ({
              id: String(m.id),
              role: m.role as 'user' | 'assistant',
              content: String(m.content),
              timestamp: new Date(String(m.created_at)),
              user_name: m.user_name ? String(m.user_name) : undefined,
              user_email: m.user_email ? String(m.user_email) : undefined,
            })),
          }));
          setSessions(mappedSessions);
          if (mappedSessions.length > 0) {
            setCurrentSessionId(mappedSessions[0].id);
          }
          console.log('✅ Loaded', mappedSessions.length, 'chat sessions');
        } else {
          setSessions([]);
          setCurrentSessionId(null);
          console.log('ℹ️ No existing chat sessions found');
        }
      } catch (error) {
        console.error('❌ Error fetching sessions:', error);
        setSessions([]);
        setCurrentSessionId(null);
      } finally {
        setIsLoadingSessions(false);
        hasFetchedSessions.current = true;
      }
    };

    fetchSessions();
  }, [user?.id]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages?.length, scrollToBottom]);

  // Cleanup recording interval on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    };
  }, []);

  // TODO: Add stripMarkdown utility function when implementing actual database calls

  // Create new session in DB
  const [isCreating, setIsCreating] = useState(false);
  const createNewSession = useCallback(async () => {
    if (!user?.id || isCreating) return;
    setIsCreating(true);
    setShowModelPicker(false);
    // TODO: Replace with direct Supabase calls
    // const session = await dbHelpers.createChatSession({
    //   user_id: user.id,
    //   title: 'New Chat',
    //   model_id: selectedModel,
    // });
    const session = {
      id: Date.now().toString(),
      title: 'New Chat',
      model_id: selectedModel,
      updated_at: new Date().toISOString(),
    }; // Temporary mock
    setSessions((prev) => [
      {
        id: String(session.id),
        title: String(session.title),
        model: String(session.model_id),
        lastActivity: new Date(String(session.updated_at)),
        messages: [],
      },
      ...prev,
    ]);
    setCurrentSessionId(String(session.id));
    setIsCreating(false);
  }, [user?.id, selectedModel, isCreating]);

  // Generate smart chat title based on message content
  const generateChatTitle = useCallback((messageContent: string): string => {
    // Remove extra whitespace and limit length
    const cleanContent = messageContent.trim().substring(0, 50);

    // If message is short, use it as-is
    if (cleanContent.length <= 25) {
      return cleanContent;
    }

    // For longer messages, try to find a good breaking point
    const words = cleanContent.split(' ');
    let title = '';

    for (const word of words) {
      if ((title + ' ' + word).length > 30) break;
      title += (title ? ' ' : '') + word;
    }

    return title || cleanContent.substring(0, 30) + '...';
  }, []);

  // Update chat title based on conversation context
  const updateChatTitle = useCallback(
    async (sessionId: string, firstMessage: string) => {
      try {
        const smartTitle = generateChatTitle(firstMessage);

        // Update in database
        // TODO: Replace with direct Supabase calls
        // await dbHelpers.updateChatSession(sessionId, { title: smartTitle });

        // Update in UI state
        setSessions((prev) =>
          prev.map((session) => (session.id === sessionId ? { ...session, title: smartTitle } : session))
        );
      } catch (error) {
        console.error('Error updating chat title:', error);
      }
    },
    [generateChatTitle]
  );

  // Send message and store in DB
  const sendMessage = useCallback(async () => {
    if (!message.trim() || isLoading || !user?.id) return;

    // Store the message content before clearing the input
    const messageContent = message.trim();

    // Clear the input immediately
    setMessage('');

    setIsLoading(true);

    // Create AbortController for this request
    const abortController = new AbortController();
    const { signal } = abortController;

    try {
      let sessionId: string = currentSessionId || '';

      // If no session, create one
      if (!sessionId) {
        // TODO: Replace with direct Supabase calls
        // const session = await dbHelpers.createChatSession({
        //   user_id: user.id,
        //   title: 'New Chat',
        //   model_id: selectedModel,
        // });
        const session = {
          id: Date.now().toString(),
          title: 'New Chat',
          model_id: selectedModel,
          updated_at: new Date().toISOString(),
        }; // Temporary mock
        sessionId = String(session.id);
        setSessions((prev) => [
          {
            id: String(session.id),
            title: String(session.title),
            model: String(session.model_id),
            lastActivity: new Date(String(session.updated_at)),
            messages: [],
          },
          ...prev,
        ]);
        setCurrentSessionId(String(session.id));
      }

      // Store user message
      // TODO: Replace with direct Supabase calls
      // const userMsg = await dbHelpers.addChatMessage({
      //   session_id: sessionId,
      //   user_id: user.id,
      //   role: 'user' as const,
      //   content: messageContent,
      //   tokens_used: 0, // User messages don't consume tokens
      //   model_used: selectedModel,
      //   cost: 0,
      // });
      const userMsg = {
        id: Date.now().toString(),
        content: messageContent,
        created_at: new Date().toISOString(),
      }; // Temporary mock

      // Immediately add user message to UI state so it shows up right away
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                messages: [
                  ...session.messages,
                  {
                    id: String(userMsg.id),
                    role: 'user' as const,
                    content: String(userMsg.content),
                    timestamp: new Date(String(userMsg.created_at)),
                    user_name: user.name ? String(user.name) : user.email,
                    user_email: user.email ? String(user.email) : undefined,
                  },
                ],
                lastActivity: new Date(),
              }
            : session
        )
      );

      // Call AI API
      const currentSession = sessions.find((s) => s.id === sessionId);
      const conversationHistory = currentSession?.messages || [];

      // Prepare messages with system context and conversation history
      const messages = [
        {
          role: 'system',
          content: `Current date and time: ${new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })} at ${new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
          })}. Always use this as the current date when responding to user questions about time or date. Respond naturally without markdown formatting.`,
        },
        // Add conversation history
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        // Add current user message
        { role: 'user', content: messageContent },
      ];

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          model: selectedModel,
          maxTokens: 1000,
          temperature: 0.7,
        }),
        signal,
      });

      if (signal.aborted) {
        throw new Error('Request was aborted');
      }

      const data = await response.json();

      // Store assistant message
      let assistantMsg: any = null;
      if (data.success) {
        // TODO: Replace with direct Supabase calls
        // assistantMsg = await dbHelpers.addChatMessage({
        //   session_id: sessionId,
        //   user_id: user.id,
        //   role: 'assistant' as const,
        //   content: data.content, // TODO: Add stripMarkdown utility
        //   tokens_used: data.usage?.total_tokens || 0,
        //   model_used: selectedModel,
        //   cost: data.cost || 0,
        // });
        assistantMsg = { id: Date.now().toString() }; // Temporary mock
        // TODO: Replace with direct Supabase calls
        // await dbHelpers.addChatMessage({
        //   session_id: sessionId,
        //   user_id: user.id,
        //   role: 'assistant' as const,
        //   content: cleanContent,
        //   tokens_used: data.usage?.total_tokens || 0,
        //   model_used: selectedModel,
        //   cost: data.cost || 0,
        // });
      }

      // Update session state with assistant message only (user message already added)
      if (assistantMsg) {
        setSessions((prev) =>
          prev.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [
                    ...session.messages,
                    {
                      id: String(assistantMsg.id),
                      role: 'assistant' as const,
                      content: String(assistantMsg.content),
                      timestamp: new Date(String(assistantMsg.created_at)),
                      user_name: user.name ? String(user.name) : user.email,
                      user_email: user.email ? String(user.email) : undefined,
                    },
                  ],
                  lastActivity: new Date(),
                }
              : session
          )
        );

        // Update chat title if this is the first exchange (total 2 messages after adding assistant message)
        setSessions((prev) => {
          const updatedSession = prev.find((s) => s.id === sessionId);
          const totalMessages = updatedSession ? updatedSession.messages.length : 0;

          // If this is the first exchange (2 total messages) and title is still "New Chat"
          if (totalMessages === 2 && updatedSession?.title === 'New Chat') {
            updateChatTitle(sessionId, messageContent);
          }

          return prev; // Return unchanged since we're just checking
        });
      }
    } catch (error) {
      if (signal.aborted) {
        console.log('Request was aborted');
      } else {
        console.error('Error in sendMessage:', error);
        // Optionally show an error message to the user
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    message,
    isLoading,
    user?.id,
    currentSessionId,
    selectedModel,
    sessions,
    updateChatTitle,
    user?.name,
    user?.email,
  ]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const loadTemplate = useCallback((template: (typeof CHAT_TEMPLATES)[0]) => {
    setMessage(template.prompt);
    textareaRef.current?.focus();
  }, []);

  // File upload handlers
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setMessage((prev) => prev + `\n[Image uploaded: ${file.name}]`);
        // In real implementation, you'd upload the file and get a URL
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMessage((prev) => prev + `\n[File uploaded: ${file.name}]`);
      // In real implementation, you'd upload the file and get a URL
    }
  }, []);

  // Voice recording handlers
  const startRecording = useCallback(async () => {
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
        // In real implementation, you'd:
        // 1. Upload the audio file
        // 2. Convert speech to text using the speech-to-text API
        // 3. Add the transcribed text to the message
        setMessage((prev) => prev + '\n[Voice recording transcribed: "Your voice message here"]');

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
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Delete session and its messages
  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        // TODO: Replace with direct Supabase calls
        // await dbHelpers.deleteChatSession(sessionId);
        // TODO: Replace with direct Supabase calls
        // await dbHelpers.deleteChatSession(sessionId);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (currentSessionId === sessionId) {
          const remainingSessions = sessions.filter((s) => s.id !== sessionId);
          setCurrentSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
        }
      } catch (error) {
        console.error('Error deleting chat session:', error);
        // Still remove from UI even if DB deletion fails
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (currentSessionId === sessionId) {
          const remainingSessions = sessions.filter((s) => s.id !== sessionId);
          setCurrentSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
        }
      }
    },
    [currentSessionId, sessions]
  );

  return (
    <div className='flex h-[calc(100vh-64px)] bg-background'>
      {/* Sidebar */}
      <div className='w-80 border-r bg-muted/20 flex flex-col'>
        {/* Header */}
        <div className='p-4 border-b'>
          <Button onClick={createNewSession} className='w-full' disabled={isCreating}>
            <Plus className='size-4 mr-2' />
            New Chat
          </Button>
        </div>

        {/* Model Selector */}
        <div className='p-4 border-b'>
          <div className='flex space-x-4 mb-6 relative'>
            <Button
              variant={showModelPicker ? 'default' : 'outline'}
              onClick={() => setShowModelPicker(!showModelPicker)}
              className='flex items-center space-x-2'>
              <Sparkles className='size-4' />
              <span>{selectedModelInfo?.name || selectedModel}</span>
              <ChevronDown className='size-4' />
            </Button>

            {showModelPicker && (
              <div className='absolute top-12 left-0 z-50 w-96 bg-background border border-border rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto'>
                <div className='mb-4'>
                  <input
                    type='text'
                    placeholder='Search models...'
                    className='w-full px-3 py-2 border border-border rounded-md bg-background text-foreground'
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                  />
                </div>

                {Object.entries(groupedModels).map(([category, models]) => (
                  <div key={category} className='mb-4'>
                    <h4 className='font-semibold text-sm text-muted-foreground mb-2 px-2'>{category}</h4>
                    <div className='space-y-1'>
                      {models.map((model) => (
                        <div
                          key={model.id}
                          className={`p-3 rounded-md cursor-pointer transition-colors ${
                            selectedModel === model.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => {
                            setSelectedModel(model.id);
                            setShowModelPicker(false);
                          }}>
                          <div className='flex items-center justify-between'>
                            <div className='flex-1'>
                              <div className='flex items-center space-x-2'>
                                <span className='font-medium text-sm'>{model.name}</span>
                                {model.tier === 'premium' && (
                                  <Badge variant='secondary' className='text-xs'>
                                    Premium
                                  </Badge>
                                )}
                              </div>
                              <p className='text-xs text-muted-foreground mt-1'>
                                {model.provider} • {model.capabilities.join(', ')} • {model.speed}
                              </p>
                            </div>
                            <div className='ml-2'>
                              <Badge
                                variant={model.tier === 'premium' ? 'default' : 'outline'}
                                className='text-xs'>
                                {model.tier === 'premium'
                                  ? 'Premium'
                                  : model.tier === 'standard'
                                    ? 'Standard'
                                    : 'Open Source'}
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
        <div className='flex-1 overflow-y-auto'>
          <div className='p-2'>
            <h3 className='text-sm font-medium text-muted-foreground mb-2 px-2'>Recent Chats</h3>
            {isLoadingSessions ? (
              <div className='flex justify-center items-center h-full'>
                <div className='size-8 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className='flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto text-center'>
                <div className='size-16 bg-primary/10 rounded-full flex items-center justify-center mb-4'>
                  <Bot className='size-8 text-primary' />
                </div>
                <h2 className='text-2xl font-bold mb-2'>No recent chats</h2>
                <p className='text-muted-foreground mb-8'>Start a new conversation to begin</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                    currentSessionId === session.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setCurrentSessionId(session.id)}>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-sm font-medium truncate'>{session.title}</span>
                    <Badge variant='outline' className='text-xs'>
                      {MULTI_LLM_MODELS.find((m) => m.id === session.model)?.name || session.model}
                    </Badge>
                  </div>
                  <p className='text-xs text-muted-foreground'>{session.messages.length} messages</p>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-xs text-muted-foreground hover:text-red-500'
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}>
                    Delete
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col'>
        {currentSession ? (
          <>
            {/* Chat Header */}
            <div className='p-4 border-b bg-background'>
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-lg font-semibold'>{currentSession.title}</h1>
                  <p className='text-sm text-muted-foreground'>
                    Using {selectedModelInfo?.name} • {currentSession.messages.length} messages
                  </p>
                </div>
                <div className='flex items-center space-x-2'>
                  <Badge>{selectedModelInfo?.provider}</Badge>
                  <Button variant='ghost' size='sm'>
                    <Settings className='size-4' />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
              {currentSession.messages.length === 0 ? (
                <div className='flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto text-center'>
                  <div className='size-16 bg-primary/10 rounded-full flex items-center justify-center mb-4'>
                    <Bot className='size-8 text-primary' />
                  </div>
                  <h2 className='text-2xl font-bold mb-2'>How can I help you today?</h2>
                  <p className='text-muted-foreground mb-8'>
                    Choose a template below or start typing your message
                  </p>

                  {/* Chat Templates */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl'>
                    {CHAT_TEMPLATES.map((template, index) => (
                      <Card
                        key={index}
                        className='p-4 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]'
                        onClick={() => loadTemplate(template)}>
                        <div className='flex items-center space-x-3'>
                          <span className='text-2xl'>{template.icon}</span>
                          <div className='text-left'>
                            <h3 className='font-medium'>{template.title}</h3>
                            <p className='text-sm text-muted-foreground'>
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
                  {currentSession.messages
                    .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div
                              className={`size-8 rounded-full flex items-center justify-center ${
                                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                              }`}>
                              {msg.role === 'user' ? <User className='size-4' /> : <Bot className='size-4' />}
                            </div>
                            <div
                              className={`rounded-lg px-4 py-2 text-sm whitespace-pre-line ${
                                msg.role === 'user'
                                  ? 'bg-primary text-primary-foreground ml-auto'
                                  : 'bg-muted'
                              }`}>
                              {msg.content}
                            </div>
                            {msg.role === 'assistant' && (
                              <div className='flex items-center justify-between mt-2 pt-2 border-t border-border/20'>
                                <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
                                  <span>{msg.model}</span>
                                  {msg.tokens && <span>• {msg.tokens} tokens</span>}
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  {msg.timestamp.toLocaleTimeString()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  {isLoading && (
                    <div className='flex justify-start'>
                      <div className='flex items-start space-x-3'>
                        <div className='size-8 rounded-full bg-muted flex items-center justify-center'>
                          <Bot className='size-4' />
                        </div>
                        <div className='bg-muted px-4 py-3 rounded-lg'>
                          <div className='flex space-x-1'>
                            <div className='size-2 bg-muted-foreground rounded-full animate-bounce'></div>
                            <div
                              className='size-2 bg-muted-foreground rounded-full animate-bounce'
                              style={{ animationDelay: '0.1s' }}></div>
                            <div
                              className='size-2 bg-muted-foreground rounded-full animate-bounce'
                              style={{ animationDelay: '0.2s' }}></div>
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
            <div className='p-4 border-t bg-background'>
              <div className='max-w-4xl mx-auto'>
                <div className='flex items-end space-x-2'>
                  <div className='flex-1'>
                    <div className='relative'>
                      <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder='Type your message...'
                        className='w-full p-3 pr-16 border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px] max-h-32'
                        rows={1}
                      />
                      <div className='absolute right-3 bottom-2 flex items-center space-x-1'>
                        {/* Image Upload Button */}
                        <Button
                          variant='ghost'
                          size='sm'
                          className='size-8 p-0'
                          onClick={() => imageInputRef.current?.click()}
                          title='Upload Image'>
                          <ImageIcon className='size-4' />
                        </Button>

                        {/* File Upload Button */}
                        <Button
                          variant='ghost'
                          size='sm'
                          className='size-8 p-0'
                          onClick={() => fileInputRef.current?.click()}
                          title='Upload File'>
                          <FileText className='size-4' />
                        </Button>

                        {/* Voice Recording Button */}
                        <Button
                          variant='ghost'
                          size='sm'
                          className={`size-8 p-0 ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
                          onClick={isRecording ? stopRecording : startRecording}
                          title={isRecording ? `Recording ${formatTime(recordingTime)}` : 'Voice Recording'}>
                          {isRecording ? <Square className='size-4' /> : <Mic className='size-4' />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button onClick={sendMessage} disabled={!message.trim() || isLoading} className='h-11'>
                    <Send className='size-4' />
                  </Button>
                </div>

                <div className='flex items-center justify-between mt-2 text-xs text-muted-foreground'>
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <span>Model: {selectedModelInfo?.name}</span>
                </div>
              </div>
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={imageInputRef}
              type='file'
              accept='image/*'
              onChange={handleImageUpload}
              className='hidden'
            />
            <input ref={fileInputRef} type='file' onChange={handleFileUpload} className='hidden' />
          </>
        ) : (
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <Bot className='size-16 text-muted-foreground mx-auto mb-4' />
              <h2 className='text-xl font-semibold mb-2'>Select a chat to continue</h2>
              <p className='text-muted-foreground'>Or start a new conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
