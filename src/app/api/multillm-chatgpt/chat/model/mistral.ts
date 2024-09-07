import Replicate from 'replicate';
import { IMessage } from '../route';

const replicate = new Replicate();

async function MistralChat(question: string, history: IMessage[]) {
  const historyString = history.map((item) => `${item.role.toUpperCase()}: "${item.content}"`).join('\n');

  const input = {
    top_p: 1,
    prompt: question,
    temperature: 0.5,
    max_new_tokens: 1024,
    system_prompt: `You are a helpful assistant that answers the given questions. You provide concise answers to every question with no filler words.\n\nIf a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.\n\nI am attaching the history of the previous conversions if exists. Make sure to read the history before answering the question to give more contextual answer.
    HISTORY: ${historyString}`,
  };

  const stream = await replicate.stream('mistralai/mistral-7b-instruct-v0.2', { input });

  // for await (const chunk of stream) {
  //   console.log(`${chunk}`);
  // }

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    start(controller) {
      // Asynchronously iterate over the stream from conversationalRetrievalQAChain.
      (async () => {
        for await (const event of stream) {
          const chunkData = encoder.encode(`${event}` || '');
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

export default MistralChat;
