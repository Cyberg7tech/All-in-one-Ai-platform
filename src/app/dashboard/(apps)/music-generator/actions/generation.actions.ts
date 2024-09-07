import replicate, { musicGenerationModel } from './replicate';
import { headers } from 'next/headers';

const MODEL_IN_USE = (process.env.MODEL_IN_USE as keyof typeof musicGenerationModel) || 'meta';

// Type definition for the input parameters required for the generation process.
export interface IGenerationInput {
  prompt: string;
  genre: string;
  mood: string;
  duration: number;
}

async function startGeneration(data: IGenerationInput): Promise<string> {
  const { prompt, genre, mood, duration } = data;

  const formattedPrompt = `${genre} | ${mood} | ${prompt}`;

  // Format the input data as per the model in use
  let inputData;
  switch (MODEL_IN_USE) {
    case 'riffusion':
      inputData = {
        prompt_a: formattedPrompt,
        prompt_b: `Most important thing to keep in mind is that the duration of the music is exactly ${duration} seconds.`,
        denoising: 0.75,
        num_inference_steps: 50,
      };
      break;
    default:
      inputData = {
        prompt: formattedPrompt,
        duration: duration,
        continuation: false,
        model_version: 'stereo-large',
        output_format: 'mp3',
        normalization_strategy: 'peak',
      };
      break;
  }

  const origin = headers().get('origin');

  const prediction = await replicate.predictions.create({
    // Model version to use for the generation process.
    version: musicGenerationModel[MODEL_IN_USE],
    // Input parameters (payload) for the generation process.
    input: inputData,
    // Webhook url where Replicate will send updates on the generation status/result.
    webhook: `${origin}/api/music-generator/webhooks/replicate`,
    // Filter for the webhook events to receive updates only for the 'completed' event.
    webhook_events_filter: ['completed'],
  });

  console.log(`Generation started with Prediction Id: ${prediction.id}`);

  return prediction.id;
}

export default startGeneration;
