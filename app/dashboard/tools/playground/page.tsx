'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Play, Download, Copy, RefreshCw, BarChart3, Clock, Zap, Brain, Settings, Code, FileText } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

interface ModelResponse {
  id: string
  model: string
  content: string
  tokens: number
  cost: number
  responseTime: number
  timestamp: Date
}

interface TestResult {
  id: string
  prompt: string
  models: string[]
  responses: ModelResponse[]
  createdAt: Date
  tags: string[]
}

const AI_MODELS = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Most capable model for complex reasoning',
    icon: '🧠',
    costPer1k: 0.03,
    strengths: ['Reasoning', 'Code', 'Complex tasks'],
    limitations: ['Cost', 'Speed']
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: 'Fast and efficient for most tasks',
    icon: '⚡',
    costPer1k: 0.002,
    strengths: ['Speed', 'Cost-effective', 'General tasks'],
    limitations: ['Reasoning complexity']
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Excellent for analysis and creative writing',
    icon: '✨',
    costPer1k: 0.015,
    strengths: ['Analysis', 'Writing', 'Safety'],
    limitations: ['Cost', 'Availability']
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced performance and speed',
    icon: '🎵',
    costPer1k: 0.003,
    strengths: ['Balance', 'Reliability', 'Analysis'],
    limitations: ['Specialized tasks']
  },
  {
    id: 'llama-70b',
    name: 'Llama 2 70B',
    provider: 'Meta',
    description: 'Open-source alternative',
    icon: '🦙',
    costPer1k: 0.001,
    strengths: ['Open-source', 'Cost', 'Privacy'],
    limitations: ['Performance', 'Capabilities']
  }
]

const PROMPT_TEMPLATES = [
  {
    category: 'Reasoning',
    templates: [
      'Solve this logic puzzle step by step...',
      'Analyze the pros and cons of...',
      'Compare and contrast these options...'
    ]
  },
  {
    category: 'Creative Writing',
    templates: [
      'Write a short story about...',
      'Create a poem in the style of...',
      'Develop a character description for...'
    ]
  },
  {
    category: 'Code Generation',
    templates: [
      'Write a Python function that...',
      'Debug this code and explain the issue...',
      'Create a React component for...'
    ]
  },
  {
    category: 'Analysis',
    templates: [
      'Summarize the key points from this text...',
      'Identify the main themes in...',
      'Extract insights from this data...'
    ]
  }
]

