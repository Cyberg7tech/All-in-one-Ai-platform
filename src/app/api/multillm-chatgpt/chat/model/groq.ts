import Groq from 'groq-sdk';
import { IMessage } from '../route';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function GroqChat(question: string, messages: IMessage[]) {
  messages.push({ role: 'user', content: question });

  const stream = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant that answers given questions. You provide concise answers to every question with no filler words.\n\nIf a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.\n\nIf an answer is much better represented in bullet points, answer in bullet points. If an answer to a question requires detailed paragraphs, use paragraphs to answer the question.`,
      },
      ...messages,
    ],
    model: 'llama3-8b-8192',
    max_tokens: 1024,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    start(controller) {
      // Asynchronously iterate over the stream from conversationalRetrievalQAChain.
      (async () => {
        for await (const chunk of stream) {
          // The encoder converts each string chunk to Uint8Array before enqueueing to the stream.
          const chunkData = encoder.encode(chunk.choices[0]?.delta?.content || '');
          controller.enqueue(chunkData);
        }
        // Close the stream when the iteration is complete.
        controller.close();
      })();
    },
  });

  // Return a new Response object with the readableStream.
  return new Response(readableStream);
}

export default GroqChat;
