// Server-side function to submit user-provided images for model finetuning.
// It requires user authentication and checks for necessary form fields before sending the data.
// The function constructs a FormData object for a POST request to the AI service's API, handling the response and database interactions.
// Errors are caught and returned, allowing for client-side handling.

'use server';

import { getUserDetails, supabaseServerClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import axios from 'axios';

const ASTRIA_BASEURL = 'https://api.astria.ai';
const API_KEY = process.env.ASTRIA_API_KEY;

// This function is used for model finetuning based on user-provided images.
export async function finetuneModelFn(request: FormData) {
  const supabase = supabaseServerClient();
  const user = await getUserDetails();

  const origin = headers().get('origin');

  try {
    if (user == null) {
      throw 'Please login to Generate a Headshot.';
    }

    const title = request.get('title') as string;
    const type = request.get('type') as string;
    const images = request.getAll('images');

    if (!title || !type) {
      throw 'Missing required fields.';
    }

    const formData = new FormData();
    formData.append('tune[title]', title);
    // Hard coded tune id of Realistic Vision v5.1 from - https://www.astria.ai/gallery/tunes/690204/prompts
    formData.append('tune[base_tune_id]', '690204');
    formData.append('tune[name]', type);

    // Appending images to the FormData object
    images.forEach((file) => {
      formData.append('tune[images][]', file);
    });

    // Creating webhook URL for the Astria Api to send a POST request after the model training is complete
    const webhookUrl = `${origin}/api/headshot-generator/webhooks/train-model?user_id=${user.id}`;
    formData.append('tune[callback]', webhookUrl);

    // Making a POST request to the Astria API to train the model with the provided images
    const response = await axios.post(`${ASTRIA_BASEURL}/tunes`, formData, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const { status, data: tune } = response;

    if (status === 400) {
      throw 'webhookUrl must be a URL address';
    }
    if (status === 402) {
      throw 'Training models is only available on paid plans.';
    }

    // Store the model id from the api response in the database with original images and user details
    const { error } = await supabase.from('headshot_models').insert({
      model_id: tune.id,
      user_id: user.id,
      name: title,
      type,
      images: tune.orig_images,
      eta: tune.eta,
    });

    if (error) {
      throw error.message;
    }
  } catch (error) {
    console.error(error);
    return `${error}`;
  }
}
