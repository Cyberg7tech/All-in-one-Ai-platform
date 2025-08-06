'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Send, History, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  text: string;
}

interface EmailHistory {
  id: string;
  to: string;
  subject: string;
  status: string;
  created_at: string;
}

export default function EmailManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('compose');
  const [sending, setSending] = useState(false);
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    html: '',
    text: '',
    from: '',
    replyTo: '',
  });

  useEffect(() => {
    fetchEmailHistory();
    loadTemplates();
  }, []);

  const fetchEmailHistory = async () => {
    try {
      const response = await fetch('/api/emails/history');
      if (response.ok) {
        const data = await response.json();
        setEmailHistory(data.emails);
      }
    } catch (error) {
      console.error('Error fetching email history:', error);
    }
  };

  const loadTemplates = () => {
    const defaultTemplates: EmailTemplate[] = [
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to All-in-One AI Platform!',
        html: '<div><h1>Welcome!</h1><p>Thank you for joining our platform.</p></div>',
        text: 'Welcome! Thank you for joining our platform.',
      },
      {
        id: 'newsletter',
        name: 'Newsletter',
        subject: 'AI Platform Newsletter - Latest Updates',
        html: '<div><h1>Newsletter</h1><p>Stay updated with the latest features.</p></div>',
        text: 'Newsletter: Stay updated with the latest features.',
      },
    ];
    setTemplates(defaultTemplates);
  };

  const handleSendEmail = async () => {
    if (!emailData.to || !emailData.subject || (!emailData.html && !emailData.text)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        toast.success('Email sent successfully!');
        setEmailData({ to: '', subject: '', html: '', text: '', from: '', replyTo: '' });
        fetchEmailHistory();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Send email error:', error);
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const loadTemplate = (template: EmailTemplate) => {
    setEmailData({
      ...emailData,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge className='bg-green-100 text-green-800'>
            <CheckCircle className='w-3 h-3 mr-1' />
            Sent
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant='destructive'>
            <AlertCircle className='w-3 h-3 mr-1' />
            Failed
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  return (
    <div className='space-y-6'>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='compose' className='flex items-center gap-2'>
            <Send className='w-4 h-4' />
            Compose
          </TabsTrigger>
          <TabsTrigger value='templates' className='flex items-center gap-2'>
            <FileText className='w-4 h-4' />
            Templates
          </TabsTrigger>
          <TabsTrigger value='history' className='flex items-center gap-2'>
            <History className='w-4 h-4' />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value='compose' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Mail className='w-5 h-5' />
                Compose Email
              </CardTitle>
              <CardDescription>Send emails using Resend</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium'>To</label>
                  <Input
                    placeholder='recipient@example.com'
                    value={emailData.to}
                    onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>From (optional)</label>
                  <Input
                    placeholder='noreply@yourdomain.com'
                    value={emailData.from}
                    onChange={(e) => setEmailData({ ...emailData, from: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className='text-sm font-medium'>Subject</label>
                <Input
                  placeholder='Email subject'
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                />
              </div>

              <div>
                <label className='text-sm font-medium'>Reply To (optional)</label>
                <Input
                  placeholder='support@yourdomain.com'
                  value={emailData.replyTo}
                  onChange={(e) => setEmailData({ ...emailData, replyTo: e.target.value })}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium'>HTML Content</label>
                  <Textarea
                    placeholder='<h1>Hello World</h1>'
                    value={emailData.html}
                    onChange={(e) => setEmailData({ ...emailData, html: e.target.value })}
                    rows={10}
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>Plain Text Content</label>
                  <Textarea
                    placeholder='Hello World'
                    value={emailData.text}
                    onChange={(e) => setEmailData({ ...emailData, text: e.target.value })}
                    rows={10}
                  />
                </div>
              </div>

              <Button onClick={handleSendEmail} disabled={sending} className='w-full'>
                {sending ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className='w-4 h-4 mr-2' />
                    Send Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='templates' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='w-5 h-5' />
                Email Templates
              </CardTitle>
              <CardDescription>Choose from pre-built email templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {templates.map((template) => (
                  <Card key={template.id} className='cursor-pointer hover:shadow-md transition-shadow'>
                    <CardHeader>
                      <CardTitle className='text-lg'>{template.name}</CardTitle>
                      <CardDescription>{template.subject}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant='outline' onClick={() => loadTemplate(template)} className='w-full'>
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='history' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <History className='w-5 h-5' />
                Email History
              </CardTitle>
              <CardDescription>View your sent emails</CardDescription>
            </CardHeader>
            <CardContent>
              {emailHistory.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <Mail className='w-12 h-12 mx-auto mb-4 opacity-50' />
                  <p>No emails sent yet</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {emailHistory.map((email) => (
                    <div key={email.id} className='flex items-center justify-between p-4 border rounded-lg'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='font-medium'>{email.to}</span>
                          {getStatusBadge(email.status)}
                        </div>
                        <p className='text-sm text-gray-600'>{email.subject}</p>
                        <p className='text-xs text-gray-500'>{new Date(email.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>
          Emails are sent using Resend. Make sure your domain is verified in your Resend dashboard for best
          deliverability.
        </AlertDescription>
      </Alert>
    </div>
  );
}
