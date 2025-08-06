'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus, Bot, Settings, Play, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';

interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'customer_service' | 'data_analyst' | 'content_creator' | 'researcher' | 'developer';
  status: 'active' | 'inactive' | 'training';
  model: string;
  tools: string[];
  systemPrompt: string;
  createdAt: Date;
  lastUsed: Date;
  conversationCount: number;
  successRate: number;
}

const demoAgents: Agent[] = [
  {
    id: '1',
    name: 'Marketing Assistant',
    description: 'Helps create marketing content, social media posts, and campaign strategies',
    type: 'content_creator',
    model: 'gpt-4o',
    status: 'active',
    tools: ['web_search', 'generate_image', 'send_email'],
    systemPrompt:
      'You are a creative marketing assistant. Help users create compelling marketing content, analyze trends, and develop strategies.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
    conversationCount: 45,
    successRate: 92,
  },
  {
    id: '2',
    name: 'Code Reviewer',
    description: 'Reviews code, suggests improvements, and helps with debugging',
    type: 'developer',
    model: 'claude-3.5-sonnet',
    status: 'active',
    tools: ['code_interpreter', 'web_search'],
    systemPrompt:
      'You are an expert code reviewer. Analyze code for bugs, performance issues, security vulnerabilities, and suggest improvements.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 30 * 60 * 1000),
    conversationCount: 28,
    successRate: 96,
  },
  {
    id: '3',
    name: 'Data Analyst',
    description: 'Analyzes data, creates visualizations, and provides insights',
    type: 'data_analyst',
    model: 'o1-mini',
    status: 'active',
    tools: ['analyze_data', 'generate_image', 'web_search'],
    systemPrompt:
      'You are a data analyst. Help users understand their data through analysis, visualizations, and actionable insights.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000),
    conversationCount: 19,
    successRate: 88,
  },
  {
    id: '4',
    name: 'Research Assistant',
    description: 'Conducts research, summarizes findings, and creates reports',
    type: 'researcher',
    model: 'claude-3.7-sonnet',
    status: 'active',
    tools: ['web_search', 'send_email'],
    systemPrompt:
      'You are a research assistant. Help users find information, analyze sources, and create comprehensive reports.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000),
    conversationCount: 12,
    successRate: 94,
  },
  {
    id: '5',
    name: 'Creative Writer',
    description: 'Writes stories, articles, and creative content',
    type: 'content_creator',
    model: 'gpt-4.1',
    status: 'active',
    tools: ['generate_image', 'web_search'],
    systemPrompt:
      'You are a creative writer. Help users craft compelling stories, articles, and creative content with engaging narratives.',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 10 * 60 * 1000),
    conversationCount: 8,
    successRate: 90,
  },
  {
    id: '6',
    name: 'Customer Support Bot',
    description: 'Handles customer inquiries and provides support',
    type: 'customer_service',
    model: 'gpt-4o-mini',
    status: 'active',
    tools: ['web_search', 'send_email'],
    systemPrompt:
      'You are a helpful customer support agent. Assist customers with their questions, resolve issues, and provide excellent service.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 15 * 60 * 1000),
    conversationCount: 156,
    successRate: 87,
  },
  {
    id: '7',
    name: 'Social Media Manager',
    description: 'Creates and schedules social media content',
    type: 'content_creator',
    model: 'grok-3',
    status: 'active',
    tools: ['generate_image', 'web_search', 'send_email'],
    systemPrompt:
      'You are a social media expert. Create engaging posts, analyze trends, and help build social media presence.',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 45 * 60 * 1000),
    conversationCount: 23,
    successRate: 91,
  },
  {
    id: '8',
    name: 'Math Tutor',
    description: 'Helps with mathematical problems and explanations',
    type: 'researcher',
    model: 'o3-mini',
    status: 'active',
    tools: ['code_interpreter', 'generate_image'],
    systemPrompt:
      'You are a math tutor. Help students understand mathematical concepts, solve problems, and provide clear explanations.',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
    conversationCount: 34,
    successRate: 95,
  },
  {
    id: '9',
    name: 'Business Advisor',
    description: 'Provides business strategy and financial advice',
    type: 'data_analyst',
    model: 'claude-opus-4',
    status: 'active',
    tools: ['analyze_data', 'web_search', 'send_email'],
    systemPrompt:
      'You are a business consultant. Provide strategic advice, financial insights, and help with business planning.',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 3 * 60 * 60 * 1000),
    conversationCount: 17,
    successRate: 93,
  },
  {
    id: '10',
    name: 'Language Translator',
    description: 'Translates text and helps with language learning',
    type: 'researcher',
    model: 'gemini-2.5-pro',
    status: 'active',
    tools: ['web_search'],
    systemPrompt:
      'You are a language expert. Translate text accurately, explain grammar, and help with language learning.',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 20 * 60 * 1000),
    conversationCount: 41,
    successRate: 97,
  },
];

const typeColors = {
  customer_service: 'bg-blue-100 text-blue-700',
  data_analyst: 'bg-purple-100 text-purple-700',
  content_creator: 'bg-green-100 text-green-700',
  researcher: 'bg-orange-100 text-orange-700',
  developer: 'bg-gray-100 text-gray-700',
};

