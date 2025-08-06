// This function takes the payload and starts the generation process on Replicate.
// It passes the webhook url to Replicate to receive updates on the generation status/result.

import Replicate from 'replicate';
import { headers } from 'next/headers';

// Initialize Replicate with the API token.
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function startGeneration(inputs: TypeGenerationInput): Promise<string> {
  const { modelVersion, prompt, negativePrompt, guidance, inference, noOfOutputs } = inputs;

  const origin = headers().get('origin');

  const prediction = await replicate.predictions.create({
    version: modelVersion,
    // Input parameters (payload) for the generation process.
    input: {
      width: 1024,
      height: 1024,
      prompt,
      negative_prompt: negativePrompt ?? '',
      guidance_scale: guidance ?? 7.5,
      num_inference_steps: inference ?? 50,
      num_outputs: noOfOutputs ?? 1,
      apply_watermark: false,
    },
    webhook: `${origin}/api/image-generator/webhooks/replicate`, // Webhook URL to receive updates on generation response.
    webhook_events_filter: ['completed'], // Filter to receive only completed events.
  });

  console.log(`Generation started with Prediction Id: ${prediction.id}`);

  return prediction.id;
}

// Type definition for the input parameters required for the generation process.
export type TypeGenerationInput = {
  modelVersion: string;
  prompt: string;
  negativePrompt: string;
  guidance?: number;
  inference?: number;
  noOfOutputs?: number;
};
