'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Upload,
  FileText,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  Bot,
  Brain,
  Languages,
  MessageSquare,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

interface ProcessedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'failed';
  extractedText?: string;
  summary?: string;
  keyEntities?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  language?: string;
  wordCount?: number;
  readingTime?: number;
  tags?: string[];
  insights?: {
    topics: string[];
    keywords: string[];
    questions: string[];
  };
}

const SAMPLE_DOCUMENTS: ProcessedDocument[] = [
  {
    id: '1',
    name: 'Q4_Financial_Report.pdf',
    type: 'pdf',
    size: 2048000,
    uploadDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'completed',
    extractedText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    summary:
      'This quarterly financial report shows strong growth in revenue and profitability, with key highlights including 15% increase in sales and improved operational efficiency.',
    keyEntities: ['Revenue', 'Q4 2024', 'Sales Growth', 'Operational Efficiency'],
    sentiment: 'positive',
    language: 'English',
    wordCount: 1250,
    readingTime: 5,
    tags: ['Financial', 'Report', 'Q4'],
    insights: {
      topics: ['Financial Performance', 'Market Analysis', 'Growth Strategy'],
      keywords: ['revenue', 'growth', 'profitability', 'efficiency'],
      questions: ['What drove the revenue increase?', 'How can we maintain this growth?'],
    },
  },
  {
    id: '2',
    name: 'Product_Requirements.docx',
    type: 'docx',
    size: 512000,
    uploadDate: new Date(Date.now() - 5 * 60 * 60 * 1000),
    status: 'completed',
    extractedText: 'Product requirements document for new One Ai platform...',
    summary:
      'Comprehensive product requirements document outlining features, user stories, and technical specifications for the new One Ai platform launch.',
    keyEntities: ['One Ai Platform', 'User Stories', 'Technical Specifications', 'Features'],
    sentiment: 'neutral',
    language: 'English',
    wordCount: 890,
    readingTime: 4,
    tags: ['Product', 'Requirements', 'AI'],
    insights: {
      topics: ['Product Development', 'User Experience', 'Technical Architecture'],
      keywords: ['platform', 'features', 'users', 'specifications'],
      questions: ['What are the core features?', 'Who are the target users?'],
    },
  },
];

const PROCESSING_FEATURES = [
  {
    id: 'text_extraction',
    name: 'Text Extraction',
    description: 'Extract text from PDFs, images, and documents',
    icon: FileText,
    enabled: true,
  },
  {
    id: 'summarization',
    name: 'AI Summarization',
    description: 'Generate intelligent summaries of document content',
    icon: Brain,
    enabled: true,
  },
  {
    id: 'entity_extraction',
    name: 'Entity Recognition',
    description: 'Identify key entities, people, places, and concepts',
    icon: Search,
    enabled: true,
  },
  {
    id: 'sentiment_analysis',
    name: 'Sentiment Analysis',
    description: 'Analyze emotional tone and sentiment',
    icon: MessageSquare,
    enabled: true,
  },
  {
    id: 'language_detection',
    name: 'Language Detection',
    description: 'Detect and identify document language',
    icon: Languages,
    enabled: true,
  },
  {
    id: 'topic_modeling',
    name: 'Topic Modeling',
    description: 'Extract main topics and themes',
    icon: BarChart3,
    enabled: false,
  },
];

const SUPPORTED_FORMATS = [
  { ext: 'PDF', description: 'Portable Document Format' },
  { ext: 'DOCX', description: 'Microsoft Word Document' },
  { ext: 'TXT', description: 'Plain Text File' },
  { ext: 'RTF', description: 'Rich Text Format' },
  { ext: 'HTML', description: 'Web Page' },
  { ext: 'MD', description: 'Markdown File' },
];

