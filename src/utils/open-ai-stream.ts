// This function encapsulates the logic for streaming responses from the OpenAI API.
// It uses fetch API to make a POST request to OpenAI's chat completions endpoint.
// The function sets up a ReadableStream to handle data chunks as they arrive, ensuring efficient data processing and transfer.
// A parser from 'eventsource-parser' is used to process the data chunks into meaningful events, which are then encoded and sent to the client.
// Errors in stream processing are handled gracefully, and the stream is closed when the data is marked as complete.

import { ParsedEvent, ReconnectInterval, createParser } from 'eventsource-parser';

// Defines a type for different roles that messages in the OpenAIStreamPayload can assume.
export type ChatGPTAgent = 'user' | 'system';

// Defines the structure for messages within the OpenAIStreamPayload.
export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}

// Defines the structure for the payload to be sent to the OpenAI API.
// Includes parameters for model configuration, such as temperature and token limits, to tailor the AI's response style and length.
export interface OpenAIStreamPayload {
  model: string;
  messages: ChatGPTMessage[];
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
  response_format: {
    type: string;
  };
  functions: FunctionObject[];
}

// Defines the structure for the function object within the OpenAIStreamPayload.
// Includes parameters for the function's name, description, and expected input properties.
interface FunctionObject {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: {
      content_ideas: {
        type: string;
        items: {
          type: string;
          required: string[];
          properties: {
            title: {
              type: string;
              description: string;
            };
            description: {
              type: string;
              description: string;
            };
          };
        };
      };
    };
    required: string[];
  };
}

export async function OpenAIStream(payload: OpenAIStreamPayload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Fetch data from OpenAI API using the provided payload
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
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
            const text = json.choices[0]?.delta?.function_call?.arguments || '';

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

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  // Return response as a stream
  return stream;
}
