'use client';

import { SheetClose } from '@/components/ui/sheet';
import { cn } from '@/utils/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, ReactNode } from 'react';

interface MobileSidebarItemProps {
  route: {
    icon: ReactNode;
    label: string;
    path: string;
  };
}

const MobileSidebarItem: FC<MobileSidebarItemProps> = ({ route }) => {
  const pathname = usePathname();

  return (
    <SheetClose asChild>
      <Link
        href={route.path}
        className={cn(
          'w-full h-10 flex gap-2 px-4 py-2 text-sm font-medium border border-transparent hover:border-border rounded-lg text-subtle tracking-tight',
          pathname === route.path && 'border-border !text-default bg-secondary'
        )}>
        <div>{route.icon}</div>
        <span>{route.label}</span>
      </Link>
    </SheetClose>
  );
};

export default MobileSidebarItem;
