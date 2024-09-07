import Link from 'next/link';
import { FaMusic } from 'react-icons/fa6';
import { RxExternalLink } from 'react-icons/rx';
import { Button } from '@/components/ui/button';
import { GrAdd } from 'react-icons/gr';
import MobileSidebarMenu from './MobileSidebarMenu';
import Logo from '@/components/Logo';
import { SelectTheme } from '@/components/SelectTheme';
import DropdownAccount from '../sidebar/DropdownAccount';

export const navItems = [
  { title: 'New Music', href: '/dashboard/music-generator', icon: <GrAdd /> },
  { title: 'My Music', href: '/dashboard/music-generator/history', icon: <FaMusic /> },
  { title: 'Demo Apps', href: 'https://apps.builderkit.ai/' },
];

export default async function Navbar() {
  return (
    <div className='w-full'>
      <div className='mx-auto flex justify-between items-center py-4'>
        <Logo />

        <div className='flex items-center gap-3'>
          <SelectTheme />

          <div className='hidden lg:flex items-center gap-3'>
            {navItems.map((item) => (
              <Link key={item.title} href={item.href} className='block'>
                <Button variant='secondary' className='gap-2 w-full font-normal'>
                  {item.icon}
                  {item.title}
                </Button>
              </Link>
            ))}

            <Link href='https://www.builderkit.ai/#pricing' target='_blank'>
              <Button className='gap-2 border border-destructive/10 bg-destructive/10 dark:bg-destructive/20 text-destructive shadow-none'>
                Get Builderkit.ai
                <RxExternalLink />
              </Button>
            </Link>

            <DropdownAccount />
          </div>

          {/* Specific to mobile view */}
          <MobileSidebarMenu />
        </div>
      </div>
    </div>
  );
}
