import { getUserDetails } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

const openai = new OpenAI();

export async function POST(request: Request) {
  try {
    const user = await getUserDetails();

    if (user == null) {
      throw new Error('Please login to create contents.');
    }

    const { subTitle } = await request.json();

    if (!subTitle) {
      throw new Error('SubTitle is required.');
    }

    const prompt = `You are an expert writer skilled in summarizing complex topics. Your task is to create a summary for the video "${subTitle}". Please use simple language and restructure the content for clarity. The summary should be in English. Feel free to add new lines where appropriate. Make sure summury short and easy to understand. summury should be in plain text`;

    const stream = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4-turbo',
      max_tokens: 2000,
      temperature: 0.9,
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
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
