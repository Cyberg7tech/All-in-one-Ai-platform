import Logo from '@/components/Logo';
import SidebarItem from './SidebarItem';
import DropdownAccount from '../../sidebar/DropdownAccount';
import SidebarUpgradePlan from '../../sidebar/SidebarUpgradePlan';
import { SidebarRoutes } from './content';
import ButtonNewContent from './ButtonNewContent';

const Sidebar = () => {
  return (
    <div className='h-full border rounded-xl p-2.5 pb-3.5 flex flex-col justify-between'>
      <div>
        <div className='mb-6'>
          <Logo />
        </div>

        <ButtonNewContent />

        <div className='space-y-1'>
          {SidebarRoutes?.map((item) => (
            <SidebarItem key={item.label} route={item} />
          ))}
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