const SAMPLE_RESULTS: TestResult[] = [
  {
    id: '1',
    prompt: 'Explain quantum computing in simple terms',
    models: ['gpt-4', 'claude-3-opus'],
    responses: [
      {
        id: '1-1',
        model: 'gpt-4',
        content: 'Quantum computing is like having a super-powered computer that can explore many possibilities at once...',
        tokens: 150,
        cost: 0.0045,
        responseTime: 2.3,
        timestamp: new Date(Date.now() - 60 * 60 * 1000)
      },
      {
        id: '1-2',
        model: 'claude-3-opus',
        content: 'Think of quantum computing as a fundamentally different way of processing information...',
        tokens: 160,
        cost: 0.0024,
        responseTime: 1.8,
        timestamp: new Date(Date.now() - 60 * 60 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    tags: ['Explanation', 'Technology']
  }
]

export default function PlaygroundPage() {
  const { user } = useAuth()
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4', 'claude-3-opus'])
  const [prompt, setPrompt] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>(SAMPLE_RESULTS)
  const [currentResponses, setCurrentResponses] = useState<ModelResponse[]>([])
  const [activeTab, setActiveTab] = useState<'test' | 'compare' | 'history'>('test')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(500)
  const [systemPrompt, setSystemPrompt] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    )
  }

  const runTest = async () => {
    if (!prompt.trim() || selectedModels.length === 0) return

    setIsRunning(true)
    setCurrentResponses([])
    
    try {
      const responses: ModelResponse[] = []
      
      // Run tests for each selected model
      for (const modelId of selectedModels) {
        const startTime = Date.now()
        
        // Call the real API
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
              { role: 'user', content: prompt }
            ],
            model: modelId,
            maxTokens,
            temperature
          })
        })

        const data = await response.json()
        const responseTime = (Date.now() - startTime) / 1000

        if (data.success) {
          const modelResponse: ModelResponse = {
            id: `${Date.now()}-${modelId}`,
            model: modelId,
            content: data.content,
            tokens: data.usage?.total_tokens || data.usage?.input_tokens + data.usage?.output_tokens || 0,
            cost: data.cost || 0,
            responseTime,
            timestamp: new Date()
          }
          
          responses.push(modelResponse)
          setCurrentResponses(prev => [...prev, modelResponse])
        } else {
          // Add error response
          const errorResponse: ModelResponse = {
            id: `${Date.now()}-${modelId}`,
            model: modelId,
            content: `Error: ${data.message || 'API request failed'}`,
            tokens: 0,
            cost: 0,
            responseTime,
            timestamp: new Date()
          }
          
          responses.push(errorResponse)
          setCurrentResponses(prev => [...prev, errorResponse])
        }
      }

      // Save test result
      const testResult: TestResult = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        models: selectedModels,
        responses,
        createdAt: new Date(),
        tags: ['Playground']
      }
      
      setResults(prev => [testResult, ...prev])
      
    } catch (error) {
      console.error('Test error:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const copyResponse = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const exportResults = () => {
    const data = {
      prompt,
      models: selectedModels,
      responses: currentResponses,
      settings: { temperature, maxTokens, systemPrompt },
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai_test_results_${Date.now()}.json`
    a.click()
  }

  const loadTemplate = (template: string) => {
    setPrompt(template)
    textareaRef.current?.focus()
  }

  const getModelInfo = (modelId: string) => {
    return AI_MODELS.find(m => m.id === modelId)
  }

  const calculateAverageStats = (responses: ModelResponse[]) => {
    if (responses.length === 0) return { avgTokens: 0, avgCost: 0, avgTime: 0 }
    
    return {
      avgTokens: responses.reduce((sum, r) => sum + r.tokens, 0) / responses.length,
      avgCost: responses.reduce((sum, r) => sum + r.cost, 0) / responses.length,
      avgTime: responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="mr-4">
          <Link href="/dashboard/explore">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Brain className="w-8 h-8 mr-3 text-primary" />
            AI Model Playground
          </h1>
          <p className="text-muted-foreground">Test and compare different AI models side by side</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <Button
          variant={activeTab === 'test' ? 'default' : 'outline'}
          onClick={() => setActiveTab('test')}
        >
          <Play className="w-4 h-4 mr-2" />
          Test Models
        </Button>
        <Button
          variant={activeTab === 'compare' ? 'default' : 'outline'}
          onClick={() => setActiveTab('compare')}
          disabled={currentResponses.length === 0}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Compare Results
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'outline'}
          onClick={() => setActiveTab('history')}
        >
          <Clock className="w-4 h-4 mr-2" />
          History ({results.length})
        </Button>
      </div>

      {activeTab === 'test' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Testing Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Prompt Input */}
            <Card>
              <CardHeader>
                <CardTitle>Prompt</CardTitle>
                <CardDescription>Enter your prompt to test across selected models</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt here..."
                  className="w-full p-3 border border-input rounded-md h-32 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {prompt.length} characters • {selectedModels.length} models selected
                  </span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPrompt('')}
                    >
                      Clear
                    </Button>
                    <Button 
                      onClick={runTest}
                      disabled={!prompt.trim() || selectedModels.length === 0 || isRunning}
                    >
                      {isRunning ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Run Test
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Model Responses */}
            {currentResponses.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {currentResponses.map((response) => {
                  const modelInfo = getModelInfo(response.model)
                  return (
                    <Card key={response.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{modelInfo?.icon}</span>
                            <div>
                              <CardTitle className="text-base">{modelInfo?.name}</CardTitle>
                              <CardDescription>{modelInfo?.provider}</CardDescription>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => copyResponse(response.content)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="max-h-64 overflow-y-auto p-3 bg-muted/50 rounded text-sm">
                          {response.content.startsWith('Error:') ? (
                            <p className="text-red-600">{response.content}</p>
                          ) : (
                            <p className="whitespace-pre-wrap">{response.content}</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Tokens:</span>
                            <p className="font-medium">{response.tokens}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cost:</span>
                            <p className="font-medium">${response.cost.toFixed(4)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Time:</span>
                            <p className="font-medium">{response.responseTime.toFixed(1)}s</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Prompt Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Prompt Templates</CardTitle>
                <CardDescription>Quick start with common prompt types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {PROMPT_TEMPLATES.map((category) => (
                    <div key={category.category}>
                      <h4 className="font-medium mb-2">{category.category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {category.templates.map((template, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="justify-start text-left h-auto p-2"
                            onClick={() => loadTemplate(template)}
                          >
                            <span className="text-xs">{template}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Model Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Models</CardTitle>
                <CardDescription>Choose models to test</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {AI_MODELS.map((model) => (
                  <div
                    key={model.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedModels.includes(model.id) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => toggleModel(model.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span>{model.icon}</span>
                        <span className="font-medium text-sm">{model.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        ${model.costPer1k}/1K
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{model.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {model.strengths.slice(0, 2).map((strength, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure model parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Temperature: {temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Controls randomness (0 = focused, 1 = creative)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value) || 500)}
                    min="1"
                    max="4000"
                    className="w-full p-2 border border-input rounded"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum response length
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    System Prompt (Optional)
                  </label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="You are a helpful assistant..."
                    className="w-full p-2 border border-input rounded h-20 resize-none text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Set the AI's behavior and context
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Export Results */}
            {currentResponses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Export Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={exportResults} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download JSON
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'compare' && currentResponses.length > 0 && (
        <div className="space-y-6">
          {/* Comparison Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(() => {
              const stats = calculateAverageStats(currentResponses)
              return (
                <>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Avg Tokens</p>
                          <p className="text-2xl font-bold">{Math.round(stats.avgTokens)}</p>
                        </div>
                        <FileText className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Avg Cost</p>
                          <p className="text-2xl font-bold">${stats.avgCost.toFixed(4)}</p>
                        </div>
                        <Zap className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Avg Time</p>
                          <p className="text-2xl font-bold">{stats.avgTime.toFixed(1)}s</p>
                        </div>
                        <Clock className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Models</p>
                          <p className="text-2xl font-bold">{currentResponses.length}</p>
                        </div>
                        <Brain className="w-8 h-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )
            })()}
          </div>

          {/* Side-by-side Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Model Comparison</CardTitle>
              <CardDescription>Compare responses side by side</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentResponses.map((response) => {
                  const modelInfo = getModelInfo(response.model)
                  return (
                    <div key={response.id} className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{modelInfo?.icon}</span>
                        <h3 className="font-semibold">{modelInfo?.name}</h3>
                        <Badge variant="outline">{modelInfo?.provider}</Badge>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{response.content}</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-muted-foreground">Tokens</p>
                          <p className="font-semibold">{response.tokens}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Cost</p>
                          <p className="font-semibold">${response.cost.toFixed(4)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Time</p>
                          <p className="font-semibold">{response.responseTime.toFixed(1)}s</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          {results.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{result.prompt.substring(0, 100)}...</CardTitle>
                    <CardDescription>
                      {result.createdAt.toLocaleString()} • {result.models.length} models
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {result.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.responses.map((response) => {
                    const modelInfo = getModelInfo(response.model)
                    return (
                      <div key={response.id} className="p-3 border rounded">
                        <div className="flex items-center space-x-2 mb-2">
                          <span>{modelInfo?.icon}</span>
                          <span className="font-medium text-sm">{modelInfo?.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3 mb-2">
                          {response.content}
                        </p>
                        <div className="flex justify-between text-xs">
                          <span>{response.tokens} tokens</span>
                          <span>${response.cost.toFixed(4)}</span>
                          <span>{response.responseTime.toFixed(1)}s</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {results.length === 0 && (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No test history</h3>
              <p className="text-muted-foreground mb-4">
                Run your first test to see results here
              </p>
              <Button onClick={() => setActiveTab('test')}>
                <Play className="w-4 h-4 mr-2" />
                Start Testing
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 