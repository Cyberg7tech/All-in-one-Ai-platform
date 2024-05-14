import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { FaPlus } from 'react-icons/fa';
import SidebarItems from './SidebarItems';
import UserButton from './UserButton';
import Link from 'next/link';
import SidebarUpgradePlan from './SidebarUpgradePlan';

const Sidebar = () => {
  return (
    <div className='h-full border border-[#F2F2F2] dark:border-[#272626] rounded-xl p-2.5 flex flex-col justify-between'>
      <div>
        <div className='mb-6'>
          <Logo />
        </div>

        <Link href='/home'>
          <Button size='lg' className='w-full mb-3'>
            <FaPlus className='mr-2' /> New Content
          </Button>
        </Link>

        <SidebarItems />
      </div>

      <div className='space-y-3'>
        <SidebarUpgradePlan />

        <UserButton />
      </div>
    </div>
  );
};

export default Sidebar;
