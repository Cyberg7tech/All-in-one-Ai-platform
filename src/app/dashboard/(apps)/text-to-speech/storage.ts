// This function handles the uploading of file files to Supabase storage from the client side.
// It is done through client side securely to overcome 4.5 mb file transfer limit by vercel over the network.

import { supabaseBrowserClient } from '@/utils/supabase/client';

// Before starting up, do the following;
// 1. Create a bucket in the supabase storage
// 2. Assign policies to the bucket (permissions: read, write)
// 3. For policies: click on ne policy, add custom policy, select a name for the policy, select SELECT & INSERT operation, and save

const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_NAME || '';

// Upload the file to the Supabase storage bucket.
export async function upload(file: File | Blob): Promise<{ url: string }> {
  // Using browserclient to upload file from client side securely.
  const supabase = supabaseBrowserClient();

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
  const supabase = supabaseBrowserClient();

  const { data } = await supabase.storage.from(bucketName).getPublicUrl(filepath);

  if (!data) {
    throw new Error('File not found');
  }

  return { publicUrl: data.publicUrl };
}
