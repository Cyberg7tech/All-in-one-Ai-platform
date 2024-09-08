import UpgradePlan from '@/components/dashboard/UpgradePlan';
import { DataTable } from '@/components/dashboard/youtube-content-generator/history/HistoryTable';
import { columns } from '@/components/dashboard/youtube-content-generator/history/columns';
import { supabaseServerClient } from '@/utils/supabase/server';
import { errorToast } from '@/utils/utils';

const page = async () => {
  const supabase = supabaseServerClient();

  // Retrieves all content entries from 'youtube_content_generator' table
  // Ordered by creation date, newest first
  const { data, error } = await supabase
    .from('youtube_content_generator')
    .select('*')
    .not('summary', 'eq', null)
    .order('created_at', { ascending: false });

  if (error) {
    errorToast('Something went wrong, please try again');
    return;
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
