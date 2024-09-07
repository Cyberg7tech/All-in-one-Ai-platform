// This is a pinecone configuration file that initializes the pinecone client and creates an index.

import { Pinecone } from '@pinecone-database/pinecone';

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? '';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY ?? '',
});

export const pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);
