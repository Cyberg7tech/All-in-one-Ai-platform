import { GoogleGenerativeAI } from '@google/generative-ai';
import { IMessage } from '../route';

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// The Gemini 1.5 models are versatile and work with multi-turn conversations (like chat)
const gemini = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function GeminiChat(question: string, messages: IMessage[]) {
  const history = messages.map(({ role, content }) => ({
    role: role === 'assistant' ? 'model' : 'user',
    parts: [{ text: content }],
  }));

  const chat = gemini.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 100,
    },
  });

  const { stream } = await chat.sendMessageStream(question);

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    start(controller) {
      // Asynchronously iterate over the stream from conversationalRetrievalQAChain.
      (async () => {
        for await (const chunk of stream) {
          // The encoder converts each string chunk to Uint8Array before enqueueing to the stream.
          const chunkData = encoder.encode(chunk.text() || '');
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

export default GeminiChat;
