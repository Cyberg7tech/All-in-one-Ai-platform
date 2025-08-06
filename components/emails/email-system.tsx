'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, Users, CheckCircle, AlertCircle, Clock, Eye, EyeOff } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: 'welcome' | 'onboarding' | 'billing' | 'marketing' | 'support';
}

interface EmailCampaign {
  id: string;
  name: string;
  template: EmailTemplate;
  recipients: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduledAt?: Date;
  sentAt?: Date;
  openRate?: number;
  clickRate?: number;
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to One AI Platform! 🚀',
    body: `Hi {{name}},

Welcome to One AI Platform! We're excited to have you on board.

Here's what you can do with your new account:
• Access 18+ AI tools
• Create custom AI agents
• Generate content, images, and videos
• Track your usage and analytics

Get started by exploring our dashboard: {{dashboardUrl}}

If you have any questions, feel free to reach out to our support team.

Best regards,
The One AI Team`,
    variables: ['name', 'dashboardUrl'],
    category: 'welcome',
  },
  {
    id: 'onboarding',
    name: 'Onboarding Series',
    subject: "Let's get you started with One AI",
    body: `Hi {{name}},

Great to see you've joined One AI! Let's make sure you get the most out of our platform.

Here's your personalized onboarding plan:

Day 1: Explore the Dashboard
Day 3: Try Your First AI Tool
Day 7: Create Your First AI Agent
Day 14: Advanced Features

Ready to start? Visit: {{dashboardUrl}}

Best regards,
The One AI Team`,
    variables: ['name', 'dashboardUrl'],
    category: 'onboarding',
  },
  {
    id: 'billing',
    name: 'Subscription Update',
    subject: 'Your One AI subscription has been updated',
    body: `Hi {{name}},

Your One AI subscription has been successfully updated to {{planName}}.

New features available:
{{planFeatures}}

Next billing date: {{nextBillingDate}}
Amount: {{amount}}

View your billing details: {{billingUrl}}

Best regards,
The One AI Team`,
    variables: ['name', 'planName', 'planFeatures', 'nextBillingDate', 'amount', 'billingUrl'],
    category: 'billing',
  },
];

interface EmailSystemProps {
  provider?: 'loops' | 'resend';
  apiKey?: string;
  onSend?: (email: any) => void;
  className?: string;
}

export function EmailSystem({ provider = 'loops', apiKey, onSend, className = '' }: EmailSystemProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [recipients, setRecipients] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSendEmail = async () => {
    if (!recipients || !subject || !body) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const emailData = {
        to: recipients.split(',').map((email) => email.trim()),
        subject,
        body,
        variables,
        provider,
      };

      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (result.success) {
        // Add to campaigns
        const newCampaign: EmailCampaign = {
          id: Date.now().toString(),
          name: subject,
          template: templates.find((t) => t.id === selectedTemplate) || defaultTemplates[0],
          recipients: recipients.split(',').map((email) => email.trim()),
          status: 'sent',
          sentAt: new Date(),
        };

        setCampaigns((prev) => [newCampaign, ...prev]);
        onSend?.(emailData);

        // Reset form
        setRecipients('');
        setSubject('');
        setBody('');
        setVariables({});
        setSelectedTemplate('');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSubject(template.subject);
      setBody(template.body);

      // Initialize variables
      const initialVariables: Record<string, string> = {};
      template.variables.forEach((variable) => {
        initialVariables[variable] = '';
      });
      setVariables(initialVariables);
    }
  };

  const updateVariable = (key: string, value: string) => {
    setVariables((prev) => ({ ...prev, [key]: value }));
  };

  const replaceVariables = (text: string, vars: Record<string, string>) => {
    let result = text;
    Object.entries(vars).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || `{{${key}}}`);
    });
    return result;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'sending':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Email Composer */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Mail className='mr-2 size-5' />
            Email Composer
          </CardTitle>
          <CardDescription>
            Send transactional emails using {provider === 'loops' ? 'Loops' : 'Resend'}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Template Selection */}
          <div className='space-y-2'>
            <Label>Email Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder='Select a template' />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className='flex items-center justify-between w-full'>
                      <span>{template.name}</span>
                      <Badge variant='secondary' className='ml-2'>
                        {template.category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipients */}
          <div className='space-y-2'>
            <Label>Recipients (comma-separated)</Label>
            <Input
              placeholder='user@example.com, another@example.com'
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
            />
          </div>

          {/* Subject */}
          <div className='space-y-2'>
            <Label>Subject</Label>
            <Input placeholder='Email subject' value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          {/* Variables */}
          {selectedTemplate && Object.keys(variables).length > 0 && (
            <div className='space-y-2'>
              <Label>Template Variables</Label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                {Object.keys(variables).map((key) => (
                  <div key={key} className='space-y-1'>
                    <Label className='text-sm'>{key}</Label>
                    <Input
                      placeholder={`Enter ${key}`}
                      value={variables[key]}
                      onChange={(e) => updateVariable(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label>Email Body</Label>
              <Button variant='ghost' size='sm' onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
            </div>
            {showPreview ? (
              <div className='border rounded-md p-4 bg-muted/50'>
                <div className='prose prose-sm max-w-none'>
                  <h3>{replaceVariables(subject, variables)}</h3>
                  <div className='whitespace-pre-wrap'>{replaceVariables(body, variables)}</div>
                </div>
              </div>
            ) : (
              <Textarea
                placeholder='Email body content'
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
              />
            )}
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendEmail}
            disabled={loading || !recipients || !subject || !body}
            className='w-full'>
            {loading ? (
              <div className='flex items-center'>
                <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2' />
                Sending...
              </div>
            ) : (
              <div className='flex items-center'>
                <Send className='mr-2 size-4' />
                Send Email
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Campaign History */}
      {campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Users className='mr-2 size-5' />
              Recent Campaigns
            </CardTitle>
            <CardDescription>Track your email campaigns and their performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {campaigns.map((campaign) => (
                <div key={campaign.id} className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex-1'>
                    <h4 className='font-medium'>{campaign.name}</h4>
                    <p className='text-sm text-muted-foreground'>{campaign.recipients.length} recipients</p>
                    <p className='text-sm text-muted-foreground'>{campaign.sentAt?.toLocaleDateString()}</p>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                    {campaign.openRate && <Badge variant='outline'>{campaign.openRate}% open rate</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Email template management component
export function EmailTemplateManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const handleSaveTemplate = (template: EmailTemplate) => {
    if (editingTemplate) {
      setTemplates((prev) => prev.map((t) => (t.id === template.id ? template : t)));
    } else {
      setTemplates((prev) => [...prev, { ...template, id: Date.now().toString() }]);
    }
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Email Templates</h2>
        <Button onClick={() => setEditingTemplate({} as EmailTemplate)}>Create Template</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {templates.map((template) => (
          <Card key={template.id} className='cursor-pointer hover:shadow-md transition-shadow'>
            <CardHeader>
              <CardTitle className='text-lg'>{template.name}</CardTitle>
              <CardDescription>{template.subject}</CardDescription>
              <Badge variant='secondary'>{template.category}</Badge>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground line-clamp-3'>
                {template.body.substring(0, 100)}...
              </p>
              <div className='flex items-center justify-between mt-4'>
                <span className='text-xs text-muted-foreground'>{template.variables.length} variables</span>
                <div className='flex space-x-2'>
                  <Button variant='outline' size='sm' onClick={() => setEditingTemplate(template)}>
                    Edit
                  </Button>
                  <Button variant='outline' size='sm' onClick={() => handleDeleteTemplate(template.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
