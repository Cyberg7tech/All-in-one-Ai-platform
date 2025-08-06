// Serverless Function that receives a POST request from the Replicate when the design generation is completed.
// Replicate sends the POST request with image URLs or error message and the prediction id.

import { supabaseAdmin } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request): Promise<NextResponse> {
  const prediction = await req.json();

  try {
    console.log(`Generation received for Prediction: ${prediction.id}`);

    let updateData = null;
    // Format data to update in the database based on the prediction status.
    if (prediction.status === 'failed') {
      updateData = { error: prediction.error };
    } else {
      const result = typeof prediction.output === 'string' ? [prediction.output] : prediction.output;
      updateData = { output_image: result[0] };
    }

    // Update the database with the generated image URLs or error message by the prediction id.
    await supabaseAdmin.from('image_enhancer_upscaler').update(updateData).eq('prediction_id', prediction.id);

    return NextResponse.json({ message: 'Webhook Received.' }, { status: 200 });
  } catch (err: any) {
    console.error(err.message);
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
