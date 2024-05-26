import { SelectTheme } from '../../SelectTheme';
import MobileSidebar from '../sidebar/MobileSidebar';
import { RxExternalLink } from 'react-icons/rx';
import Link from 'next/link';
import NavTitle from './NavTitle';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <div className='h-14 flex items-center justify-between mb-3.5'>
      <NavTitle />

      <div className='flex items-center gap-5'>
        <div className='flex items-center gap-5 mr-2'>
          <SelectTheme />

          <div className='hidden md:flex items-center gap-3'>
            <Link href='https://apps.builderkit.ai/' target='_blank'>
              <Button variant='secondary' className='gap-2'>
                Demo Apps
              </Button>
            </Link>
            <Link href='https://www.builderkit.ai/#pricing' target='_blank'>
              <Button className='gap-2 border border-destructive/10 bg-destructive/10 dark:bg-destructive/20 text-destructive shadow-none'>
                Get Builderkit.ai
                <RxExternalLink />
              </Button>
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
