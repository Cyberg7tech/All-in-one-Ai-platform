import azure from '../../models/azure';
import { IMessage } from '../route';

async function AzureLlama31Chat(question: string, messages: IMessage[]) {
  messages.push({ role: 'user', content: question });

  const response = await azure
    .path('/chat/completions')
    .post({
      body: { messages },
    })
    .asNodeStream();

  const stream = response.body;
  if (!stream) {
    throw new Error(`Failed to get chat completions with status: ${response.status}`);
  }

  if (response.status !== '200') {
    throw new Error(`Failed to get chat completions: ${(response.body as any).error}`);
  }

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const decodedChunk = Buffer.from(chunk.toString().split(',').map(Number)).toString('utf-8');
        const parsed = JSON.parse(decodedChunk);
        if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
          const content = parsed.choices[0].message.content;
          if (content) {
            controller.enqueue(new TextEncoder().encode(content + '\n'));
          }
        }
      }
      controller.close();
    },
  });

  // Return a new Response object with the readableStream.
  return new Response(readableStream);
}

export default AzureLlama31Chat;
