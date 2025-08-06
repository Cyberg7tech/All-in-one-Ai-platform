import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function startGeneration(url: string, prompt: string): Promise<string> {
  const output = await replicate.run(
    'zylim0702/qr_code_controlnet:628e604e13cf63d8ec58bd4d238474e8986b054bc5e1326e50995fdbc851c557',
    {
      input: {
        url,
        prompt,
        qr_conditioning_scale: 2,
        num_inference_steps: 30,
        guidance_scale: 5,
        negative_prompt:
          'Longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, blurry',
      },
    }
  );

  if (!output) {
    throw new Error('Failed to generate QR code');
  }

  return (output as string[])[0];
}
