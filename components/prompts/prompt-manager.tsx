'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  Star,
  MessageSquare,
  Bot,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
} from 'lucide-react';

interface Prompt {
  id: string;
  name: string;
  description: string;
  content: string;
  category: 'chat' | 'image' | 'video' | 'audio' | 'code' | 'writing' | 'analysis' | 'custom';
  tags: string[];
  variables: string[];
  isFavorite: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

const defaultPrompts: Prompt[] = [
  {
    id: '1',
    name: 'Content Writer',
    description: 'Professional content writing assistant',
    content:
      'You are a professional content writer. Write engaging, SEO-optimized content about {{topic}} for {{audience}}. The content should be {{tone}} and approximately {{wordCount}} words.',
    category: 'writing',
    tags: ['content', 'seo', 'writing'],
    variables: ['topic', 'audience', 'tone', 'wordCount'],
    isFavorite: true,
    usageCount: 45,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
  },
  {
    id: '2',
    name: 'Image Generator',
    description: 'Create detailed image descriptions for AI generation',
    content:
      'Create a detailed, high-quality image description for {{subject}} in {{style}} style. Include lighting, composition, colors, and mood. Make it suitable for AI image generation.',
    category: 'image',
    tags: ['image', 'generation', 'art'],
    variables: ['subject', 'style'],
    isFavorite: false,
    usageCount: 23,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-10'),
    model: 'gpt-4',
    temperature: 0.8,
  },
  {
    id: '3',
    name: 'Code Assistant',
    description: 'Help with programming and code generation',
    content:
      'You are an expert programmer. Help me write {{language}} code for {{task}}. Include comments and best practices. The code should be {{complexity}} level.',
    category: 'code',
    tags: ['programming', 'code', 'development'],
    variables: ['language', 'task', 'complexity'],
    isFavorite: true,
    usageCount: 67,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-20'),
    model: 'gpt-4',
    temperature: 0.3,
    maxTokens: 2000,
  },
  {
    id: '4',
    name: 'Data Analyst',
    description: 'Analyze and interpret data',
    content:
      'You are a data analyst. Analyze the following data about {{dataset}} and provide insights. Focus on {{focusArea}} and present findings in a clear, actionable format.',
    category: 'analysis',
    tags: ['data', 'analysis', 'insights'],
    variables: ['dataset', 'focusArea'],
    isFavorite: false,
    usageCount: 12,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-12'),
    model: 'gpt-4',
    temperature: 0.5,
  },
];

interface PromptManagerProps {
  onSelectPrompt?: (prompt: Prompt) => void;
  onSavePrompt?: (prompt: Prompt) => void;
  className?: string;
}

export function PromptManager({ onSelectPrompt, onSavePrompt, className = '' }: PromptManagerProps) {
  const [prompts, setPrompts] = useState<Prompt[]>(defaultPrompts);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>(defaultPrompts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filter prompts based on search and category
  useEffect(() => {
    let filtered = prompts;

    if (searchTerm) {
      filtered = filtered.filter(
        (prompt) =>
          prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prompt.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((prompt) => prompt.category === selectedCategory);
    }

    if (showFavorites) {
      filtered = filtered.filter((prompt) => prompt.isFavorite);
    }

    setFilteredPrompts(filtered);
  }, [prompts, searchTerm, selectedCategory, showFavorites]);

  const handleCreatePrompt = (newPrompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    const prompt: Prompt = {
      ...newPrompt,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
    };

    setPrompts((prev) => [prompt, ...prev]);
    onSavePrompt?.(prompt);
    setShowCreateForm(false);
  };

  const handleUpdatePrompt = (updatedPrompt: Prompt) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === updatedPrompt.id ? { ...updatedPrompt, updatedAt: new Date() } : p))
    );
    onSavePrompt?.(updatedPrompt);
    setEditingPrompt(null);
  };

  const handleDeletePrompt = (promptId: string) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      setPrompts((prev) => prev.filter((p) => p.id !== promptId));
    }
  };

  const handleToggleFavorite = (promptId: string) => {
    setPrompts((prev) => prev.map((p) => (p.id === promptId ? { ...p, isFavorite: !p.isFavorite } : p)));
  };

  const handleCopyPrompt = (prompt: Prompt) => {
    navigator.clipboard.writeText(prompt.content);
    // You could add a toast notification here
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'chat':
        return <MessageSquare className='size-4' />;
      case 'image':
        return <ImageIcon className='size-4' />;
      case 'video':
        return <Video className='size-4' />;
      case 'audio':
        return <Music className='size-4' />;
      case 'code':
        return <FileText className='size-4' />;
      default:
        return <Bot className='size-4' />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'chat':
        return 'bg-blue-100 text-blue-800';
      case 'image':
        return 'bg-purple-100 text-purple-800';
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'audio':
        return 'bg-green-100 text-green-800';
      case 'code':
        return 'bg-orange-100 text-orange-800';
      case 'writing':
        return 'bg-indigo-100 text-indigo-800';
      case 'analysis':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Prompt Manager</h2>
          <p className='text-muted-foreground'>Organize and manage your AI prompts</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className='mr-2 size-4' />
          Create Prompt
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-3 size-4 text-muted-foreground' />
                <Input
                  placeholder='Search prompts...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className='w-full md:w-48'>
                <SelectValue placeholder='All Categories' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Categories</SelectItem>
                <SelectItem value='chat'>Chat</SelectItem>
                <SelectItem value='image'>Image</SelectItem>
                <SelectItem value='video'>Video</SelectItem>
                <SelectItem value='audio'>Audio</SelectItem>
                <SelectItem value='code'>Code</SelectItem>
                <SelectItem value='writing'>Writing</SelectItem>
                <SelectItem value='analysis'>Analysis</SelectItem>
                <SelectItem value='custom'>Custom</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showFavorites ? 'default' : 'outline'}
              onClick={() => setShowFavorites(!showFavorites)}>
              <Star className='mr-2 size-4' />
              Favorites
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prompts Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {filteredPrompts.map((prompt) => (
          <Card key={prompt.id} className='hover:shadow-md transition-shadow'>
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <CardTitle className='text-lg flex items-center'>
                    {getCategoryIcon(prompt.category)}
                    <span className='ml-2'>{prompt.name}</span>
                  </CardTitle>
                  <CardDescription className='mt-1'>{prompt.description}</CardDescription>
                </div>
                <Button variant='ghost' size='sm' onClick={() => handleToggleFavorite(prompt.id)}>
                  <Star className={`size-4 ${prompt.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </Button>
              </div>
              <div className='flex items-center gap-2 mt-2'>
                <Badge className={getCategoryColor(prompt.category)}>{prompt.category}</Badge>
                <span className='text-xs text-muted-foreground'>{prompt.usageCount} uses</span>
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='space-y-3'>
                <p className='text-sm text-muted-foreground line-clamp-3'>
                  {prompt.content.substring(0, 150)}...
                </p>

                {prompt.variables.length > 0 && (
                  <div>
                    <p className='text-xs font-medium text-muted-foreground mb-1'>Variables:</p>
                    <div className='flex flex-wrap gap-1'>
                      {prompt.variables.map((variable) => (
                        <Badge key={variable} variant='outline' className='text-xs'>
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className='flex items-center justify-between pt-2'>
                  <div className='flex space-x-1'>
                    <Button variant='ghost' size='sm' onClick={() => onSelectPrompt?.(prompt)}>
                      Use
                    </Button>
                    <Button variant='ghost' size='sm' onClick={() => handleCopyPrompt(prompt)}>
                      <Copy className='size-3' />
                    </Button>
                    <Button variant='ghost' size='sm' onClick={() => setEditingPrompt(prompt)}>
                      <Edit className='size-3' />
                    </Button>
                    <Button variant='ghost' size='sm' onClick={() => handleDeletePrompt(prompt.id)}>
                      <Trash2 className='size-3' />
                    </Button>
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    {prompt.updatedAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <Card>
          <CardContent className='text-center py-12'>
            <Bot className='size-12 mx-auto text-muted-foreground mb-4' />
            <h3 className='text-lg font-medium mb-2'>No prompts found</h3>
            <p className='text-muted-foreground mb-4'>
              {searchTerm || selectedCategory !== 'all' || showFavorites
                ? 'Try adjusting your filters'
                : 'Create your first prompt to get started'}
            </p>
            {!searchTerm && selectedCategory === 'all' && !showFavorites && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className='mr-2 size-4' />
                Create Prompt
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Prompt Form */}
      {(showCreateForm || editingPrompt) && (
        <PromptForm
          prompt={editingPrompt}
          onSave={editingPrompt ? handleUpdatePrompt : handleCreatePrompt}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingPrompt(null);
          }}
        />
      )}
    </div>
  );
}

// Prompt Form Component
interface PromptFormProps {
  prompt?: Prompt | null;
  onSave: (prompt: Prompt) => void;
  onCancel: () => void;
}

function PromptForm({ prompt, onSave, onCancel }: PromptFormProps) {
  const [formData, setFormData] = useState({
    name: prompt?.name || '',
    description: prompt?.description || '',
    content: prompt?.content || '',
    category: prompt?.category || 'custom',
    tags: prompt?.tags.join(', ') || '',
    variables: prompt?.variables.join(', ') || '',
    model: prompt?.model || 'gpt-4',
    temperature: prompt?.temperature || 0.7,
    maxTokens: prompt?.maxTokens || 1000,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPrompt: Prompt = {
      id: prompt?.id || '',
      name: formData.name,
      description: formData.description,
      content: formData.content,
      category: formData.category as any,
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      variables: formData.variables
        .split(',')
        .map((variable) => variable.trim())
        .filter(Boolean),
      isFavorite: prompt?.isFavorite || false,
      usageCount: prompt?.usageCount || 0,
      createdAt: prompt?.createdAt || new Date(),
      updatedAt: new Date(),
      model: formData.model,
      temperature: formData.temperature,
      maxTokens: formData.maxTokens,
    };

    onSave(newPrompt);
  };

  return (
    <Card className='fixed inset-4 z-50 overflow-y-auto bg-background'>
      <CardHeader>
        <CardTitle>{prompt ? 'Edit Prompt' : 'Create New Prompt'}</CardTitle>
        <CardDescription>
          {prompt ? 'Update your prompt settings' : 'Create a new AI prompt template'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder='Enter prompt name'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='category'>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='chat'>Chat</SelectItem>
                  <SelectItem value='image'>Image</SelectItem>
                  <SelectItem value='video'>Video</SelectItem>
                  <SelectItem value='audio'>Audio</SelectItem>
                  <SelectItem value='code'>Code</SelectItem>
                  <SelectItem value='writing'>Writing</SelectItem>
                  <SelectItem value='analysis'>Analysis</SelectItem>
                  <SelectItem value='custom'>Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Input
              id='description'
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder='Brief description of the prompt'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='content'>Prompt Content</Label>
            <Textarea
              id='content'
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder='Enter your prompt template. Use {{variable}} for dynamic values.'
              rows={8}
              required
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='tags'>Tags (comma-separated)</Label>
              <Input
                id='tags'
                value={formData.tags}
                onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder='tag1, tag2, tag3'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='variables'>Variables (comma-separated)</Label>
              <Input
                id='variables'
                value={formData.variables}
                onChange={(e) => setFormData((prev) => ({ ...prev, variables: e.target.value }))}
                placeholder='variable1, variable2, variable3'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='model'>Model</Label>
              <Select
                value={formData.model}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, model: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='gpt-4'>GPT-4</SelectItem>
                  <SelectItem value='gpt-3.5-turbo'>GPT-3.5 Turbo</SelectItem>
                  <SelectItem value='claude-3-opus'>Claude 3 Opus</SelectItem>
                  <SelectItem value='claude-3-sonnet'>Claude 3 Sonnet</SelectItem>
                  <SelectItem value='gemini-pro'>Gemini Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='temperature'>Temperature</Label>
              <Input
                id='temperature'
                type='number'
                min='0'
                max='2'
                step='0.1'
                value={formData.temperature}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='maxTokens'>Max Tokens</Label>
              <Input
                id='maxTokens'
                type='number'
                min='1'
                value={formData.maxTokens}
                onChange={(e) => setFormData((prev) => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className='flex justify-end space-x-2 pt-4'>
            <Button type='button' variant='outline' onClick={onCancel}>
              Cancel
            </Button>
            <Button type='submit'>{prompt ? 'Update Prompt' : 'Create Prompt'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
