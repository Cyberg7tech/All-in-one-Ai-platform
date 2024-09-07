import replicate, { replicateLlamaModel } from '../../models/replicate';
import { IMessage } from '../route';
import { chatPrompt } from '../../prompt';

async function ReplicateLlama31Chat(question: string, history: IMessage[]) {
  const historyString = history.map((item) => `${item.role.toUpperCase()}: "${item.content}"`).join('\n');

  const input = {
    top_p: 1,
    prompt: question,
    temperature: 0.5,
    max_new_tokens: 1024,
    system_prompt: `${chatPrompt}
    HISTORY: ${historyString}`,
  };

  const stream = await replicate.stream(replicateLlamaModel, { input });

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

export default ReplicateLlama31Chat;
