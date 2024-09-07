// This function handles the server-side logic to generate an image based on user inputs.
// It is invoked when the user submits the form in the FormInput component.
// The function checks user authentication, validates inputs, and interacts with external APIs for image generation.

'use server';

import { startGeneration } from './replicate';
import { getUserDetails, supabaseServerClient } from '@/utils/supabase/server';

export async function generateImageFn(formData: FormData) {
  const supabase = supabaseServerClient();
  const user = await getUserDetails();

  try {
    // Ensure the user is logged in before proceeding.
    if (user == null) {
      throw 'Please login to Generate Images.';
    }

    // Extract and validate form data.
    const model = formData.get('model') as string;
    const prompt = formData.get('prompt') as string;
    const negativePrompt = formData.get('neg-prompt') as string;
    const noOfOutputs = formData.get('no-of-outputs') as string;
    const guidance = formData.get('guidance') as string;
    const inference = formData.get('inference') as string;

    // Validate that the prompt is not empty.
    if (!prompt) {
      throw 'Please enter prompt for the image.';
    }

    // Convert form inputs to appropriate data types.
    const formattedNoOfOutputs = Number(noOfOutputs) ?? 1;
    const formattedGuidance = Number(guidance) ?? 7.5;
    const formattedInference = Number(inference) ?? 50;

    // Call the Replicate API to start the image generation process.
    const predictionId = await startGeneration({
      modelVersion: model,
      prompt,
      negativePrompt,
      noOfOutputs: formattedNoOfOutputs,
      guidance: formattedGuidance,
      inference: formattedInference,
    });

    // Insert the new generation details into the database.
    const { error } = await supabase.from('image_generations').insert({
      user_id: user.id,
      model,
      prompt,
      negative_prompt: negativePrompt,
      no_of_outputs: formattedNoOfOutputs.toString(),
      guidance: formattedGuidance.toString(),
      inference: formattedInference.toString(),
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
