import { supabaseAdmin } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

type PromptData = {
  id: number;
  text: string;
  negative_prompt: string;
  steps: null;
  tune_id: number;
  trained_at: string;
  started_training_at: string;
  created_at: string;
  updated_at: string;
  images: string[];
};

export async function POST(req: Request): Promise<NextResponse> {
  const incomingData = (await req.json()) as { prompt: PromptData };

  const { prompt } = incomingData;

  const urlObj = new URL(req.url);
  const user_id = urlObj.searchParams.get('user_id');

  try {
    if (!user_id) {
      throw 'Malformed URL, no user_id detected!';
    }

    const { data: user, error } = await supabaseAdmin.from('users').select().eq('id', user_id).single();

    if (error) {
      throw error.message;
    }
    if (!user) {
      throw 'User not found.';
    }

    console.log(`Images are ready for Generation Id: ${prompt.id}`);

    const { error: updateImageError } = await supabaseAdmin
      .from('headshot_generations')
      .update({
        image_urls: prompt.images,
      })
      .eq('generation_id', prompt.id);

    if (updateImageError) {
      console.error({ updateImageError });
    }

    return NextResponse.json({ message: 'success' }, { status: 200, statusText: 'Success' });
  } catch (err: any) {
    console.error(err.message);
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
