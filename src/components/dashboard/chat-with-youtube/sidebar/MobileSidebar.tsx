import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FaBars } from 'react-icons/fa6';
import Logo from '@/components/Logo';
import DropdownAccount from '../../sidebar/DropdownAccount';
import SidebarUpgradePlan from '../../sidebar/SidebarUpgradePlan';
import { SidebarRoutes } from './content';
import MobileSidebarItem from './MobileSidebarItem';
import ButtonNewVideo from './ButtonNewVideo';

const MobileSidebar = () => {
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

            <ButtonNewVideo />

            <div className='space-y-1'>
              {SidebarRoutes.map((route, index) => (
                <MobileSidebarItem key={index} route={route} />
              ))}
            </div>
          </div>

          <div className='space-y-3'>
            <SidebarUpgradePlan />
            <DropdownAccount />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
