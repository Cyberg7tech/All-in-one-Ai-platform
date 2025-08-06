// Actions for saving user-generated content to the database
// Utilizes the Supabase client tailored for server-side interactions

'use server';

import { getUserDetails, supabaseServerClient } from '@/utils/supabase/server';

// Function to save content creation details to the database
// Inputs: topic, style, and response details of the content
export async function saveContent(
  topic: string,
  style: string,
  wordLimit: string,
  voice: string,
  response: string
) {
  const supabase = supabaseServerClient();

  try {
    const user = await getUserDetails();
    const userId = user?.id;

    // Attempt to insert new content record in the 'content_creations' table
    const { data, error } = await supabase
      .from('content_creations')
      .insert({
        user_id: userId,
        topic,
        style,
        word_limit: wordLimit,
        voice,
        results: response,
      })
      .select()
      .single(); // Ensures that only one record is returned after insertion

    // Throws an error if the insertion fails
    if (error) {
      throw error.message;
    }

    return data;
  } catch (error) {
    return `${error}`;
  }
}
