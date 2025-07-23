'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Play, Pause, Edit, Trash2, Settings, Zap, Clock, CheckCircle, AlertCircle, ArrowRight, Bot, Mail, FileText, Image, BarChart3, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

interface WorkflowStep {
  id: string
  type: 'trigger' | 'action' | 'condition'
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  config: Record<string, any>
  position: { x: number; y: number }
}

interface Workflow {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'draft'
  trigger: WorkflowStep
  steps: WorkflowStep[]
  executions: number
  lastRun?: Date
  nextRun?: Date
  createdAt: Date
  tags: string[]
}

const TRIGGER_TYPES = [
  {
    id: 'schedule',
    name: 'Schedule',
    description: 'Run on a schedule (daily, weekly, monthly)',
    icon: Clock,
    category: 'Time'
  },
  {
    id: 'webhook',
    name: 'Webhook',
    description: 'Trigger via HTTP webhook',
    icon: LinkIcon,
    category: 'Integration'
  },
  {
    id: 'file_upload',
    name: 'File Upload',
    description: 'When a new file is uploaded',
    icon: FileText,
    category: 'File'
  },
  {
    id: 'email_received',
    name: 'Email Received',
    description: 'When an email is received',
    icon: Mail,
    category: 'Communication'
  }
]

const ACTION_TYPES = [
  {
    id: 'ai_chat',
    name: 'AI Chat',
    description: 'Send message to AI model',
    icon: Bot,
    category: 'AI'
  },
  {
    id: 'generate_image',
    name: 'Generate Image',
    description: 'Create image with AI',
    icon: Image,
    category: 'AI'
  },
  {
    id: 'send_email',
    name: 'Send Email',
    description: 'Send email notification',
    icon: Mail,
    category: 'Communication'
  },
  {
    id: 'process_document',
    name: 'Process Document',
    description: 'Extract text and analyze document',
    icon: FileText,
    category: 'Document'
  },
  {
    id: 'create_report',
    name: 'Create Report',
    description: 'Generate data report',
    icon: BarChart3,
    category: 'Analytics'
  },
  {
    id: 'web_scrape',
    name: 'Web Scraping',
    description: 'Extract data from websites',
    icon: LinkIcon,
    category: 'Data'
  }
]

const SAMPLE_WORKFLOWS: Workflow[] = [
  {
    id: '1',
    name: 'Daily Sales Report',
    description: 'Generate and email daily sales reports automatically',
    status: 'active',
    trigger: {
      id: 'trigger-1',
      type: 'trigger',
      name: 'Daily Schedule',
      description: 'Every day at 9:00 AM',
      icon: Clock,
      config: { schedule: 'daily', time: '09:00' },
      position: { x: 0, y: 0 }
    },
    steps: [
      {
        id: 'step-1',
        type: 'action',
        name: 'Create Report',
        description: 'Generate sales analytics report',
        icon: BarChart3,
        config: { reportType: 'sales', period: 'daily' },
        position: { x: 200, y: 0 }
      },
      {
        id: 'step-2',
        type: 'action',
        name: 'Send Email',
        description: 'Email report to sales team',
        icon: Mail,
        config: { to: 'sales@company.com', subject: 'Daily Sales Report' },
        position: { x: 400, y: 0 }
      }
    ],
    executions: 45,
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    tags: ['Sales', 'Reporting', 'Automation']
  },
  {
    id: '2',
    name: 'Document Processing Pipeline',
    description: 'Automatically process uploaded documents with AI analysis',
    status: 'active',
    trigger: {
      id: 'trigger-2',
      type: 'trigger',
      name: 'File Upload',
      description: 'When a document is uploaded',
      icon: FileText,
      config: { fileTypes: ['pdf', 'docx'] },
      position: { x: 0, y: 0 }
    },
    steps: [
      {
        id: 'step-3',
        type: 'action',
        name: 'Process Document',
        description: 'Extract text and analyze content',
        icon: FileText,
        config: { features: ['text_extraction', 'summarization'] },
        position: { x: 200, y: 0 }
      },
      {
        id: 'step-4',
        type: 'action',
        name: 'AI Analysis',
        description: 'Generate insights with AI',
        icon: Bot,
        config: { model: 'gpt-4', task: 'analyze_document' },
        position: { x: 400, y: 0 }
      }
    ],
    executions: 23,
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    tags: ['Document', 'AI', 'Processing']
  },
  {
    id: '3',
    name: 'Content Creation Pipeline',
    description: 'Generate blog content and social media posts',
    status: 'draft',
    trigger: {
      id: 'trigger-3',
      type: 'trigger',
      name: 'Weekly Schedule',
      description: 'Every Monday at 10:00 AM',
      icon: Clock,
      config: { schedule: 'weekly', day: 'monday', time: '10:00' },
      position: { x: 0, y: 0 }
    },
    steps: [
      {
        id: 'step-5',
        type: 'action',
        name: 'Generate Content',
        description: 'Create blog post with AI',
        icon: Bot,
        config: { model: 'gpt-4', contentType: 'blog' },
        position: { x: 200, y: 0 }
      },
      {
        id: 'step-6',
        type: 'action',
        name: 'Generate Image',
        description: 'Create featured image',
        icon: Image,
        config: { model: 'dall-e-3', style: 'modern' },
        position: { x: 400, y: 0 }
      }
    ],
    executions: 0,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    tags: ['Content', 'Marketing', 'AI']
  }
]

