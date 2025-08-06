import { supabaseServerClient } from '@/utils/supabase/server';

const bucketName = process.env.SUPABASE_STORAGE_BUCKET_NAME || '';

// Upload the file to the Supabase storage bucket.
export async function upload(file: File | Blob): Promise<{ url: string }> {
  // Using browserclient to upload file from client side securely.
  const supabase = supabaseServerClient();

  if (file == null) {
    throw new Error('File does not exist.');
  }

  // Create a unique key for the file file.
  const path = `${Date.now()}.mp3`;

  // Upload the file file to the Supabase storage bucket.
  const { error } = await supabase.storage.from(bucketName).upload(path, file, {
    contentType: 'audio/mpeg',
  });

  if (error) {
    throw new Error(error.message);
  }

  const { publicUrl } = await getPublicUrl(path);
  return { url: publicUrl };
}

// Get the public URL of the file from the Supabase storage using the filepath.
export async function getPublicUrl(filepath: string): Promise<{ publicUrl: string }> {
  const supabase = supabaseServerClient();

  const { data } = await supabase.storage.from(bucketName).getPublicUrl(filepath);

  if (!data) {
    throw new Error('File not found');
  }

  return { publicUrl: data.publicUrl };
}
