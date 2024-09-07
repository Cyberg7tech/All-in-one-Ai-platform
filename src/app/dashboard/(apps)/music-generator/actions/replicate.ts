// This function takes the payload and starts the generation process on Replicate.
// It passes the webhook url to Replicate to receive updates on the generation status/result.

import Replicate from 'replicate';

// Initialize Replicate with the API token.
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// You can visit the model's URL on Replicate from the URL below and play around with the model:
// 1. https://replicate.com/meta/musicgen
// 2. https://replicate.com/riffusion/riffusion
export const musicGenerationModel = {
  meta: '671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb',
  riffusion: '8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05',
};

export default replicate;
