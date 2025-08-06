// This server actions functions are used to create and update chat with in the database.

'use server';

import { TypeUpdateChat } from '@/types/types';
import { getUserDetails, supabaseServerClient } from '@/utils/supabase/server';

// Save new chat with file
export async function createNewChat({ uploadedFilePath, fileName }: TypeRequestFile) {
  const supabase = supabaseServerClient();

  const user = await getUserDetails();

  const { data, error } = await supabase
    .from('chat_with_file')
    .insert({
      user_id: user?.id,
      file: uploadedFilePath,
      filename: fileName,
    })
    .select('id')
    .single();

  if (error) {
    return error.message;
  }

  return data;
}

// Update chat with
export async function updateChat(data: TypeUpdateChat) {
  const supabase = supabaseServerClient();

  const { id, chat_history, history_metadata } = data;

  const { data: chat, error } = await supabase
    .from('chat_with_file')
    .update({ chat_history, history_metadata })
    .eq('id', id!)
    .select('id, chat_history')
    .single();

  if (error) {
    console.log(error);
    return error.message;
  }

  return chat;
}

export type TypeRequestFile = {
  uploadedFilePath: string;
  fileName: string;
};
