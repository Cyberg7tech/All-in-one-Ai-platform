'use server';

import { startGeneration } from './replicate';
import { getUserDetails, supabaseServerClient } from '@/utils/supabase/server';

// This server function handles the generation of images based on user input.
// It validates user login, checks the provided form data, and starts the image generation process.
export async function generateFn(referenceImage: string, type: string) {
  const supabase = supabaseServerClient();
  const user = await getUserDetails();

  try {
    if (user == null) {
      throw 'Please login to Generate Designs.';
    }
    if (!referenceImage || !type) {
      throw 'Please enter all the required fields.';
    }

    // Calls the replicate function to start the generation process with the provided deisgn inputs.
    const predictionId = await startGeneration(referenceImage, type);

    // Store the image details in the database with the prediction id received from Replicate Api.
    const { error } = await supabase.from('image_enhancer_upscaler').insert({
      user_id: user.id,
      input_image: referenceImage,
      prediction_id: predictionId,
      type,
    });

    if (error) {
      throw error.message;
    }

    return { id: predictionId };
  } catch (error) {
    return `${error}`;
  }
}
