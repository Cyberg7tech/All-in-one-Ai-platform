// This route is used for generating custom social media content based on user-defined topics and styles.
// The API is called by the Content Writer component in the frontend where users can specify the desired topic and style.

import { getUserDetails } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

export const POST = async (req: Request) => {
  try {
    const user = await getUserDetails();

    // Check if user is logged in
    if (user == null) {
      throw new Error('Please login to create contents.');
    }

    // Parse JSON body from the request to get topic and style
    const { topic, style, wordLimit, voice } = await req.json();

    // Validate that both topic and style are provided
    if (!topic || !style || !wordLimit || !voice) {
      throw new Error('Please provide all required fields.');
    }

    // TODO change prompt
    // Construct the prompt for the OpenAI content generation
    const prompt = `Generate 5 social media contents on the topic: ${topic}.
    Make sure the style of the content is around ${style}.
    Voice: ${voice}
    Language: ${voice}`;

    // Configuration for the OpenAI API call
    const stream = await openai.chat.completions.create({
      messages: [{ role: 'user', content: `type JSON ${prompt}` }],
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true,
      n: 1,
      model: 'gpt-4-turbo',
      max_tokens: 2000,
      temperature: 0.9,
      response_format: { type: 'json_object' },
      functions: [
        {
          name: 'generateSocialMediaContent',
          description: 'Generate social media content based on the given inputs',
          parameters: {
            type: 'object',
            properties: {
              content_ideas: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['title', 'description'],
                  properties: {
                    title: {
                      type: 'string',
                      description: 'Title of the social media content. maximum 5-7 words',
                    },
                    description: {
                      type: 'string',
                      description:
                        'Description of the social media content. must be 100 to 150 words and use icons also if required',
                    },
                  },
                },
              },
            },
            required: ['content_ideas'],
          },
        },
      ],
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      start(controller) {
        // Asynchronously iterate over the stream from conversationalRetrievalQAChain.
        (async () => {
          for await (const chunk of stream) {
            // The encoder converts each string chunk to Uint8Array before enqueueing to the stream.
            const chunkData = encoder.encode(chunk.choices[0]?.delta?.function_call?.arguments || '');
            controller.enqueue(chunkData);
          }
          // Close the stream when the iteration is complete.
          controller.close();
        })();
      },
    });

    // Return a new Response object with the readableStream.
    return new Response(readableStream);
  } catch (error) {
    console.error('An error occurred:', error);
    return NextResponse.error();
  }
};
