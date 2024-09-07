'use client';

import { SheetClose } from '@/components/ui/sheet';
import { cn } from '@/utils/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

interface MobileHistoryItemProps {
  history: { id: string; title: string | null };
}

const MobileHistoryItem: FC<MobileHistoryItemProps> = ({ history }) => {
  const pathname = usePathname();

  const chatId = pathname.split('/').pop();

  return (
    <SheetClose asChild>
      <Link
        href={`/dashboard/llamagpt/${history.id}`}
        className={cn(
          'w-full h-10 block px-4 py-2 text-sm font-medium border border-transparent hover:border-border rounded-lg text-subtle hover:text-default tracking-tight',
          history.id === chatId && 'border-border !text-default bg-secondary'
        )}>
        <div className='w-48 truncate'>{history.title && history.title.replace(/"/g, '')}</div>{' '}
      </Link>
    </SheetClose>
  );
};

export default MobileHistoryItem;
