'use client';

import { cn } from '@/utils/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, ReactNode } from 'react';

interface SidebarItemProps {
  route: { icon: ReactNode; label: string; path: string };
}

const SidebarItem: FC<SidebarItemProps> = ({ route }) => {
  const pathname = usePathname();

  const isActive = pathname.startsWith(route.path);

  return (
    <Link
      href={route.path}
      className={cn(
        'w-full h-9 px-4 py-2 flex justify-start bg-transparent gap-2 text-sm font-semibold border border-transparent hover:border-border rounded-lg text-subtle tracking-tight',
        isActive && 'border-border rounded-lg !text-default bg-secondary'
      )}>
      <div>{route.icon}</div>
      <span className='text-sm'>{route.label}</span>
    </Link>
  );
};

export default SidebarItem;
