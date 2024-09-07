'use server';

import { getUserDetails, supabaseServerClient } from '@/utils/supabase/server';
import { startTranscription } from './deepgram';

const bucketName = process.env.SUPABASE_STORAGE_BUCKET_NAME!;

// This function handles the uploading of audio files to Supabase storage.
// It requires a 'FormData' object with an audio file and performs user authentication.
export async function uploadAudioFile(formData: FormData) {
  const supabase = supabaseServerClient();

  const audio = formData.get('audio') as File;

  try {
    if (audio == null) {
      throw 'Audio does not exist.';
    }

    const user = await getUserDetails();
    if (user == null) {
      throw 'Please login to get Voice Transcription & Summary.';
    }

    // Create a unique key for the audio file.
    const key = `${Date.now()}-${audio.name}`;

    // Upload the audio file to the Supabase storage bucket.
    const { error } = await supabase.storage.from(bucketName).upload(key, audio);
    if (error) {
      throw error.message;
    }

    // Get the public URL of the uploaded audio file.
    const { data } = await supabase.storage.from(bucketName).getPublicUrl(key);
    return data?.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

// It initiates a transcription process using Deepgram.
// Requires an audio URL and performs user authentication before starting the transcription.
// Results are stored in the 'voice_transcriptions' table in Supabase.
export async function generateTranscriptionFn(audioUrl: string) {
  const supabase = supabaseServerClient();

  try {
    const user = await getUserDetails();
    if (user == null) {
      throw 'Please login to get Voice Transcription & Summary.';
    }

    // Start the transcription process using Deepgram.
    const transcriptionId = await startTranscription(audioUrl);

    await supabase.from('voice_transcriptions').insert({
      user_id: user.id,
      audio_url: audioUrl,
      transcription_id: transcriptionId,
    });

    return { id: transcriptionId };
  } catch (error) {
    return `${error}`;
  }
}

// This function saves a text summary to the corresponding transcription record in Supabase.
// It updates the 'voice_transcriptions' table with the provided summary and Transcription ID.
// Handles potential errors during the update process.
export async function saveSummary(summary: string, transcriptionId: string) {
  const supabase = supabaseServerClient();

  try {
    const { data, error } = await supabase
      .from('voice_transcriptions')
      .update({ summary })
      .eq('transcription_id', transcriptionId);

    if (error) {
      throw error.message;
    }

    return data;
  } catch (error) {
    return `${error}`;
  }
}
