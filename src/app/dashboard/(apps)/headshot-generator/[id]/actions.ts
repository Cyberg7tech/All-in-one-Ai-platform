// This server-side function manages the submission of user inputs for AI-generated headshots.
// It requires user authentication and checks for necessary form fields before sending the data.
// FormData is used to append user prompts and configure the request, which is then sent to an external API.

'use server';

import { getUserDetails, supabaseServerClient } from '@/utils/supabase/server';
import axios from 'axios';
import { headers } from 'next/headers';

const ASTRIA_BASEURL = 'https://api.astria.ai';
const API_KEY = process.env.ASTRIA_API_KEY;

// This function is used to train images based on the fine tuned model and user prompts.
export async function generateHeadshotFn(modelId: string, formData: FormData) {
  const supabase = supabaseServerClient();
  const user = await getUserDetails();

  const origin = headers().get('origin');

  try {
    if (user == null) {
      throw 'Please login to Generate Images.';
    }

    const prompt = formData.get('prompt') as string;
    const negativePrompt = formData.get('neg-prompt') as string;

    // Check if the prompt is empty. If it is, throw an error.
    if (!prompt) {
      throw 'Image Description is required';
    }

    const form = new FormData();
    form.append('prompt[text]', prompt);
    form.append('prompt[negative_prompt]', negativePrompt);
    form.append('prompt[super_resolution]', 'true');
    form.append('prompt[face_correct]', 'true');

    // Creating webhook URL for the Astria Api to send a POST request after the image generation is complete
    const webhookUrl = `${origin}/api/headshot-generator/webhooks/generate-images?user_id=${user.id}`;
    form.append('prompt[callback]', webhookUrl);

    // Making a POST request to the Astria API to generate images based on the user prompts and trained model
    const { data: generation } = await axios.post(`${ASTRIA_BASEURL}/tunes/${modelId}/prompts`, form, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    // Update the database with the input data like user id, prompt, negative prompt, model id, and generation id
    const { data, error } = await supabase
      .from('headshot_generations')
      .insert({
        user_id: user.id,
        prompt,
        negative_prompt: negativePrompt,
        model_id: modelId,
        generation_id: generation.id,
      })
      .select('id')
      .single();

    if (error) {
      throw error.message;
    }

    return { id: data.id };
  } catch (error: any) {
    let errorMessage = `${error}`;
    if (error.response?.status === 422) {
      errorMessage = error.response?.data?.text?.join(', ');
    }
    return errorMessage;
  }
}
