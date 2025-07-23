'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bot, Brain, Zap, Search, MessageSquare, Code, Mail, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface AgentTemplate {
  id: string
  name: string
  description: string
  type: 'customer_service' | 'data_analyst' | 'content_creator' | 'researcher' | 'developer'
  icon: any
  tools: string[]
  model: string
  personality: {
    tone: string
    expertise: string[]
    restrictions: string[]
  }
  useCase: string
  prompt: string
}

const agentTemplates: AgentTemplate[] = [
  {
    id: 'customer-service',
    name: 'Customer Service Agent',
    description: 'Handle customer inquiries, support tickets, and provide helpful assistance with empathy and professionalism.',
    type: 'customer_service',
    icon: MessageSquare,
    tools: ['web_search', 'vector_search', 'send_email'],
    model: 'gpt-4',
    personality: {
      tone: 'friendly',
      expertise: ['customer service', 'problem solving', 'product knowledge'],
      restrictions: ['Do not make promises about refunds without approval', 'Always escalate complex technical issues']
    },
    useCase: 'Perfect for e-commerce, SaaS, and service businesses',
    prompt: 'You are a helpful and empathetic customer service representative. Always be polite, professional, and solution-focused.'
  },
  {
    id: 'data-analyst',
    name: 'Data Analysis Expert',
    description: 'Analyze complex datasets, generate insights, create forecasts, and detect anomalies in your business data.',
    type: 'data_analyst',
    icon: Brain,
    tools: ['forecast_data', 'detect_anomalies', 'code_interpreter', 'vector_search'],
    model: 'claude-3-opus',
    personality: {
      tone: 'technical',
      expertise: ['statistics', 'data analysis', 'forecasting', 'machine learning', 'business intelligence'],
      restrictions: ['Always verify data quality before analysis', 'Explain methodology clearly']
    },
    useCase: 'Ideal for business intelligence and data-driven decisions',
    prompt: 'You are an expert data analyst. Provide clear, accurate analysis with actionable insights and always explain your methodology.'
  },
  {
    id: 'content-creator',
    name: 'Content Creation Specialist',
    description: 'Generate engaging content, social media posts, marketing copy, and creative materials that align with your brand.',
    type: 'content_creator',
    icon: Image,
    tools: ['generate_image', 'web_search', 'vector_search'],
    model: 'gpt-4',
    personality: {
      tone: 'creative',
      expertise: ['content creation', 'copywriting', 'social media', 'brand voice', 'SEO'],
      restrictions: ['Maintain brand consistency', 'Ensure content is original and engaging']
    },
    useCase: 'Great for marketing teams and content creators',
    prompt: 'You are a creative content specialist. Create engaging, original content that resonates with the target audience while maintaining brand voice.'
  },
  {
    id: 'researcher',
    name: 'Research Assistant',
    description: 'Conduct thorough research, fact-checking, competitive analysis, and provide comprehensive reports on any topic.',
    type: 'researcher',
    icon: Search,
    tools: ['web_search', 'vector_search'],
    model: 'claude-3-sonnet',
    personality: {
      tone: 'professional',
      expertise: ['research methodology', 'fact-checking', 'analysis', 'report writing'],
      restrictions: ['Always cite sources', 'Verify information accuracy', 'Maintain objectivity']
    },
    useCase: 'Perfect for market research and academic work',
    prompt: 'You are a thorough research assistant. Provide well-researched, accurate information with proper citations and maintain objectivity.'
  },
  {
    id: 'developer',
    name: 'Developer Assistant',
    description: 'Help with coding tasks, debugging, code reviews, architecture decisions, and technical documentation.',
    type: 'developer',
    icon: Code,
    tools: ['code_interpreter', 'web_search', 'vector_search'],
    model: 'gpt-4',
    personality: {
      tone: 'technical',
      expertise: ['programming', 'software architecture', 'debugging', 'best practices', 'documentation'],
      restrictions: ['Follow security best practices', 'Write clean, maintainable code', 'Explain complex concepts clearly']
    },
    useCase: 'Essential for development teams and solo developers',
    prompt: 'You are an experienced software developer. Provide clean, secure code with explanations and follow industry best practices.'
  }
]

const modelOptions = [
  { id: 'gpt-4', name: 'GPT-4', description: 'Most capable, best for complex reasoning', cost: '$$$' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective', cost: '$' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Excellent for analysis and writing', cost: '$$$' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance and speed', cost: '$$' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fastest for simple tasks', cost: '$' }
]

const availableTools = [
  { id: 'web_search', name: 'Web Search', description: 'Search the internet for current information' },
  { id: 'vector_search', name: 'Knowledge Base', description: 'Search through uploaded documents' },
  { id: 'forecast_data', name: 'Data Forecasting', description: 'Generate predictions from time series data' },
  { id: 'detect_anomalies', name: 'Anomaly Detection', description: 'Detect unusual patterns in data' },
  { id: 'generate_image', name: 'Image Generation', description: 'Create images using AI' },
  { id: 'code_interpreter', name: 'Code Execution', description: 'Execute and analyze code' },
  { id: 'send_email', name: 'Send Email', description: 'Send emails using Resend' }
]

