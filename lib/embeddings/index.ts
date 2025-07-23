import { aiModelManager } from '@/lib/ai/models';
import { dbHelpers } from '@/lib/supabase/client';
import { chunk } from '@/lib/utils/text';

export interface DocumentChunk {
  id?: number;
  content: string;
  metadata: {
    user_id: string;
    source?: string;
    title?: string;
    page?: number;
    chunk_index?: number;
    url?: string;
    type?: 'pdf' | 'text' | 'web' | 'upload';
  };
}

export interface SearchResult {
  id: number;
  content: string;
  metadata: any;
  similarity: number;
}

class EmbeddingService {
  private readonly CHUNK_SIZE = 1000;
  private readonly CHUNK_OVERLAP = 200;

  // Generate embeddings for text
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      return await aiModelManager.generateEmbeddings(text);
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  // Process and store document with embeddings
  async processAndStoreDocument(
    content: string,
    metadata: Omit<DocumentChunk['metadata'], 'chunk_index'>,
    userId: string
  ): Promise<number[]> {
    try {
      // Clean and prepare content
      const cleanContent = this.cleanText(content);
      
      // Split into chunks
      const chunks = chunk(cleanContent, this.CHUNK_SIZE, this.CHUNK_OVERLAP);
      
      const documentIds: number[] = [];

      // Process each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i];
        
        // Generate embedding for chunk
        const embedding = await this.generateEmbedding(chunkContent);
        
        // Prepare chunk metadata
        const chunkMetadata = {
          ...metadata,
          user_id: userId,
          chunk_index: i,
          total_chunks: chunks.length,
        };

        // Store in database
        const document = await dbHelpers.insertDocument({
          user_id: userId,
          title: chunkMetadata.title || `Document chunk ${i + 1}`,
          content: chunkContent,
          embedding: embedding,
          metadata: chunkMetadata
        });

        documentIds.push(document.id);
      }

      return documentIds;
    } catch (error) {
      console.error('Error processing document:', error);
      throw new Error('Failed to process and store document');
    }
  }

  // Search for similar documents
  async searchSimilarDocuments(
    query: string,
    userId: string,
    options: {
      limit?: number;
      filter?: Record<string, any>;
      threshold?: number;
    } = {}
  ): Promise<SearchResult[]> {
    try {
      const { limit = 10, filter = {}, threshold = 0.7 } = options;

      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query);

      // Add user filter
      const searchFilter = {
        ...filter,
        user_id: userId,
      };

      // Search in database
      const results = await dbHelpers.searchDocuments(
        userId,
        query,
        queryEmbedding,
        limit
      );

      // Filter by similarity threshold
      return results.filter((result: any) => result.similarity >= threshold);
    } catch (error) {
      console.error('Error searching documents:', error);
      throw new Error('Failed to search documents');
    }
  }

  // RAG: Retrieve and generate response
  async ragQuery(
    query: string,
    userId: string,
    options: {
      modelId?: string;
      maxTokens?: number;
      temperature?: number;
      includeContext?: boolean;
      contextLimit?: number;
    } = {}
  ): Promise<{
    response: string;
    sources: SearchResult[];
    context: string;
  }> {
    try {
      const {
        modelId = 'gpt-3.5-turbo',
        maxTokens = 1000,
        temperature = 0.7,
        includeContext = true,
        contextLimit = 5
      } = options;

      // Search for relevant documents
      const relevantDocs = await this.searchSimilarDocuments(query, userId, {
        limit: contextLimit,
        threshold: 0.7
      });

      // Build context from relevant documents
      const context = relevantDocs
        .map(doc => `[Source: ${doc.metadata.title || 'Document'}]\n${doc.content}`)
        .join('\n\n---\n\n');

      // Create system prompt for RAG
      const systemPrompt = `You are an AI assistant with access to a knowledge base. Use the provided context to answer questions accurately and cite sources when relevant.

Available Context:
${context}

Instructions:
1. Answer based primarily on the provided context
2. If the context doesn't contain enough information, say so
3. Cite sources when using specific information
4. Be concise but comprehensive
5. If asked about something not in the context, explain the limitation`;

      // Generate response using AI model
      const response = await aiModelManager.generateText(
        modelId,
        query,
        {
          systemPrompt,
          maxTokens,
          temperature
        }
      );

      return {
        response,
        sources: relevantDocs,
        context: includeContext ? context : ''
      };
    } catch (error) {
      console.error('Error in RAG query:', error);
      throw new Error('Failed to generate RAG response');
    }
  }

  // Semantic search with multiple strategies
  async semanticSearch(
    query: string,
    userId: string,
    searchType: 'exact' | 'semantic' | 'hybrid' = 'hybrid',
    options: {
      limit?: number;
      filter?: Record<string, any>;
    } = {}
  ): Promise<SearchResult[]> {
    try {
      const { limit = 10, filter = {} } = options;

      switch (searchType) {
        case 'semantic':
          return await this.searchSimilarDocuments(query, userId, { limit, filter });

        case 'exact':
          // This would need to be implemented with full-text search
          // For now, falling back to semantic search
          return await this.searchSimilarDocuments(query, userId, { limit, filter });

        case 'hybrid':
          // Combine semantic and keyword search
          const semanticResults = await this.searchSimilarDocuments(query, userId, { 
            limit: Math.ceil(limit * 0.7), 
            filter 
          });

          // Could add keyword search here and merge results
          return semanticResults;

        default:
          throw new Error(`Unsupported search type: ${searchType}`);
      }
    } catch (error) {
      console.error('Error in semantic search:', error);
      throw new Error('Failed to perform semantic search');
    }
  }

  // Process web content (for web scraping integration)
  async processWebContent(
    url: string,
    userId: string,
    options: {
      title?: string;
      extractText?: boolean;
    } = {}
  ): Promise<number[]> {
    try {
      // This would integrate with Firecrawl API
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, ...options })
      });

      if (!response.ok) {
        throw new Error('Failed to scrape web content');
      }

      const { content, title } = await response.json();

      return await this.processAndStoreDocument(
        content,
        {
          user_id: userId,
          source: 'web',
          url,
          title: title || options.title || url,
          type: 'web'
        },
        userId
      );
    } catch (error) {
      console.error('Error processing web content:', error);
      throw new Error('Failed to process web content');
    }
  }

  // Process file upload
  async processFileUpload(
    file: File,
    userId: string,
    metadata: Partial<DocumentChunk['metadata']> = {}
  ): Promise<number[]> {
    try {
      // Extract text content based on file type
      let content: string;

      if (file.type === 'text/plain') {
        content = await file.text();
      } else if (file.type === 'application/pdf') {
        // Would need PDF parsing library
        throw new Error('PDF processing not yet implemented');
      } else {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      return await this.processAndStoreDocument(
        content,
        {
          user_id: userId,
          source: 'upload',
          title: file.name,
          type: this.getFileType(file.type),
          ...metadata
        },
        userId
      );
    } catch (error) {
      console.error('Error processing file upload:', error);
      throw new Error('Failed to process file upload');
    }
  }

  // Batch process multiple documents
  async batchProcessDocuments(
    documents: Array<{
      content: string;
      metadata: Omit<DocumentChunk['metadata'], 'chunk_index'>;
    }>,
    userId: string
  ): Promise<number[][]> {
    const results: number[][] = [];

    for (const doc of documents) {
      try {
        const documentIds = await this.processAndStoreDocument(
          doc.content,
          doc.metadata,
          userId
        );
        results.push(documentIds);
      } catch (error) {
        console.error(`Error processing document: ${doc.metadata.title}`, error);
        results.push([]);
      }
    }

    return results;
  }

  // Clean text content
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/\n\s*\n/g, '\n')  // Remove excessive line breaks
      .trim();
  }

  // Get file type from MIME type
  private getFileType(mimeType: string): 'pdf' | 'text' | 'web' | 'upload' {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('text')) return 'text';
    return 'upload';
  }

  // Generate synthetic questions for document
  async generateQuestionsForDocument(
    content: string,
    userId: string,
    modelId: string = 'gpt-3.5-turbo'
  ): Promise<string[]> {
    try {
      const prompt = `Generate 5 diverse questions that this document could answer. The questions should be specific and well-formed. Return only the questions, one per line.

Document content:
${content.substring(0, 2000)}...`;

      const response = await aiModelManager.generateText(
        modelId,
        prompt,
        {
          maxTokens: 300,
          temperature: 0.8
        }
      );

      return response
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 5);
    } catch (error) {
      console.error('Error generating questions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const embeddingService = new EmbeddingService();

// Utility functions
export const ragUtils = {
  // Rerank results based on query relevance
  rerankResults: async (
    query: string,
    results: SearchResult[],
    modelId: string = 'gpt-3.5-turbo'
  ): Promise<SearchResult[]> => {
    // Simple reranking based on content relevance
    // In production, you might use a dedicated reranking model
    return results.sort((a, b) => b.similarity - a.similarity);
  },

  // Extract key phrases from query
  extractKeyPhrases: (query: string): string[] => {
    // Simple key phrase extraction
    return query
      .toLowerCase()
      .split(/[^a-zA-Z0-9\s]/)
      .join(' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 5);
  },

  // Generate summary of search results
  summarizeResults: async (
    results: SearchResult[],
    modelId: string = 'gpt-3.5-turbo'
  ): Promise<string> => {
    if (results.length === 0) return 'No relevant documents found.';

    const content = results
      .slice(0, 3)
      .map(r => r.content)
      .join('\n\n');

    const prompt = `Provide a brief summary of the key information from these document excerpts:

${content}

Summary:`;

    try {
      return await aiModelManager.generateText(modelId, prompt, {
        maxTokens: 200,
        temperature: 0.3
      });
    } catch (error) {
      console.error('Error summarizing results:', error);
      return 'Unable to generate summary.';
    }
  }
}; 