// This route is used for for chat using with different available ai models

import { getUserDetails } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import OpenAIChat from './model/openai';
import { ChatModel } from 'openai/resources/index.mjs';
import ClaudeChat from './model/claude';
import Llama2Chat from './model/llama2';
import MistralChat from './model/mistral';
import GeminiChat from './model/gemini';
import GroqChat from './model/groq';

export const runtime = 'edge';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const POST = async (req: Request) => {
  try {
    const user = await getUserDetails();

    // Check if user is logged in
    if (user == null) {
      throw new Error('Please login to create contents.');
    }

    // Parse JSON body from the request to get topic and style
    const { model, question, history } = await req.json();

    // Validate that both topic and style are provided
    if (!question) {
      throw new Error('Question is required.');
    }

    let response;
    switch (model) {
      case 'claude': {
        response = await ClaudeChat(question, history);
        break;
      }
      case 'gemini': {
        response = await GeminiChat(question, history);
        break;
      }
      case 'groq': {
        response = await GroqChat(question, history);
        break;
      }
      case 'mistral': {
        response = await MistralChat(question, history);
        break;
      }
      case 'llama-2': {
        response = await Llama2Chat(question, history);
        break;
      }
      default: {
        let chatModel = model as ChatModel;
        if (model === 'gpt-35') {
          chatModel = 'gpt-3.5-turbo-16k';
        }
        response = await OpenAIChat(chatModel, question, history);
      }
    }

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
};
