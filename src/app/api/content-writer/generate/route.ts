// This route is used for generating custom social media content based on user-defined topics and styles.
// The API is called by the Content Writer component in the frontend where users can specify the desired topic and style.

import { getUserDetails } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

export const runtime = 'edge';

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

    // Construct the prompt for the OpenAI content generation
    const systemPrompt = `
      Your are an expert content writer. I want you to generate 5 different content on the TOPIC prvided by the user. The generated content should contain a TITLE and the actual content script.
      Make sure to follow the writing STYLE. Also make sure to generate the content in the asked OUTPUT LANGUAGE. And the length of each content individually should be within the given WORDLIMIT.
      One last thing is that, the title should be always formatted in bold and not any headings.
    `;
    const userPrompt = `
      TOPIC: ${topic}
      STYLE: ${style}
      OUTPUT LANGUAGE: ${voice}
      WORDLIMIT: ${wordLimit}
    `;

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    // Configuration for the OpenAI API call
    const stream = await openai.chat.completions.create({
      messages,
      stream: true,
      model: 'gpt-4-turbo',
      max_tokens: 3000,
      temperature: 0.9,
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
  } catch (error) {
    console.error('An error occurred:', error);
    return NextResponse.error();
  }
};
