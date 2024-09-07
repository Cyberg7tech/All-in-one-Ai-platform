import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

// This POST function handles incoming transcription results from an external service.
// It updates the transcription details in Supabase and logs any errors.
// Errors and successful updates respond with respective JSON messages.
export async function POST(req: Request) {
  try {
    const response = await req.json();

    if (response.err_code) {
      await updateTranscripton({ error: response.err_msg }, response.request_id);
      throw response.err_msg;
    }

    // Retrieve the transcription and transcription ID from the response.
    const transcription = response.results.channels[0].alternatives[0].transcript;
    const transcriptionId = response.metadata.request_id;

    if (!transcription || !transcriptionId) {
      return NextResponse.json({ message: 'failed', error: 'Transcription or Transcription ID not found' });
    }

    console.log(`Generation received for transcription: ${transcriptionId}`);

    await updateTranscripton({ transcription }, transcriptionId);

    return NextResponse.json({ message: 'success' });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'failed', error });
  }
}

// Helper function: Updates the transcription response or error message in the 'voice_transcriptions' table.
// It is used internally by the POST function to handle data updates based on transcription ID.
async function updateTranscripton(data: any, transcriptionId: string) {
  await supabaseAdmin.from('voice_transcriptions').update(data).eq('transcription_id', transcriptionId);
}
