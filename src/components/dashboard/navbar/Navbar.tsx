import { SelectTheme } from '../../SelectTheme';
import MobileSidebar from '../sidebar/MobileSidebar';
import { RxExternalLink } from 'react-icons/rx';
import Link from 'next/link';
import NavTitle from './NavTitle';

const Navbar = () => {
  return (
    <div className='h-14 flex items-center justify-between mb-3.5'>
      <NavTitle />

      <div className='flex items-center gap-5'>
        <div className='flex items-center gap-5 mr-2'>
          <SelectTheme />

          <div className='hidden md:flex'>
            <Link href='https://apps.builderkit.ai/' target='_blank'>
              <div className='bg-light-white dark:bg-light-dark/10 rounded-lg px-4 py-2.5 flex items-center gap-2 cursor-pointer'>
                Demo Apps
                <RxExternalLink />
              </div>
            </Link>
          </div>
        </div>

        <div className='inline-block md:hidden'>
          <MobileSidebar />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
