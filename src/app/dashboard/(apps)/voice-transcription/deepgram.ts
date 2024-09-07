// This function initiates the transcription process using Deepgram.
// It sends the response as a POST request to the webhook URL. The response is then stored

import { CallbackUrl, createClient } from '@deepgram/sdk';
import { headers } from 'next/headers';

export async function startTranscription(audioUrl: string) {
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
  try {
    // Creating the webhook URL where the transcription response will be sent from Deepgram.
    const origin = headers().get('origin');
    const callbackUrl = new CallbackUrl(`${origin}/api/webhooks/deepgram`);

    const { result, error } = await deepgram.listen.prerecorded.transcribeUrlCallback(
      { url: audioUrl }, // Audio URL to be transcribed.
      callbackUrl,
      {
        detect_language: true, // Detect the language of the audio.
        callback_method: 'post', // The method used to send the response to the webhook URL.
      }
    );

    if (error) {
      throw error;
    }

    return result.request_id;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
