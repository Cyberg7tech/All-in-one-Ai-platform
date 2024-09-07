// Serverless Function that receives a POST request from the Replicate when the music generation is completed.
// Replicate sends the POST request with music URL or error message and the prediction id.

import { supabaseAdmin } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
import { upload } from '../../storage';

export async function POST(req: Request): Promise<NextResponse> {
  const prediction = await req.json();

  try {
    console.log(`Generation received for Prediction: ${prediction.id}`);

    let updateData = null;
    // Format data to update in the database based on the prediction status.
    if (prediction.status === 'failed') {
      updateData = {
        error: prediction.error,
      };
    } else {
      // Get audio blob from audio url
      const responseUrl = prediction.output.audio ?? prediction.output;
      const response = await fetch(responseUrl);
      const buffer = await response.arrayBuffer();
      const blob = new Blob([buffer], { type: 'audio/mpeg' });

      // Upload audio to supabase storage
      const { url: audioUrl } = await upload(blob);
      updateData = { music_url: audioUrl };
    }

    // Update the database with the generated music URL or error message by the prediction id.
    await supabaseAdmin.from('music_generations').update(updateData).eq('prediction_id', prediction.id);

    return NextResponse.json({ message: 'Webhook Received.' }, { status: 200 });
  } catch (err: any) {
    console.error(err.message);
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
