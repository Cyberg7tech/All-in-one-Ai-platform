import { History } from '@/components/dashboard/text-to-speech/history/History';
import UpgradePlan from '@/components/dashboard/UpgradePlan';
import { supabaseServerClient } from '@/utils/supabase/server';
import { errorToast } from '@/utils/utils';

const page = async () => {
  const supabase = supabaseServerClient();

  const { data, error } = await supabase
    .from('text_to_speech')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    errorToast(error.message);
  }

  return (
    <div className='flex flex-col justify-between items-center h-[calc(100vh-86px)]'>
      <History data={data ?? []} />
      <UpgradePlan />
    </div>
  );
};

export default page;
