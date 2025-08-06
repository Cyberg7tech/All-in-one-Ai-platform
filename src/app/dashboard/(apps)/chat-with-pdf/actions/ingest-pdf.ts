// Server actions function to ingest a PDF file and store it in the vector store.
// We are using Pinecone as the vector store to store the embeddings. You can try using other vector stores like Faiss, Annoy, etc.

'use server';

import pdf from 'pdf-parse/lib/pdf-parse.js';
import { Document } from 'langchain/document';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { PineconeStore } from '@langchain/pinecone';
import { downloadFile } from './storage';
import { getDocIdFromFilename } from '@/utils/utils';
import { loadEmbeddings } from '@/utils/langchain-openai';
import { pineconeIndex } from '@/utils/pinecone';

// Function to ingest the PDF file and store it in the vector store.
export async function ingestFileInVector(fileName: string) {
  try {
    // Download the file from the storage using the file name
    const fileResponse = await downloadFile(fileName);
    if (typeof fileResponse === 'string') {
      throw fileResponse;
    }

    // Convert Blob to Buffer if necessary
    const arrayBuffer = await fileResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfContent = await pdf(buffer);
    const content = pdfContent?.text;

    // Get unique Document ID from file name
    const documentID = getDocIdFromFilename(fileName);

    const vectorDocument = new Document({
      pageContent: content,
      metadata: {
        document_id: documentID,
      },
    });

    // Split the document into chunks
    const splitter = new TokenTextSplitter({
      chunkSize: 400,
      chunkOverlap: 20,
      encodingName: 'cl100k_base',
    });

    const documentChunks = await splitter.splitDocuments([vectorDocument]);

    /* create and store the embeddings in the vectorStore */
    const embeddings = loadEmbeddings();

    await PineconeStore.fromDocuments(documentChunks, embeddings, { pineconeIndex });

    return { message: 'File Uploaded.' };
  } catch (error) {
    console.log(error);
    return `${error}`;
  }
}
