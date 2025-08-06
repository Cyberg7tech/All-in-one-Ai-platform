import OpenAI from 'openai';

const openai = new OpenAI();

export async function openAITTS({ content, voice }: IOpenAITTS) {
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice,
    input: content,
    response_format: 'mp3',
  });

  const stream = await response.body;

  return stream;
}

export interface IOpenAITTS {
  content: string;
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
}
