'use client';

import { cn } from '@/utils/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import { SidebarRoutes } from './content';

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
