'use server';

import { FormFields } from '@/components/dashboard/text-to-speech/generate/FormInput';
import { getUserDetails, supabaseServerClient } from '@/utils/supabase/server';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

const openai = new OpenAI();

export async function saveGeneratedAudio({ audioUrl, formData }: { audioUrl: string; formData: FormFields }) {
  const supabase = supabaseServerClient();

  try {
    const user = await getUserDetails();

    const { content, model, voice } = formData;

    const title = await generateTitle(content);

    const { error } = await supabase.from('text_to_speech').insert({
      audio_url: audioUrl,
      content: content,
      model: model,
      voice: voice,
      title,
      user_id: user?.id,
    });

    if (error) {
      throw error.message;
    }
  } catch (error) {
    return { error: `${error}` };
  }
}

async function generateTitle(content: string) {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: 'Analyse the user content properly and generate a short to the point TITLE for the content.',
    },
    { role: 'user', content },
  ];

  const response = await openai.chat.completions.create({
    messages,
    model: 'gpt-4-turbo',
    max_tokens: 2000,
  });

  const title = response.choices[0].message.content ?? `${content.substring(0, 30)}...`;

  return title;
}
