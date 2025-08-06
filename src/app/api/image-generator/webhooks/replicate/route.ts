// This server-side function handles webhook callbacks from the Replicate service after an image generation process.
// It updates the database with the results of the image generation.
// This function is called automatically by Replicate when an image generation task completes.

import { supabaseAdmin } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request): Promise<NextResponse> {
  // Parse the JSON payload from the webhook request.
  const prediction = await req.json();

  try {
    console.log(`Generation received for Prediction: ${prediction.id}`);

    let updateData = null;
    if (prediction.status === 'failed') {
      updateData = { error: prediction.error };
    } else {
      // Handle single or multiple outputs.
      const result = typeof prediction.output === 'string' ? [prediction.output] : prediction.output;
      updateData = { image_urls: result };
    }

    // Update the database record with the new data (result or error message)
    await supabaseAdmin.from('image_generations').update(updateData).eq('prediction_id', prediction.id);

    return NextResponse.json({ message: 'Webhook Received.' }, { status: 200 });
  } catch (err: any) {
    console.error(err.message);
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
