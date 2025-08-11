'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Bot,
  User,
  Send,
  Upload,
  FileText,
  X,
  CheckCircle,
  Loader2,
  MessageSquare,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
}

export default function ChatWithPDFPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    selectedFiles.forEach((file) => {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload PDF files only.',
          variant: 'destructive',
        });
        return;
      }

      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        status: 'uploading',
        progress: 0,
      };

      setFiles((prev) => [...prev, newFile]);

      // Simulate file upload and processing
      simulateFileProcessing(fileId);
    });

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateFileProcessing = async (fileId: string) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, progress } : file)));
    }

    // Change to processing
    setFiles((prev) =>
      prev.map((file) => (file.id === fileId ? { ...file, status: 'processing', progress: 0 } : file))
    );

    // Simulate processing progress
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, progress } : file)));
    }

    // Mark as ready
    setFiles((prev) =>
      prev.map((file) => (file.id === fileId ? { ...file, status: 'ready', progress: 100 } : file))
    );

    toast({
      title: 'PDF processed successfully',
      description: 'You can now ask questions about this document.',
    });
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
    toast({
      title: 'File removed',
      description: 'The PDF has been removed from the chat.',
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (files.filter((f) => f.status === 'ready').length === 0) {
      toast({
        title: 'No PDF available',
        description: 'Please upload and process a PDF before asking questions.',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate PDF chat API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Based on the uploaded PDF(s), here's what I found regarding "${userMessage.content}": 

This is a simulated response that would typically extract relevant information from the PDF content and provide a comprehensive answer. In a real implementation, this would:

1. Search through the PDF content for relevant sections
2. Extract key information related to your question
3. Provide citations or page references
4. Offer a clear and contextual answer

The actual response would be generated based on the specific content of your PDF document.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: 'Error sending message',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-3 mb-4'>
            <div className='p-2 bg-purple-100 rounded-lg'>
              <FileText className='size-6 text-purple-600' />
            </div>
            <div>
              <h1 className='text-3xl font-bold'>Chat with PDF</h1>
              <p className='text-muted-foreground'>Upload PDFs and chat with their content using AI</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* File Upload Section */}
          <div className='lg:col-span-1'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Upload className='size-5' />
                  Upload PDFs
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Upload Button */}
                <div>
                  <input
                    type='file'
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept='.pdf'
                    multiple
                    className='hidden'
                  />
                  <Button onClick={() => fileInputRef.current?.click()} className='w-full' variant='outline'>
                    <Upload className='size-4 mr-2' />
                    Choose PDF Files
                  </Button>
                  <p className='text-xs text-muted-foreground mt-2'>
                    Upload one or more PDF files to start chatting
                  </p>
                </div>

                {/* Uploaded Files */}
                <div className='space-y-3'>
                  {files.map((file) => (
                    <div key={file.id} className='border rounded-lg p-3'>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium truncate'>{file.name}</p>
                          <p className='text-xs text-muted-foreground'>{formatFileSize(file.size)}</p>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Badge className={getStatusColor(file.status)}>{file.status}</Badge>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => removeFile(file.id)}
                            className='size-6 p-0'>
                            <X className='size-3' />
                          </Button>
                        </div>
                      </div>

                      {(file.status === 'uploading' || file.status === 'processing') && (
                        <div className='space-y-1'>
                          <Progress value={file.progress} className='h-2' />
                          <p className='text-xs text-muted-foreground'>
                            {file.status === 'uploading' ? 'Uploading...' : 'Processing...'} {file.progress}%
                          </p>
                        </div>
                      )}

                      {file.status === 'ready' && (
                        <div className='flex items-center text-green-600 text-xs'>
                          <CheckCircle className='size-3 mr-1' />
                          Ready for chat
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {files.length === 0 && (
                  <div className='text-center py-8 text-muted-foreground'>
                    <FileText className='size-12 mx-auto mb-2' />
                    <p className='text-sm'>No PDFs uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Section */}
          <div className='lg:col-span-2'>
            <Card className='h-[600px] flex flex-col'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='flex items-center gap-2'>
                    <MessageSquare className='size-5' />
                    Chat with Documents
                  </CardTitle>
                  {messages.length > 0 && (
                    <Button variant='outline' size='sm' onClick={() => setMessages([])}>
                      <Trash2 className='size-4 mr-2' />
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className='flex-1 flex flex-col min-h-0'>
                {/* Messages */}
                <div className='flex-1 overflow-y-auto space-y-4 mb-4'>
                  {messages.length === 0 ? (
                    <div className='text-center py-12'>
                      <MessageSquare className='size-16 text-muted-foreground mx-auto mb-4' />
                      <h3 className='text-lg font-semibold mb-2'>No conversation yet</h3>
                      <p className='text-muted-foreground'>
                        Upload a PDF and start asking questions about its content
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-3 ${
                          message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                        <div
                          className={`shrink-0 size-8 rounded-full flex items-center justify-center ${
                            message.role === 'user'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                          {message.role === 'user' ? <User className='size-4' /> : <Bot className='size-4' />}
                        </div>
                        <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                          <div
                            className={`p-3 rounded-lg ${
                              message.role === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-muted'
                            }`}>
                            <div className='whitespace-pre-wrap'>{message.content}</div>
                          </div>
                          <div className='text-xs text-muted-foreground mt-1'>
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className='flex items-start space-x-3'>
                      <div className='shrink-0 size-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center'>
                        <Bot className='size-4' />
                      </div>
                      <div className='flex-1'>
                        <div className='p-3 rounded-lg bg-muted'>
                          <div className='flex items-center space-x-2'>
                            <Loader2 className='size-4 animate-spin' />
                            <span>Analyzing document...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className='flex space-x-2'>
                  <Input
                    placeholder='Ask a question about your PDF...'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={isLoading || files.filter((f) => f.status === 'ready').length === 0}
                    className='flex-1'
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={
                      !input.trim() || isLoading || files.filter((f) => f.status === 'ready').length === 0
                    }>
                    {isLoading ? <Loader2 className='size-4 animate-spin' /> : <Send className='size-4' />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
