'use server';

import { startGeneration } from './replicate';
import { getUserDetails, supabaseServerClient } from '@/utils/supabase/server';

// This server function handles the generation of images based on user input.
// It validates user login, checks the provided form data, and starts the image generation process.
export async function generateDesignFn(
  prompt: string,
  theme: string,
  roomType: string,
  imagePreview: string
) {
  const supabase = supabaseServerClient();
  const user = await getUserDetails();

  try {
    if (user == null) {
      throw 'Please login to Generate Designs.';
    }

    if (!prompt || !theme || !roomType || !imagePreview) {
      throw 'Please enter all the required fields.';
    }

    // Calls the replicate function to start the generation process with the provided deisgn inputs.
    const predictionId = await startGeneration({
      prompt,
      theme,
      roomType,
      refImage: imagePreview,
    });

    // Store the image details in the database with the prediction id received from Replicate Api.
    const { error } = await supabase.from('interior_designs').insert({
      user_id: user.id,
      prompt,
      theme,
      room_type: roomType,
      ref_image: imagePreview,
      prediction_id: predictionId,
    });

    if (error) {
      throw error.message;
    }

    return { id: predictionId };
  } catch (error) {
    return `${error}`;
  }
}
