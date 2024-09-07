'use server';

import { startGeneration } from './replicate';
import { getUserDetails, supabaseServerClient } from '@/utils/supabase/server';

// This function expects formData with 'url' and 'prompt' fields and generates a QR code if the user is authenticated.
// It utilizes getUserDetails and supabaseServerClient from '@/utils/supabase/server' for user session and database management.
export async function generateQrCodeFn(formData: FormData) {
  const supabase = supabaseServerClient();
  const user = await getUserDetails();

  try {
    if (user == null) {
      throw 'Please login to Generate Qr Code.';
    }

    const url = formData.get('url') as string;
    const prompt = formData.get('prompt') as string;

    if (!prompt || !url) {
      throw 'Missing required fields.';
    }

    const imageUrl = await startGeneration(url, prompt);

    const { data, error } = await supabase
      .from('qr_code_generations')
      .insert({
        user_id: user?.id,
        url,
        prompt,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) {
      throw error.message;
    }

    return data;
  } catch (error) {
    return `${error}`;
  }
}
