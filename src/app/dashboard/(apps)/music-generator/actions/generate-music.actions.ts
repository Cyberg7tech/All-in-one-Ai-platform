'use server';

import { getUserDetails, supabaseServerClient } from '@/utils/supabase/server';
import startGeneration, { IGenerationInput } from './generation.actions';

// This server function handles the music generation based on user input.
// It validates user login, checks the provided form data, and starts the music generation process.
export async function generateMusicFn(data: IGenerationInput) {
  const supabase = supabaseServerClient();

  try {
    const user = await getUserDetails();
    if (user == null) {
      throw 'Please login to Generate Music.';
    }

    // Calls the replicate function to start the generation process with the provided deisgn inputs.
    const predictionId = await startGeneration(data);

    // Store the music details in the database with the prediction id received from Replicate Api.
    const { error } = await supabase.from('music_generations').insert({
      ...data,
      user_id: user.id,
      prediction_id: predictionId,
    });

    if (error) {
      throw error.message;
    }

    return { id: predictionId };
  } catch (error) {
    return { error: `${error}` };
  }
}
