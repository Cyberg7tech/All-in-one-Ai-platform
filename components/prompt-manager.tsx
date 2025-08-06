'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Search, 
  Filter, 
  Star, 
  StarOff,
  MessageSquare,
  Zap,
  Tag,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Modal, ConfirmModal } from '@/components/ui/modal';

interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  isPublic: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  author?: string;
}

interface PromptManagerProps {
  className?: string;
}

const samplePrompts: Prompt[] = [
  {
    id: '1',
    title: 'Blog Post Writer',
    content: 'Write a comprehensive blog post about {topic}. Include an engaging introduction, 3-5 main points with detailed explanations, and a compelling conclusion. Target audience: {audience}. Tone: {tone}.',
    description: 'Creates well-structured blog posts on any topic',
    category: 'Content Creation',
    tags: ['blog', 'writing', 'content'],
    isFavorite: true,
    isPublic: true,
    usageCount: 45,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    author: 'AI Team'
  },
  {
    id: '2',
    title: 'Code Reviewer',
    content: 'Review the following code for best practices, potential bugs, security issues, and performance improvements. Provide specific suggestions with explanations:\n\n{code}',
    description: 'Professional code review and suggestions',
    category: 'Development',
    tags: ['code', 'review', 'development'],
    isFavorite: false,
    isPublic: true,
    usageCount: 32,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    author: 'Dev Team'
  },
  {
    id: '3',
    title: 'Email Marketing',
    content: 'Create a compelling email marketing campaign for {product/service}. Include subject line, preview text, and email body. Focus on {primary_benefit} and include a clear call-to-action.',
    description: 'Generate effective email marketing campaigns',
    category: 'Marketing',
    tags: ['email', 'marketing', 'conversion'],
    isFavorite: true,
    isPublic: false,
    usageCount: 28,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-22'),
    author: 'Marketing Team'
  }
];

export function PromptManager({ className = '' }: PromptManagerProps) {
  const [prompts, setPrompts] = useState<Prompt[]>(samplePrompts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    category: 'General',
    tags: '',
    isPublic: false
  });

  const categories = ['All', ...Array.from(new Set(prompts.map(p => p.category)))];

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || prompt.category === selectedCategory;
    const matchesFavorite = !showFavoritesOnly || prompt.isFavorite;
    
    return matchesSearch && matchesCategory && matchesFavorite;
  });

  const handleCreatePrompt = () => {
    const newPrompt: Prompt = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      description: formData.description,
      category: formData.category,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isFavorite: false,
      isPublic: formData.isPublic,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: 'You'
    };

    setPrompts([newPrompt, ...prompts]);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEditPrompt = () => {
    if (!selectedPrompt) return;

    const updatedPrompts = prompts.map(prompt =>
      prompt.id === selectedPrompt.id
        ? {
            ...prompt,
            title: formData.title,
            content: formData.content,
            description: formData.description,
            category: formData.category,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            isPublic: formData.isPublic,
            updatedAt: new Date()
          }
        : prompt
    );

    setPrompts(updatedPrompts);
    setIsEditModalOpen(false);
    setSelectedPrompt(null);
    resetForm();
  };

  const handleDeletePrompt = () => {
    if (!selectedPrompt) return;
    setPrompts(prompts.filter(prompt => prompt.id !== selectedPrompt.id));
    setIsDeleteModalOpen(false);
    setSelectedPrompt(null);
  };

  const toggleFavorite = (promptId: string) => {
    setPrompts(prompts.map(prompt =>
      prompt.id === promptId
        ? { ...prompt, isFavorite: !prompt.isFavorite }
        : prompt
    ));
  };

  const copyPrompt = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openEditModal = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setFormData({
      title: prompt.title,
      content: prompt.content,
      description: prompt.description || '',
      category: prompt.category,
      tags: prompt.tags.join(', '),
      isPublic: prompt.isPublic
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      description: '',
      category: 'General',
      tags: '',
      isPublic: false
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prompt Library</h2>
          <p className="text-muted-foreground">Manage and organize your AI prompts</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="size-4 mr-2" />
          New Prompt
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Star className="size-4 mr-2" />
              Favorites
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrompts.map((prompt) => (
          <Card key={prompt.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{prompt.title}</CardTitle>
                  {prompt.description && (
                    <CardDescription className="mt-1 line-clamp-2">
                      {prompt.description}
                    </CardDescription>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-8 px-0"
                  onClick={() => toggleFavorite(prompt.id)}
                >
                  {prompt.isFavorite ? (
                    <Star className="size-4 text-yellow-500 fill-current" />
                  ) : (
                    <StarOff className="size-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{prompt.category}</Badge>
                {prompt.isPublic && (
                  <Badge variant="outline" className="text-xs">Public</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-sm font-mono line-clamp-3">{prompt.content}</p>
              </div>

              <div className="flex flex-wrap gap-1">
                {prompt.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="size-2 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center">
                  <MessageSquare className="size-3 mr-1" />
                  Used {prompt.usageCount} times
                </div>
                <div className="flex items-center">
                  <Clock className="size-3 mr-1" />
                  {prompt.updatedAt.toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => copyPrompt(prompt.content)}
                >
                  <Copy className="size-3 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(prompt)}
                >
                  <Edit3 className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openDeleteModal(prompt)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No prompts found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first prompt to get started'}
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="size-4 mr-2" />
            Create Prompt
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedPrompt(null);
          resetForm();
        }}
        title={isEditModalOpen ? 'Edit Prompt' : 'Create New Prompt'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter prompt title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of what this prompt does"
            />
          </div>

          <div>
            <Label htmlFor="content">Prompt Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Enter your prompt here. Use {variable} for placeholders..."
              rows={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="General">General</option>
                <option value="Content Creation">Content Creation</option>
                <option value="Development">Development</option>
                <option value="Marketing">Marketing</option>
                <option value="Analysis">Analysis</option>
                <option value="Creative">Creative</option>
              </select>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="blog, writing, content"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
              className="rounded"
            />
            <Label htmlFor="isPublic">Make this prompt public</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={isEditModalOpen ? handleEditPrompt : handleCreatePrompt}
              disabled={!formData.title || !formData.content}
              className="flex-1"
            >
              <Zap className="size-4 mr-2" />
              {isEditModalOpen ? 'Update Prompt' : 'Create Prompt'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedPrompt(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPrompt(null);
        }}
        onConfirm={handleDeletePrompt}
        title="Delete Prompt"
        message={`Are you sure you want to delete "${selectedPrompt?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