const statusColors = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  training: 'bg-yellow-100 text-yellow-700',
};

export default function AgentsPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Ref to prevent infinite loops
  const hasLoadedAgents = useRef(false);

  useEffect(() => {
    if (!user?.id || hasLoadedAgents.current) return;

    // Simulate loading agents based on user role
    if (user?.role === 'admin') {
      setAgents(demoAgents);
    } else {
      setAgents(demoAgents.slice(0, 2));
    }
    hasLoadedAgents.current = true;
  }, [user?.id, user?.role]);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || agent.type === filterType;
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold mb-2'>AI Agents</h1>
          <p className='text-muted-foreground'>
            Create and manage intelligent AI agents for automating tasks and workflows
          </p>
        </div>
        <Button asChild>
          <Link href='/dashboard/agents/new'>
            <Plus className='size-4 mr-2' />
            Create Agent
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-4 mb-6'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <input
            type='text'
            placeholder='Search agents...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className='px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring'>
          <option value='all'>All Types</option>
          <option value='customer_service'>Customer Service</option>
          <option value='data_analyst'>Data Analyst</option>
          <option value='content_creator'>Content Creator</option>
          <option value='researcher'>Researcher</option>
          <option value='developer'>Developer</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className='px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring'>
          <option value='all'>All Status</option>
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
          <option value='training'>Training</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Total Agents</p>
                <p className='text-2xl font-bold'>{agents.length}</p>
              </div>
              <Bot className='size-8 text-primary' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Active</p>
                <p className='text-2xl font-bold text-green-600'>
                  {agents.filter((a) => a.status === 'active').length}
                </p>
              </div>
              <div className='size-8 rounded-full bg-green-100 flex items-center justify-center'>
                <div className='size-3 bg-green-500 rounded-full'></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Conversations</p>
                <p className='text-2xl font-bold'>
                  {agents.reduce((sum, agent) => sum + agent.conversationCount, 0).toLocaleString()}
                </p>
              </div>
              <div className='size-8 rounded-full bg-blue-100 flex items-center justify-center'>
                <div className='size-3 bg-blue-500 rounded-full'></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Avg Performance</p>
                <p className='text-2xl font-bold'>
                  {Math.round(agents.reduce((sum, agent) => sum + agent.successRate, 0) / agents.length || 0)}
                  %
                </p>
              </div>
              <div className='size-8 rounded-full bg-purple-100 flex items-center justify-center'>
                <div className='size-3 bg-purple-500 rounded-full'></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className='hover:shadow-lg transition-shadow'>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <Bot className='size-5 text-primary' />
                  <CardTitle className='text-lg'>{agent.name}</CardTitle>
                </div>
                <Badge className={statusColors[agent.status]}>{agent.status}</Badge>
              </div>
            </CardHeader>

            <CardContent className='space-y-4'>
              <CardDescription className='text-sm'>{agent.description}</CardDescription>

              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Type:</span>
                  <Badge className={typeColors[agent.type]}>{agent.type.replace('_', ' ')}</Badge>
                </div>

                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Model:</span>
                  <span className='font-medium'>{agent.model}</span>
                </div>

                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Conversations:</span>
                  <span className='font-medium'>{agent.conversationCount.toLocaleString()}</span>
                </div>

                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Performance:</span>
                  <span
                    className={`font-medium ${
                      agent.successRate >= 90
                        ? 'text-green-600'
                        : agent.successRate >= 80
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}>
                    {agent.successRate}%
                  </span>
                </div>

                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Last used:</span>
                  <span className='font-medium'>{agent.lastUsed.toLocaleDateString()}</span>
                </div>
              </div>

              <div className='space-y-2'>
                <p className='text-sm text-muted-foreground'>Tools:</p>
                <div className='flex flex-wrap gap-1'>
                  {agent.tools.map((tool, index) => (
                    <Badge key={index} variant='outline' className='text-xs'>
                      {tool.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className='flex gap-2 pt-2'>
                <Button size='sm' variant='default' className='flex-1' asChild>
                  <Link href={`/dashboard/agents/${agent.id}/chat`}>
                    <Play className='size-3 mr-1' />
                    Chat
                  </Link>
                </Button>
                <Button size='sm' variant='outline' asChild>
                  <Link href={`/dashboard/agents/${agent.id}/edit`}>
                    <Settings className='size-3' />
                  </Link>
                </Button>
                <Button size='sm' variant='outline' className='text-red-600 hover:text-red-700'>
                  <Trash2 className='size-3' />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className='text-center py-12'>
          <Bot className='size-16 text-muted-foreground mx-auto mb-4' />
          <h3 className='text-lg font-semibold mb-2'>No agents found</h3>
          <p className='text-muted-foreground mb-4'>
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first AI agent'}
          </p>
          <Button asChild>
            <Link href='/dashboard/agents/new'>
              <Plus className='size-4 mr-2' />
              Create Your First Agent
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