export default function NewAgentPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null)
  const [step, setStep] = useState(1) // 1: template, 2: customize, 3: review
  const [agentData, setAgentData] = useState({
    name: '',
    description: '',
    model: 'gpt-4',
    tools: [] as string[],
    personality: {
      tone: 'professional',
      expertise: [] as string[],
      restrictions: [] as string[]
    },
    systemPrompt: ''
  })

  const handleTemplateSelect = (template: AgentTemplate) => {
    setSelectedTemplate(template)
    setAgentData({
      name: template.name,
      description: template.description,
      model: template.model,
      tools: template.tools,
      personality: template.personality,
      systemPrompt: template.prompt
    })
    setStep(2)
  }

  const handleCreateAgent = async () => {
    // Simulate agent creation
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/dashboard/agents')
  }

  if (step === 1) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" asChild className="mr-4">
            <Link href="/dashboard/agents">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Agents
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New AI Agent</h1>
            <p className="text-muted-foreground">Choose a template to get started quickly</p>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <template.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge className="mt-1">{template.type.replace('_', ' ')}</Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription>{template.description}</CardDescription>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Recommended Model:</p>
                  <Badge variant="outline">{template.model}</Badge>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Included Tools:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.tools.slice(0, 3).map((tool) => (
                      <Badge key={tool} variant="outline" className="text-xs">
                        {tool.replace('_', ' ')}
                      </Badge>
                    ))}
                    {template.tools.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tools.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">{template.useCase}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Agent Option */}
        <Card className="mt-6 border-dashed border-2">
          <CardContent className="p-6 text-center">
            <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start from Scratch</h3>
            <p className="text-muted-foreground mb-4">
              Create a completely custom agent with your own configuration
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedTemplate(null)
                setStep(2)
              }}
            >
              Create Custom Agent
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => setStep(1)} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Customize Your Agent</h1>
            <p className="text-muted-foreground">Configure your agent's capabilities and personality</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Define your agent's identity and purpose</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Agent Name</label>
                <input
                  type="text"
                  value={agentData.name}
                  onChange={(e) => setAgentData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-input rounded-md"
                  placeholder="Give your agent a descriptive name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={agentData.description}
                  onChange={(e) => setAgentData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-input rounded-md h-24"
                  placeholder="Describe what your agent does and how it helps users"
                />
              </div>
            </CardContent>
          </Card>

          {/* Model Selection */}
          <Card>
            <CardHeader>
              <CardTitle>AI Model</CardTitle>
              <CardDescription>Choose the AI model that powers your agent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modelOptions.map((model) => (
                  <div
                    key={model.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      agentData.model === model.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-input hover:border-primary/50'
                    }`}
                    onClick={() => setAgentData(prev => ({ ...prev, model: model.id }))}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{model.name}</h4>
                      <Badge variant="outline">{model.cost}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{model.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tools Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Tools & Capabilities</CardTitle>
              <CardDescription>Select the tools your agent can use</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTools.map((tool) => (
                  <div
                    key={tool.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      agentData.tools.includes(tool.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-input hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setAgentData(prev => ({
                        ...prev,
                        tools: prev.tools.includes(tool.id)
                          ? prev.tools.filter(t => t !== tool.id)
                          : [...prev.tools, tool.id]
                      }))
                    }}
                  >
                    <h4 className="font-medium mb-2">{tool.name}</h4>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Prompt */}
          <Card>
            <CardHeader>
              <CardTitle>System Prompt</CardTitle>
              <CardDescription>Define your agent's behavior and personality</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={agentData.systemPrompt}
                onChange={(e) => setAgentData(prev => ({ ...prev, systemPrompt: e.target.value }))}
                className="w-full p-3 border border-input rounded-md h-32"
                placeholder="You are a helpful AI assistant that..."
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setStep(1)}>
              Cancel
            </Button>
            <Button 
              onClick={() => setStep(3)}
              disabled={!agentData.name || !agentData.description || !agentData.systemPrompt}
            >
              Review & Create
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Review
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => setStep(2)} className="mr-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Customize
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Review Your Agent</h1>
          <p className="text-muted-foreground">Review your configuration before creating the agent</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span>{agentData.name}</span>
            </CardTitle>
            <CardDescription>{agentData.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">AI Model</h4>
                <Badge>{agentData.model}</Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Tools ({agentData.tools.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {agentData.tools.map((tool) => (
                    <Badge key={tool} variant="outline" className="text-xs">
                      {tool.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">System Prompt</h4>
              <div className="p-3 bg-muted rounded-md text-sm">
                {agentData.systemPrompt}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setStep(2)}>
            Edit Configuration
          </Button>
          <Button onClick={handleCreateAgent}>
            <Bot className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </div>
      </div>
    </div>
  )
} 