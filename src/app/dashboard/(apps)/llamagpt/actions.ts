// This server actions functions are used to create and update chat with in the database.

'use server';

import azure from '@/app/api/llamagpt/models/azure';
import { Json } from '@/types/supabase';
import { TypeSaveLlamaChat } from '@/types/types';
import groq, { groqLlamaModel } from '@/app/api/llamagpt/models/groq';
import { generateTitlePrompt } from '@/app/api/llamagpt/prompt';
import replicate, { replicateLlamaModel } from '@/app/api/llamagpt/models/replicate';
import { getUserDetails, supabaseServerClient } from '@/utils/supabase/server';

export async function saveChat(chat: TypeSaveLlamaChat) {
  const supabase = supabaseServerClient();

  try {
    const user = await getUserDetails();

    let chatData;

    if (chat.id) {
      const { data, error } = await supabase
        .from('llamagpt')
        .update({ chat_history: chat.chat_history })
        .eq('id', chat.id)
        .select('id')
        .single();

      if (error) {
        throw error;
      }
      chatData = data;
    } else {
      const content = (chat.chat_history as Json[])?.[0];
      chat.title = await getChatTitle(JSON.stringify(content));

      const { data, error } = await supabase
        .from('llamagpt')
        .insert({ ...chat, user_id: user?.id })
        .select('id')
        .single();

      if (error) {
        throw error;
      }
      chatData = data;
    }

    return { data: chatData };
  } catch (error) {
    console.log(error);
    return { error: `${error}` };
  }
}

async function getChatTitle(content: string) {
  // This variable is used to select which service for llama 3.1 to be used. Just change the value among 'groq' | 'replicate' | 'azure' in the env variable
  const SERVIVE_IN_USE = process.env.SERVICE_IN_USE;

  let title;
  switch (SERVIVE_IN_USE) {
    case 'groq': {
      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: generateTitlePrompt },
          { role: 'user', content },
        ],
        model: groqLlamaModel,
      });
      title = response.choices[0]?.message?.content || '';
      break;
    }
    case 'azure': {
      const response = await azure.path('/chat/completions').post({
        body: {
          messages: [
            { role: 'system', content: generateTitlePrompt },
            { role: 'user', content },
          ],
        },
      });
      if (response.body && 'choices' in response.body && response.body.choices.length > 0) {
        title = response.body.choices[0].message.content;
      }
      break;
    }
    default: {
      const response = await replicate.run(replicateLlamaModel, {
        input: { prompt: `${generateTitlePrompt}. CONTENT: ${content}` },
      });
      title = (response as string[]).join('');
      break;
    }
  }

  return title ? title.replace(/"/g, '') : `${content.substring(0, 30)}...`;
}
