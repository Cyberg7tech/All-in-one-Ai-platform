// This is the API route that will be used to handle the chat functionality.

import { NextResponse } from 'next/server';
import { pineconeIndex } from './pinecone';
import { loadEmbeddings, openAIModel } from './openai';
import { PineconeStore } from '@langchain/pinecone';
import { promptTemplate } from './prompt-template';
import { getUserDetails } from '@/utils/supabase/server';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { formatDocumentsAsString } from 'langchain/util/document';

export const runtime = 'edge';

export const POST = async (req: Request) => {
  const request = await req.json();
  const { question, documentId, history } = request;

  try {
    const user = await getUserDetails();
    if (user == null) {
      throw 'Please login to chat with your file.';
    }

    // Load the OpenAI model and embeddings
    const model = openAIModel();

    const embeddings = loadEmbeddings();

    // Create a retriever from the Pinecone index. Retriever is used to retrieve similar documents based on the input.
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, { pineconeIndex });
    const retriever = vectorStore.asRetriever(5, { document_id: documentId });

    const conversationalRetrievalQAChain = RunnableSequence.from([
      {
        question: (input: { question: string; chatHistory?: string }) => input.question,
        chatHistory: (input: { question: string; chatHistory?: string }) => input.chatHistory ?? '',
        context: async (input: { question: string; chatHistory?: string }) => {
          const relevantDocs = await retriever.invoke(input.question);
          const serialized = formatDocumentsAsString(relevantDocs);
          return serialized;
        },
      },
      promptTemplate,
      model,
      new StringOutputParser(),
    ]);

    const stream = await conversationalRetrievalQAChain.stream({
      question,
      chatHistory: history ?? '',
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      start(controller) {
        // Asynchronously iterate over the stream from conversationalRetrievalQAChain.
        (async () => {
          for await (const chunk of stream) {
            // The encoder converts each string chunk to Uint8Array before enqueueing to the stream.
            const chunkData = encoder.encode(chunk);
            controller.enqueue(chunkData);
          }
          // Close the stream when the iteration is complete.
          controller.close();
        })();
      },
    });

    // Return a new Response object with the readableStream.
    return new NextResponse(readableStream, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};
