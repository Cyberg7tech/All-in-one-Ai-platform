import groq, { groqLlamaModel } from '../../models/groq';
import { IMessage } from '../route';
import { chatPrompt } from '../../prompt';

async function GroqLlama31Chat(question: string, messages: IMessage[]) {
  messages.push({ role: 'user', content: question });

  const stream = await groq.chat.completions.create({
    messages: [{ role: 'system', content: chatPrompt }, ...messages],
    model: groqLlamaModel,
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

export default GroqLlama31Chat;
