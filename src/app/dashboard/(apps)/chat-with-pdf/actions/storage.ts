// Supabase storage actions for uploading and downloading files.

'use server';

import { customAlphabet, urlAlphabet } from 'nanoid';
import { supabaseServerClient } from '@/utils/supabase/server';

const bucketName = process.env.SUPABASE_STORAGE_BUCKET_NAME || '';

// Create a unique ID for the file name
const nanoid = customAlphabet(urlAlphabet, 20);

// Upload file to supabase storage
export async function uploadFile(formData: FormData) {
  const supabase = supabaseServerClient();

  const file = formData.get('file');

  try {
    if (file == null) {
      throw 'File does not exist.';
    }

    const uniqueID = nanoid().toLowerCase();
    const fileName = `${uniqueID}.pdf`;

    const { error } = await supabase.storage.from(bucketName).upload(fileName, file);

    if (error) {
      throw error.message;
    }

    return { fileName };
  } catch (error) {
    console.error('Error uploading file:', error);
    return `${error}`;
  }
}

// Download the file from supabase storage using fileName
export async function downloadFile(fileName: string) {
  const supabase = supabaseServerClient();

  try {
    const { data: file, error: error } = await supabase.storage.from(bucketName).download(fileName);

    if (file == null || error) {
      throw error.message ?? `File not found for file name: ${fileName}`;
    }

    return file;
  } catch (error) {
    console.error('Error downloading file.', error);
    return `${error}`;
  }
}

export async function getPublicUrl(fileName: string) {
  const supabase = supabaseServerClient();

  try {
    const { data, error: error } = await supabase.storage.from(bucketName).createSignedUrl(fileName, 10 * 60);

    if (!data || error) {
      throw error.message ?? `File not found for file name: ${fileName}`;
    }

    return { url: data.signedUrl };
  } catch (error) {
    console.error('Error getting public url.', error);
    return null;
  }
}
