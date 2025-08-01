'use client'

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AgentEditPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  
  const [agentData, setAgentData] = useState({
    name: '',
    description: '',
    instructions: '',
    model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    temperature: 0.7,
    maxTokens: 1000
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load agent data
    setAgentData({
      name: `Agent ${agentId}`,
      description: `This is a demo agent with ID ${agentId}`,
      instructions: `You are Agent ${agentId}, a helpful AI assistant. Always be polite and professional in your responses.`,
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      temperature: 0.7,
      maxTokens: 1000
    });
  }, [agentId]);

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Simulate saving
      setTimeout(() => {
        setIsLoading(false);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }, 1000);
    } catch (error) {
      console.error('Error saving agent:', error);
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setAgentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard/agents">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Agents
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Edit Agent {agentId}</h1>
        <p className="text-muted-foreground">Configure your AI agent settings and behavior</p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                value={agentData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter agent name"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={agentData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this agent does"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions & Behavior</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="instructions">System Instructions</Label>
              <Textarea
                id="instructions"
                value={agentData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder="Define how the agent should behave and respond"
                rows={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Model Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Model Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="model">Model</Label>
              <select
                id="model"
                value={agentData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo">Llama 3.1 70B Turbo</option>
                <option value="meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo">Llama 3.1 8B Turbo</option>
                <option value="mistralai/Mixtral-8x7B-Instruct-v0.1">Mixtral 8x7B</option>
                <option value="NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO">Nous Hermes 2</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={agentData.temperature}
                  onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min="100"
                  max="4000"
                  step="100"
                  value={agentData.maxTokens}
                  onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Link href={`/dashboard/agents/${agentId}/chat`}>
            <Button variant="outline">
              Test Agent
            </Button>
          </Link>
          
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : isSaved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}