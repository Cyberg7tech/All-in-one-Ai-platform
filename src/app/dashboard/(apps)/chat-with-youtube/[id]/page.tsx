import Chat from '@/components/dashboard/chat-with-youtube/chat/Chat';
import Summary from '@/components/dashboard/chat-with-youtube/chat/Summary';
import { getUserDetails, supabaseServerClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

const Page = async ({ params }: { params: { id: string } }) => {
  const user = await getUserDetails();
  const supabase = supabaseServerClient();

  const { data } = await supabase.from('chat_with_youtube').select().eq('id', params.id).single();

  if (data === null) {
    redirect('/dashboard/chat-with-youtube');
  }

  return (
    <div className='lg:h-[calc(100vh-86px)] flex flex-col-reverse lg:flex-row gap-3'>
      <div className='size-full p-4 border rounded-md mb-4 md:mb-0 overflow-auto'>
        <Summary data={data} />
      </div>

      <div className='w-full border rounded-md'>
        <Chat userName={user ? user.user_metadata.full_name : 'User'} chat={data} />
      </div>
    </div>
  );
};

export default Page;
