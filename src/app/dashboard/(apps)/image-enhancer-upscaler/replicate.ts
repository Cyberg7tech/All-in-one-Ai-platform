// This function takes the payload and starts the generation process on Replicate.
// It passes the webhook url to Replicate to receive updates on the generation status/result.

import Replicate from 'replicate';
import { headers } from 'next/headers';

// Initialize Replicate with the API token.
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Model version to use for the generation process. You can visit the model's URL on Replicate from the URL below and play around with the model.
const version = {
  enhance: 'f11a4727f8f995d2795079196ebda1bcbc641938e032154f46488fc3e760eb79', // https://replicate.com/philz1337x/clarity-upscaler/versions
  upscale: '4af11083a13ebb9bf97a88d7906ef21cf79d1f2e5fa9d87b70739ce6b8113d29', // https://replicate.com/batouresearch/high-resolution-controlnet-tile
};

export async function startGeneration(inputImage: string, type: string): Promise<string> {
  const enhanceImage = type === 'enhance';
  const prompt = enhanceImage
    ? 'UHD 4k, high quality, detailed, realistic, cinematic, award-winning, ultra-realistic, ultra-detailed, photo from Pinterest, interior'
    : 'UHD 4k, high quality, detailed, realistic, cinematic, award-winning, ultra-realistic, ultra-detailed, photo from Pinterest, interior';

  const origin = headers().get('origin');

  const prediction = await replicate.predictions.create({
    version: version[type as keyof typeof version],
    // Input parameters (payload) for the generation process.
    input: {
      image: inputImage,
      prompt,
      a_prompt:
        'best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning',
      n_prompt:
        'longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality',
    },
    // Webhook url where Replicate will send updates on the generation status/result.
    webhook: `${origin}/api/image-enhancer-upscaler/webhooks/replicate`,
    // Filter for the webhook events to receive updates only for the 'completed' event.
    webhook_events_filter: ['completed'],
  });

  console.log(`Generation started with Prediction Id: ${prediction.id}`);

  return prediction.id;
}
