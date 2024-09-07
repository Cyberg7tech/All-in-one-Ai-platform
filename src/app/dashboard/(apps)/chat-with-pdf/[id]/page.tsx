import Chat from '@/components/dashboard/chat-with-pdf/Chat';
import { Button } from '@/components/ui/button';
import { getUserDetails, supabaseServerClient } from '@/utils/supabase/server';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { getPublicUrl } from '../actions/storage';

export default async function GenerateImage({ params }: { params: { id: string } }) {
  const user = await getUserDetails();
  const supabase = supabaseServerClient();

  const { data } = await supabase.from('chat_with_file').select().eq('id', params.id).single();

  if (data == null) {
    return (
      <div className='max-w-6xl mx-auto flex flex-col items-center gap-10 pt-10'>
        <p className='text-2xl text-center mt-10'>Chat not found!</p>
        <Link href='/chat'>
          <Button variant='link' className='mx-auto'>
            Start New Chat <ArrowRightIcon className='ml-2' />
          </Button>
        </Link>
      </div>
    );
  }

  const fileUrl = await getPublicUrl(data.file);

  return (
    <div className='md:h-[calc(100vh-102px)] flex flex-col-reverse md:flex-row gap-3'>
      <div className='w-full h-[500px] md:h-auto bg-secondary/30 border border-muted-foreground/20 rounded-md overflow-hidden mb-4 md:mb-0'>
        {fileUrl != null ? (
          <object type='application/pdf' data={fileUrl.url} className='size-full' />
        ) : (
          <div className='h-full flex items-center justify-center'>
            <p className='text-sm text-center text-muted-foreground'>Can not retrieve the file.</p>
          </div>
        )}
      </div>

      <div className='w-full bg-secondary/30 border border-muted-foreground/20 rounded-md'>
        <Chat chat={data} userName={user ? user.user_metadata.full_name : 'User'} />
      </div>
    </div>
  );
}
