import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import { supabaseServerClient } from '@/utils/supabase/server';
import HistoryItem from './HistoryItem';
import SidebarUpgradePlan from '../../sidebar/SidebarUpgradePlan';
import DropdownAccount from '../../sidebar/DropdownAccount';

const Sidebar = async () => {
  const supabase = supabaseServerClient();

  const { data } = await supabase
    .from('multillm_chatgpt')
    .select('id, title')
    .order('created_at', { ascending: false });

  return (
    <div className='h-full border border-[#F2F2F2] dark:border-[#272626] rounded-xl p-3 flex flex-col justify-between'>
      <div>
        <div className='mb-6'>
          <Logo />
        </div>

        <Link href='/dashboard/multillm-chatgpt'>
          <Button className='w-full'>
            <FaPlus className='mr-2' /> New Chat
          </Button>
        </Link>

        <div className='h-full space-y-1 overflow-y-scroll mt-4 -mb-2'>
          <div className='flex items-center text-[10px] font-bold ml-[18px] mb-2 tracking-tight rounded-lg text-subtle/60'>
            PREVIOUS 7 DAYS
          </div>

          {data?.length == 0 && (
            <p className='text-sm text-accent-foreground/50 text-center flex justify-center items-center h-[400px]'>
              No History
            </p>
          )}

          <div>{data?.map((history) => <HistoryItem key={history.id} history={history} />)}</div>
        </div>
      </div>

      <div className='space-y-3 '>
        <SidebarUpgradePlan />
        <DropdownAccount />
      </div>
    </div>
  );
};

export default Sidebar;
