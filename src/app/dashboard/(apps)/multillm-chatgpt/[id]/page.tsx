import ChatBoard from '@/components/dashboard/multillm-chatgpt/Chat';
import { getUserDetails, supabaseServerClient } from '@/utils/supabase/server';

export default async function Generate({ params }: { params: { id: string } }) {
  const supabase = supabaseServerClient();
  const user = await getUserDetails();

  const { data, error } = await supabase
    .from('multillm_chatgpt')
    .select()
    .eq('id', params.id)
    .not('chat_history', 'is', null)
    .single();

  if (error) {
    return <div className='text-gray-400'>Chat Not Found!</div>;
  }

  return (
    <>
      <ChatBoard userName={user ? user.user_metadata.full_name : 'User'} chat={data} />
    </>
  );
}
