'use client';

import { cn } from '@/utils/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import { FC } from 'react';

interface SidebarItemProps {
  route: { icon: JSX.Element; label: string; path: string };
}

const SidebarItem: FC<SidebarItemProps> = ({ route }) => {
  const pathname = usePathname();

  const isActive = pathname.startsWith(route.path);

  return (
    <Link
      href={route.path}
      className={cn(
        buttonVariants({ variant: 'secondary' }),
        'flex justify-start bg-transparent gap-2 font-semibold border border-transparent hover:border-border rounded-lg text-subtle dark:text-subtle/70 tracking-tight hover:bg-secondary hover:!text-default',
        isActive && 'border-border rounded-lg !text-default bg-secondary'
      )}>
      <div>{route.icon}</div>
      <span className='text-sm'>{route.label}</span>
    </Link>
  );
};

export default SidebarItem;
