import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FaBars } from 'react-icons/fa6';
import Logo from '@/components/Logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FaPlus } from 'react-icons/fa';
import { supabaseServerClient } from '@/utils/supabase/server';
import MobileSidebarItem from './MobileHistoryItem';
import SidebarUpgradePlan from '../../sidebar/SidebarUpgradePlan';
import DropdownAccount from '../../sidebar/DropdownAccount';

const MobileSidebar = async () => {
  const supabase = supabaseServerClient();

  const { data } = await supabase
    .from('chat_with_file')
    .select('id, filename')
    .order('created_at', { ascending: false });

  return (
    <Sheet>
      <SheetTrigger className='flex items-center pr-4 hover:opacity-75 transition'>
        <FaBars />
      </SheetTrigger>
      <SheetContent side='left' className='p-5 pt-8'>
        <div className='h-full flex flex-col justify-between'>
          <div>
            <div className='mb-6'>
              <Logo />
            </div>

            <Link href='/chat'>
              <Button size='lg' className='w-full'>
                <FaPlus className='mr-2' /> New Chat
              </Button>
            </Link>

            <div className='h-[380px] space-y-1 overflow-y-auto mt-4'>
              <div className='flex items-center text-[10px] font-bold px-4 mb-2 tracking-tight rounded-lg text-subtle/70'>
                PREVIOUS 7 DAYS
              </div>

              <div className='space-y-1'>
                {data?.length == 0 && (
                  <p className='text-sm text-accent-foreground/50 text-center mt-40'>No History</p>
                )}

                <div>{data?.map((history) => <MobileSidebarItem key={history.id} history={history} />)}</div>
              </div>
            </div>
          </div>

          <div className='space-y-3 mb-3'>
            <SidebarUpgradePlan />
            <DropdownAccount />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