export default function WorkflowsPage() {
  const { user } = useAuth()
  const [workflows, setWorkflows] = useState<Workflow[]>(SAMPLE_WORKFLOWS)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [activeTab, setActiveTab] = useState<'list' | 'builder' | 'logs'>('list')
  const [isCreating, setIsCreating] = useState(false)
  const [builderSteps, setBuilderSteps] = useState<WorkflowStep[]>([])
  const [selectedTrigger, setSelectedTrigger] = useState<any>(null)

  const createNewWorkflow = () => {
    setSelectedWorkflow(null)
    setBuilderSteps([])
    setSelectedTrigger(null)
    setIsCreating(true)
    setActiveTab('builder')
  }

  const editWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow)
    setBuilderSteps([workflow.trigger, ...workflow.steps])
    setSelectedTrigger(workflow.trigger)
    setIsCreating(false)
    setActiveTab('builder')
  }

  const toggleWorkflowStatus = (workflowId: string) => {
    setWorkflows(prev =>
      prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: w.status === 'active' ? 'paused' : 'active' }
          : w
      )
    )
  }

  const deleteWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== workflowId))
  }

  const runWorkflow = async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId)
    if (!workflow) return

    // Simulate workflow execution
    setWorkflows(prev =>
      prev.map(w => 
        w.id === workflowId 
          ? { 
              ...w, 
              executions: w.executions + 1,
              lastRun: new Date()
            }
          : w
      )
    )
  }

  const addStepToBuilder = (stepType: any) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type: 'action',
      name: stepType.name,
      description: stepType.description,
      icon: stepType.icon,
      config: {},
      position: { x: builderSteps.length * 200, y: 0 }
    }
    setBuilderSteps(prev => [...prev, newStep])
  }

  const saveWorkflow = () => {
    if (!selectedTrigger || builderSteps.length === 0) return

    const newWorkflow: Workflow = {
      id: isCreating ? Date.now().toString() : selectedWorkflow!.id,
      name: isCreating ? 'New Workflow' : selectedWorkflow!.name,
      description: isCreating ? 'Workflow description' : selectedWorkflow!.description,
      status: 'draft',
      trigger: selectedTrigger,
      steps: builderSteps.slice(1), // Remove trigger from steps
      executions: isCreating ? 0 : selectedWorkflow!.executions,
      createdAt: isCreating ? new Date() : selectedWorkflow!.createdAt,
      tags: isCreating ? ['New'] : selectedWorkflow!.tags
    }

    if (isCreating) {
      setWorkflows(prev => [newWorkflow, ...prev])
    } else {
      setWorkflows(prev => prev.map(w => w.id === newWorkflow.id ? newWorkflow : w))
    }

    setActiveTab('list')
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center">
            <Zap className="w-8 h-8 mr-3 text-primary" />
            Workflow Automation
          </h1>
          <p className="text-muted-foreground">Create automated workflows to streamline your processes</p>
        </div>
        <Button onClick={createNewWorkflow}>
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <Button
          variant={activeTab === 'list' ? 'default' : 'outline'}
          onClick={() => setActiveTab('list')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Workflows ({workflows.length})
        </Button>
        <Button
          variant={activeTab === 'builder' ? 'default' : 'outline'}
          onClick={() => setActiveTab('builder')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Builder
        </Button>
        <Button
          variant={activeTab === 'logs' ? 'default' : 'outline'}
          onClick={() => setActiveTab('logs')}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Execution Logs
        </Button>
      </div>

      {activeTab === 'list' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Workflows</p>
                    <p className="text-2xl font-bold">{workflows.length}</p>
                  </div>
                  <Zap className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {workflows.filter(w => w.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Executions</p>
                    <p className="text-2xl font-bold">
                      {workflows.reduce((sum, w) => sum + w.executions, 0)}
                    </p>
                  </div>
                  <Play className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">98.5%</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflows List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <workflow.trigger.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <CardDescription>{workflow.description}</CardDescription>
                      </div>
                    </div>
                    <Badge
                      className={
                        workflow.status === 'active' ? 'bg-green-100 text-green-700' :
                        workflow.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }
                    >
                      {workflow.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Workflow Steps Preview */}
                  <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                    <div className="flex items-center space-x-1 p-2 bg-muted rounded-md min-w-0">
                      <workflow.trigger.icon className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium truncate">{workflow.trigger.name}</span>
                    </div>
                    {workflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-1">
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <div className="flex items-center space-x-1 p-2 bg-muted rounded-md min-w-0">
                          <step.icon className="w-4 h-4 text-primary" />
                          <span className="text-xs font-medium truncate">{step.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Executions:</span>
                      <p className="font-medium">{workflow.executions}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Run:</span>
                      <p className="font-medium">
                        {workflow.lastRun ? workflow.lastRun.toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Next Run:</span>
                      <p className="font-medium">
                        {workflow.nextRun ? workflow.nextRun.toLocaleDateString() : 'Manual'}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {workflow.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => runWorkflow(workflow.id)}
                      disabled={workflow.status === 'draft'}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Run
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toggleWorkflowStatus(workflow.id)}
                    >
                      {workflow.status === 'active' ? (
                        <>
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => editWorkflow(workflow)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => deleteWorkflow(workflow.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {workflows.length === 0 && (
            <div className="text-center py-12">
              <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first workflow to automate your processes
              </p>
              <Button onClick={createNewWorkflow}>
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Workflow Canvas */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isCreating ? 'Create New Workflow' : `Edit: ${selectedWorkflow?.name}`}
                </CardTitle>
                <CardDescription>
                  Drag and drop components to build your workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="min-h-96 border-2 border-dashed border-border rounded-lg p-6">
                  {builderSteps.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      <Zap className="w-12 h-12 mx-auto mb-4" />
                      <p>Start by selecting a trigger from the panel</p>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4 overflow-x-auto">
                      {builderSteps.map((step, index) => (
                        <div key={step.id} className="flex items-center space-x-2">
                          <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg min-w-32">
                            <step.icon className="w-6 h-6 text-primary" />
                            <span className="text-sm font-medium text-center">{step.name}</span>
                            <span className="text-xs text-muted-foreground text-center">
                              {step.description}
                            </span>
                          </div>
                          {index < builderSteps.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={() => setActiveTab('list')}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={saveWorkflow}
                    disabled={!selectedTrigger || builderSteps.length === 0}
                  >
                    Save Workflow
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Component Library */}
          <div className="space-y-6">
            {/* Triggers */}
            <Card>
              <CardHeader>
                <CardTitle>Triggers</CardTitle>
                <CardDescription>How your workflow starts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {TRIGGER_TYPES.map((trigger) => (
                  <div
                    key={trigger.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedTrigger?.id === trigger.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => {
                      const triggerStep: WorkflowStep = {
                        id: `trigger-${Date.now()}`,
                        type: 'trigger',
                        name: trigger.name,
                        description: trigger.description,
                        icon: trigger.icon,
                        config: {},
                        position: { x: 0, y: 0 }
                      }
                      setSelectedTrigger(triggerStep)
                      setBuilderSteps([triggerStep])
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <trigger.icon className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{trigger.name}</p>
                        <p className="text-xs text-muted-foreground">{trigger.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>What your workflow does</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {ACTION_TYPES.map((action) => (
                  <div
                    key={action.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => addStepToBuilder(action)}
                  >
                    <div className="flex items-center space-x-2">
                      <action.icon className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{action.name}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Execution Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Executions</p>
                    <p className="text-2xl font-bold">127</p>
                  </div>
                  <Play className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Successful</p>
                    <p className="text-2xl font-bold text-green-600">125</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-red-600">2</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Executions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>Latest workflow execution logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: '1',
                    workflow: 'Daily Sales Report',
                    status: 'success',
                    duration: '2.3s',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    steps: 3
                  },
                  {
                    id: '2',
                    workflow: 'Document Processing Pipeline',
                    status: 'success',
                    duration: '15.7s',
                    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
                    steps: 2
                  },
                  {
                    id: '3',
                    workflow: 'Daily Sales Report',
                    status: 'failed',
                    duration: '0.8s',
                    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000),
                    steps: 1,
                    error: 'Email service unavailable'
                  }
                ].map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        execution.status === 'success' ? 'bg-green-500' :
                        execution.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium">{execution.workflow}</p>
                        <p className="text-sm text-muted-foreground">
                          {execution.timestamp.toLocaleString()} • {execution.duration} • {execution.steps} steps
                        </p>
                        {execution.error && (
                          <p className="text-sm text-red-600">{execution.error}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={
                      execution.status === 'success' ? 'bg-green-100 text-green-700' :
                      execution.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>
                      {execution.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 