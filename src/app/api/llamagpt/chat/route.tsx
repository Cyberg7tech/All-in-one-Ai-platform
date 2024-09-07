// This route is used for chat using llama 3.1 from different avaialble services, enabled manually as per the requirement.

import { getUserDetails } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import ReplicateLlama31Chat from './services/replicate';
import GroqLlama31Chat from './services/groq';
import AzureLlama31Chat from './services/azure';

export const runtime = 'edge';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
}

// This variable is used to select which service for llama 3.1 to be used. Just change the value among 'groq' | 'replicate' | 'azure' in the env variable
const SERVIVE_IN_USE = process.env.SERVICE_IN_USE;

export const POST = async (req: Request) => {
  try {
    const user = await getUserDetails();

    // Check if user is logged in
    if (user == null) {
      throw new Error('Please login to create contents.');
    }

    // Parse JSON body from the request to get topic and style
    const { question, history } = await req.json();

    // Validate that both topic and style are provided
    if (!question) {
      throw new Error('Question is required.');
    }

    let response;
    switch (SERVIVE_IN_USE) {
      case 'groq':
        response = await GroqLlama31Chat(question, history);
        break;
      case 'azure':
        response = await AzureLlama31Chat(question, history);
        break;
      default:
        response = await ReplicateLlama31Chat(question, history);
        break;
    }

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
};
