// This route is used for text to speech audio based on the given text content and selected AI model, voice, and language

import { getUserDetails } from '@/utils/supabase/server';
import { openAITTS } from './models/openai';
import { elevenLabsTTS } from './models/elevenlabs';

export const runtime = 'edge';

export const POST = async (req: Request) => {
  try {
    const user = await getUserDetails();

    // Check if user is logged in
    if (user == null) {
      throw new Error('Please login to generate TTS.');
    }

    // Parse JSON body from the request to get topic and style
    const { content, model, voice } = await req.json();

    // Validate that both topic and style are provided
    if (!content || !model || !voice) {
      throw new Error('Please provide all the required fields.');
    }

    let stream;
    switch (model) {
      case 'elevenlabs': {
        const response = await elevenLabsTTS({ content, voiceId: voice });
        stream = response.body;
        break;
      }
      default: {
        stream = await openAITTS({ content, voice });
      }
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: `${error}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
