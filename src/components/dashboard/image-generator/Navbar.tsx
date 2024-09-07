// This component serves as the navigation bar for the application, which appears across various pages.
// It dynamically adjusts to display different links based on the user's authentication status and screen size.

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RxExternalLink } from 'react-icons/rx';
import { GrAdd } from 'react-icons/gr';
import { IoImages } from 'react-icons/io5';
import MobileSidebarMenu from './MobileSidebarMenu';
import Logo from '@/components/Logo';
import { SelectTheme } from '@/components/SelectTheme';
import DropdownAccount from '../sidebar/DropdownAccount';

export const navItems = [
  {
    title: 'New Image',
    icon: <GrAdd />,
    href: '/dashboard/image-generator',
  },
  {
    title: 'My Generated Images',
    icon: <IoImages />,
    href: '/dashboard/image-generator/history',
  },
  {
    title: 'Demo Apps',
    href: 'https://apps.builderkit.ai/',
  },
];

export default async function Navbar() {
  return (
    <div className='w-full'>
      <div className=' mx-auto flex justify-between items-center py-4'>
        <Logo />

        <div className='flex items-center gap-3'>
          <SelectTheme />

          <div className='hidden lg:flex items-center gap-3'>
            {navItems.map((item) => (
              <Link key={item.title} href={item.href} className='block'>
                <Button variant='secondary' className='gap-2 w-full justify-start'>
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
