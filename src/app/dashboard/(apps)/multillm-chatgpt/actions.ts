// This server actions functions are used to create and update chat with in the database.

'use server';

import { Json } from '@/types/supabase';
import { TypeSaveChat } from '@/types/types';
import { getUserDetails, supabaseServerClient } from '@/utils/supabase/server';
import OpenAI from 'openai';

export async function saveChat(chat: TypeSaveChat) {
  const supabase = supabaseServerClient();
  const user = await getUserDetails();

  let chatData,
    chatError = null;

  if (chat.id) {
    const { data, error } = await supabase
      .from('multillm_chatgpt')
      .update({ chat_history: chat.chat_history, model: chat.model })
      .eq('id', chat.id)
      .select('id')
      .single();

    chatData = data;
    chatError = error;
  } else {
    const content = (chat.chat_history as Json[])?.[0];
    chat.title = await getChatTitle(JSON.stringify(content));

    const { data, error } = await supabase
      .from('multillm_chatgpt')
      .insert({ ...chat, user_id: user?.id })
      .select('id')
      .single();

    chatData = data;
    chatError = error;
  }

  if (chatError) {
    console.log(chatError);
    return chatError.message;
  }

  return chatData;
}

async function getChatTitle(content: string) {
  const openai = new OpenAI();

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert content writer. You are writing a title for a the content provided to you. The blog post is about a topic that you are familiar with. The title should be short & crisp, catchy and engaging.',
      },
      {
        role: 'user',
        content,
      },
    ],
  });

  return response.choices[0]?.message?.content;
}
