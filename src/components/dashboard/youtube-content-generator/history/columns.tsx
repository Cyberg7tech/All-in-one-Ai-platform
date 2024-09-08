'use client';

import { TypeYoutubeContent } from '@/types/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import ModalDeleteContent from './ModalDeleteContent';
import Link from 'next/link';

export const columns: ColumnDef<TypeYoutubeContent>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => {
      return <div>{row.index + 1}</div>;
    },
  },
  {
    accessorKey: 'youtube_title',
    header: 'Title',
    cell: ({ row }) => (
      <Link href={`/dashboard/youtube-content-generator/${row.original.id}`} className='w-60 truncate'>
        {row.original.youtube_title}
      </Link>
    ),
  },

  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => {
      return <div>{format(new Date(row.original.created_at), 'MMM dd, yyyy')}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return <ModalDeleteContent row={row} />;
    },
  },
];
