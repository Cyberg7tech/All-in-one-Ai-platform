'use client';

import { cn } from '@/utils/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RiLayoutGridFill } from 'react-icons/ri';
import { PiMagicWand } from 'react-icons/pi';
import { MdHistory } from 'react-icons/md';
import { buttonVariants } from '@/components/ui/button';

export const SidebarRoutes = [
  {
    icon: <RiLayoutGridFill className='size-5' />,
    label: 'Home',
    path: '/home',
  },
  {
    icon: <MdHistory className='size-5' />,
    label: 'History',
    path: '/history',
  },
  {
    icon: <PiMagicWand className='size-5' />,
    label: 'Prompt library',
    path: '/prompt-library',
  },
];

const SidebarItems = () => {
  const pathname = usePathname();

  return (
    <div className='space-y-1'>
      {SidebarRoutes.map((route, index) => {
        const isActive = pathname.startsWith(route.path);

        return (
          <Link
            key={index}
            href={route.path}
            className={cn(
              buttonVariants({ variant: 'light-gray' }),
              isActive &&
                'border !border-[#E8E8E8] dark:!border-dark rounded-lg bg-light-white dark:bg-light-dark/10 !text-[#3E3E3E] dark:!text-white'
            )}>
            <div>{route.icon}</div>
            <span className='text-[14px]'>{route.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default SidebarItems;