export default function DocumentProcessingPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<ProcessedDocument[]>(SAMPLE_DOCUMENTS);
  const [selectedDocument, setSelectedDocument] = useState<ProcessedDocument | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'documents' | 'viewer'>('upload');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [processingFeatures, setProcessingFeatures] = useState(PROCESSING_FEATURES);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);

    for (const file of files) {
      const newDoc: ProcessedDocument = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        size: file.size,
        uploadDate: new Date(),
        status: 'processing',
      };

      setDocuments((prev) => [newDoc, ...prev]);

      // Simulate processing
      setTimeout(
        async () => {
          const processedDoc = await simulateDocumentProcessing(newDoc, file);
          setDocuments((prev) => prev.map((doc) => (doc.id === newDoc.id ? processedDoc : doc)));
        },
        2000 + Math.random() * 3000
      );
    }

    setIsProcessing(false);
    setActiveTab('documents');
  };

  const simulateDocumentProcessing = async (
    doc: ProcessedDocument,
    file: File
  ): Promise<ProcessedDocument> => {
    // Simulate API calls for document processing
    const enabledFeatures = processingFeatures.filter((f) => f.enabled);

    return {
      ...doc,
      status: 'completed',
      extractedText: 'Sample extracted text from the document...',
      summary: `This document "${file.name}" contains important information about various topics and has been successfully processed with AI analysis.`,
      keyEntities: ['Key Entity 1', 'Key Entity 2', 'Important Topic'],
      sentiment: Math.random() > 0.5 ? 'positive' : 'neutral',
      language: 'English',
      wordCount: Math.floor(Math.random() * 2000) + 500,
      readingTime: Math.floor(Math.random() * 10) + 2,
      tags: ['Auto-Generated', 'Processed', file.name.split('.')[0]],
      insights: {
        topics: ['Topic 1', 'Topic 2', 'Topic 3'],
        keywords: ['keyword1', 'keyword2', 'keyword3'],
        questions: ['What is the main purpose?', 'How can this be improved?'],
      },
    };
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleFeature = (featureId: string) => {
    setProcessingFeatures((prev) =>
      prev.map((f) => (f.id === featureId ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const deleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    if (selectedDocument?.id === docId) {
      setSelectedDocument(null);
      setActiveTab('documents');
    }
  };

  const viewDocument = (doc: ProcessedDocument) => {
    setSelectedDocument(doc);
    setActiveTab('viewer');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='flex items-center mb-6'>
        <Button variant='ghost' asChild className='mr-4'>
          <Link href='/dashboard/explore'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Explore
          </Link>
        </Button>
        <div>
          <h1 className='text-3xl font-bold flex items-center'>
            <FileText className='w-8 h-8 mr-3 text-primary' />
            Document Processing
          </h1>
          <p className='text-muted-foreground'>Upload and analyze documents with AI-powered insights</p>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex space-x-4 mb-6'>
        <Button
          variant={activeTab === 'upload' ? 'default' : 'outline'}
          onClick={() => setActiveTab('upload')}>
          <Upload className='w-4 h-4 mr-2' />
          Upload
        </Button>
        <Button
          variant={activeTab === 'documents' ? 'default' : 'outline'}
          onClick={() => setActiveTab('documents')}>
          <FileText className='w-4 h-4 mr-2' />
          Documents ({documents.length})
        </Button>
        {selectedDocument && (
          <Button
            variant={activeTab === 'viewer' ? 'default' : 'outline'}
            onClick={() => setActiveTab('viewer')}>
            <Eye className='w-4 h-4 mr-2' />
            Viewer
          </Button>
        )}
      </div>

      {activeTab === 'upload' && (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Upload Section */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
                <CardDescription>Upload multiple documents for AI-powered analysis</CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='border-2 border-dashed border-border rounded-lg p-8 text-center'>
                  <Upload className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
                  <h3 className='text-xl font-semibold mb-2'>Drop your documents here</h3>
                  <p className='text-muted-foreground mb-4'>Or click to browse and select files</p>
                  <input
                    ref={fileInputRef}
                    type='file'
                    multiple
                    accept='.pdf,.docx,.txt,.rtf,.html,.md'
                    onChange={handleFileUpload}
                    className='hidden'
                  />
                  <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : 'Choose Files'}
                  </Button>
                </div>

                {/* Supported Formats */}
                <div>
                  <h4 className='font-medium mb-3'>Supported Formats</h4>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                    {SUPPORTED_FORMATS.map((format) => (
                      <div key={format.ext} className='flex items-center space-x-2 p-2 border rounded'>
                        <FileText className='w-4 h-4 text-primary' />
                        <div>
                          <p className='font-medium text-sm'>{format.ext}</p>
                          <p className='text-xs text-muted-foreground'>{format.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Processing Features */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Processing Features</CardTitle>
                <CardDescription>Configure AI analysis options</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {processingFeatures.map((feature) => (
                  <div key={feature.id} className='flex items-start space-x-3'>
                    <input
                      type='checkbox'
                      checked={feature.enabled}
                      onChange={() => toggleFeature(feature.id)}
                      className='mt-1'
                    />
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2'>
                        <feature.icon className='w-4 h-4 text-primary' />
                        <span className='font-medium text-sm'>{feature.name}</span>
                      </div>
                      <p className='text-xs text-muted-foreground mt-1'>{feature.description}</p>
                    </div>
                  </div>
                ))}

                <div className='pt-4 border-t'>
                  <p className='text-xs text-muted-foreground'>
                    Selected features will be applied to all uploaded documents
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div>
          {/* Search and Filters */}
          <div className='flex flex-col sm:flex-row gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <input
                type='text'
                placeholder='Search documents...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className='px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring'>
              <option value='all'>All Status</option>
              <option value='completed'>Completed</option>
              <option value='processing'>Processing</option>
              <option value='failed'>Failed</option>
            </select>
          </div>

          {/* Documents Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className='hover:shadow-lg transition-shadow'>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <FileText className='w-5 h-5 text-primary' />
                      <CardTitle className='text-base truncate'>{doc.name}</CardTitle>
                    </div>
                    <Badge
                      className={
                        doc.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : doc.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }>
                      {doc.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  <div className='text-sm space-y-1'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Size:</span>
                      <span>{formatFileSize(doc.size)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Uploaded:</span>
                      <span>{doc.uploadDate.toLocaleDateString()}</span>
                    </div>
                    {doc.status === 'completed' && (
                      <>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>Words:</span>
                          <span>{doc.wordCount?.toLocaleString()}</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>Reading:</span>
                          <span>{doc.readingTime} min</span>
                        </div>
                      </>
                    )}
                  </div>

                  {doc.status === 'completed' && doc.summary && (
                    <div>
                      <p className='text-sm text-muted-foreground mb-1'>Summary:</p>
                      <p className='text-sm line-clamp-3'>{doc.summary}</p>
                    </div>
                  )}

                  {doc.tags && doc.tags.length > 0 && (
                    <div className='flex flex-wrap gap-1'>
                      {doc.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant='outline' className='text-xs'>
                          {tag}
                        </Badge>
                      ))}
                      {doc.tags.length > 3 && (
                        <Badge variant='outline' className='text-xs'>
                          +{doc.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className='flex space-x-2 pt-2'>
                    {doc.status === 'completed' && (
                      <Button size='sm' onClick={() => viewDocument(doc)} className='flex-1'>
                        <Eye className='w-3 h-3 mr-1' />
                        View
                      </Button>
                    )}
                    <Button size='sm' variant='outline'>
                      <Download className='w-3 h-3' />
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='text-red-600 hover:text-red-700'
                      onClick={() => deleteDocument(doc.id)}>
                      <Trash2 className='w-3 h-3' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className='text-center py-12'>
              <FileText className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No documents found</h3>
              <p className='text-muted-foreground mb-4'>
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first document to get started'}
              </p>
              <Button onClick={() => setActiveTab('upload')}>
                <Upload className='w-4 h-4 mr-2' />
                Upload Documents
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'viewer' && selectedDocument && (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Document Content */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span>{selectedDocument.name}</span>
                  <div className='flex space-x-2'>
                    <Button size='sm' variant='outline'>
                      <Download className='w-4 h-4 mr-2' />
                      Download
                    </Button>
                    <Button size='sm' variant='outline'>
                      <Bot className='w-4 h-4 mr-2' />
                      Chat with Document
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Uploaded {selectedDocument.uploadDate.toLocaleString()} •{' '}
                  {formatFileSize(selectedDocument.size)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  {/* Summary */}
                  {selectedDocument.summary && (
                    <div>
                      <h4 className='font-medium mb-2'>AI Summary</h4>
                      <div className='p-4 bg-muted/50 rounded-lg'>
                        <p className='text-sm'>{selectedDocument.summary}</p>
                      </div>
                    </div>
                  )}

                  {/* Extracted Text */}
                  {selectedDocument.extractedText && (
                    <div>
                      <h4 className='font-medium mb-2'>Extracted Content</h4>
                      <div className='p-4 border rounded-lg max-h-96 overflow-y-auto'>
                        <p className='text-sm whitespace-pre-wrap'>{selectedDocument.extractedText}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Panel */}
          <div className='space-y-6'>
            {/* Document Info */}
            <Card>
              <CardHeader>
                <CardTitle>Document Info</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Status:</span>
                  <Badge
                    className={
                      selectedDocument.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : selectedDocument.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                    }>
                    {selectedDocument.status}
                  </Badge>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Language:</span>
                  <span>{selectedDocument.language}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Word Count:</span>
                  <span>{selectedDocument.wordCount?.toLocaleString()}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Reading Time:</span>
                  <span>{selectedDocument.readingTime} minutes</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Sentiment:</span>
                  <Badge
                    variant={
                      selectedDocument.sentiment === 'positive'
                        ? 'default'
                        : selectedDocument.sentiment === 'negative'
                          ? 'destructive'
                          : 'secondary'
                    }>
                    {selectedDocument.sentiment}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Key Entities */}
            {selectedDocument.keyEntities && (
              <Card>
                <CardHeader>
                  <CardTitle>Key Entities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    {selectedDocument.keyEntities.map((entity, index) => (
                      <Badge key={index} variant='outline'>
                        {entity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Insights */}
            {selectedDocument.insights && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Insights</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <h5 className='font-medium text-sm mb-2'>Main Topics:</h5>
                    <div className='flex flex-wrap gap-1'>
                      {selectedDocument.insights.topics.map((topic, index) => (
                        <Badge key={index} variant='secondary' className='text-xs'>
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className='font-medium text-sm mb-2'>Keywords:</h5>
                    <div className='flex flex-wrap gap-1'>
                      {selectedDocument.insights.keywords.map((keyword, index) => (
                        <Badge key={index} variant='outline' className='text-xs'>
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className='font-medium text-sm mb-2'>Suggested Questions:</h5>
                    <ul className='space-y-1'>
                      {selectedDocument.insights.questions.map((question, index) => (
                        <li key={index} className='text-sm text-muted-foreground'>
                          • {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {selectedDocument.tags && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    {selectedDocument.tags.map((tag, index) => (
                      <Badge key={index} variant='outline'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
