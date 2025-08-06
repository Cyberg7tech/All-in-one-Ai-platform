import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { FaPlus } from 'react-icons/fa';
import HistoryItem from './HistoryItem';
import Link from 'next/link';
import { supabaseServerClient } from '@/utils/supabase/server';
import SidebarUpgradePlan from '../../sidebar/SidebarUpgradePlan';
import DropdownAccount from '../../sidebar/DropdownAccount';

const Sidebar = async () => {
  const supabase = supabaseServerClient();

  const { data } = await supabase
    .from('chat_with_file')
    .select('id, filename')
    .order('created_at', { ascending: false });

  return (
    <div className='h-full border rounded-xl p-3 flex flex-col justify-between'>
      <div>
        <div className='mb-6'>
          <Logo />
        </div>

        <Link href='/dashboard/chat-with-pdf'>
          <Button className='w-full'>
            <FaPlus className='mr-2' /> New Chat
          </Button>
        </Link>

        <div className='h-full space-y-1 overflow-y-auto mt-4 -mb-2'>
          <div className='flex items-center text-[10px] font-bold px-4 mb-2 tracking-tight rounded-lg text-subtle/70'>
            PREVIOUS 7 DAYS
          </div>

          {data?.length == 0 && (
            <p className='text-sm text-accent-foreground/50 text-center mt-40'>No History</p>
          )}

          <div>
            {data?.map((history) => (
              <HistoryItem key={history.id} history={history} />
            ))}
          </div>
        </div>
      </div>

      <div className='space-y-3'>
        <SidebarUpgradePlan />
        <DropdownAccount />
      </div>
    </div>
  );
};

export default Sidebar;
