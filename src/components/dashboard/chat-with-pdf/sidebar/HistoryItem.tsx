'use client';

import { FC } from 'react';
import { cn } from '@/utils/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HistoryItemProps {
  history: { id: string; filename: string | null };
}

const HistoryItem: FC<HistoryItemProps> = ({ history }) => {
  const pathname = usePathname();

  const chatId = pathname.split('/').pop();

  return (
    <Link
      href={`/dashboard/chat-with-pdf/${history.id}`}
      className={cn(
        'w-full h-10 block px-4 py-2 text-sm font-medium border border-transparent hover:border-border rounded-lg text-subtle hover:text-default tracking-tight',
        history.id === chatId && 'border-border !text-default bg-secondary'
      )}>
      <p className='w-48 truncate'>{history.filename}</p>
    </Link>
  );
};

export default HistoryItem;
