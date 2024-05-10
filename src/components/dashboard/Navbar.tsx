'use client';

import React from 'react';
import { SelectTheme } from '../SelectTheme';
import { usePathname } from 'next/navigation';
import MobileSidebar from './sidebar/MobileSidebar';
import { RxExternalLink } from 'react-icons/rx';
import Link from 'next/link';

const Navbar = () => {
  const pathname = usePathname();

  const title =
    pathname === '/home'
      ? 'Content Writer'
      : pathname === '/history'
        ? 'History'
        : pathname === '/pricing'
          ? 'Pricing'
          : pathname === '/prompt-library'
            ? 'Prompt Library'
            : 'Dashboard';

  return (
    <div className='h-14 flex items-center justify-between mb-3.5'>
      <div className='text-lg font-semibold text-grey dark:text-white'>{title}</div>

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
        <div className='block md:hidden'>
          <MobileSidebar />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
