import UpgradePlan from '@/components/dashboard/UpgradePlan';
import { DataTable } from '@/components/dashboard/chat-with-youtube/history/HistoryTable';
import { columns } from '@/components/dashboard/chat-with-youtube/history/columns';
import { supabaseServerClient } from '@/utils/supabase/server';
import { errorToast } from '@/utils/utils';

const page = async () => {
  const supabase = supabaseServerClient();

  // Retrieves all entries from 'chat_with_youtube' table

  const { data, error } = await supabase
    .from('chat_with_youtube')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    errorToast('Something went wrong, please try again');
  }

  return (
    <div className='flex flex-col justify-between items-center h-[calc(100vh-86px)]'>
      <div className='w-full'>
        <DataTable columns={columns} data={data ?? []} />
      </div>
      <UpgradePlan />
    </div>
  );
};

export default page;
