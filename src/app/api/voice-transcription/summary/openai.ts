// This function encapsulates the logic for streaming responses from the OpenAI API.
// It uses fetch API to make a POST request to OpenAI's chat completions endpoint.
// The function sets up a ReadableStream to handle data chunks as they arrive, ensuring efficient data processing and transfer.
// A parser from 'eventsource-parser' is used to process the data chunks into meaningful events, which are then encoded and sent to the client.
// Errors in stream processing are handled gracefully, and the stream is closed when the data is marked as complete.

import { ParsedEvent, ReconnectInterval, createParser } from 'eventsource-parser';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

// Defines the structure for the payload to be sent to the OpenAI API.
// Includes parameters for model configuration, such as temperature and token limits, to tailor the AI's response style and length.
interface ISummaryPayload {
  model: string;
  messages: ChatCompletionMessageParam[];
  temperature: number;
  max_tokens: number;
  stream: boolean;
}

export async function getSummary(transcription: any) {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are a writer, expert at summarising complex topics.
      I will present you with a chunk of text. I want you to summarize the content. Feel free to restructure and reorder the flow of the text if it helps increase the clarity of the content. Also, remember to add paragraph breaks and punctuation where appropriate.
      Use simple words and simple language.  Keep the sentences in simple type sentences only. Keep the sentences short and crisp.`,
    },
    {
      role: 'user',
      content: transcription,
    },
  ];

  const payload: ISummaryPayload = {
    messages,
    model: 'gpt-4-0125-preview',
    max_tokens: 1000,
    temperature: 0.9,
    stream: true,
  };

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Fetch data from OpenAI API using the provided payload
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  let counter = 0;

  // Handle streaming response from OpenAI API
  const stream = new ReadableStream({
    async start(controller) {
      function push(event: ParsedEvent | ReconnectInterval) {
        if (event.type === 'event') {
          const { data } = event;

          if (data === '[DONE]') {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta?.content || '';

            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }

            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (err) {
            controller.error(err);
          }
        }
      }

      const parser = createParser(push);

      for await (const chunk of response.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  // Return response as a stream
  return stream;
}
