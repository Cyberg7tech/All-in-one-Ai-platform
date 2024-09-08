'use client';

import { TypeYoutubeChat } from '@/types/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import ModalDeleteContent from '@/components/dashboard/chat-with-youtube/history/ModalDeleteContent';
import TopicCell from '@/components/dashboard/chat-with-youtube/history/ContentRow';

export const columns: ColumnDef<TypeYoutubeChat>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => {
      return <div>{row.index + 1}</div>;
    },
  },
  {
    accessorKey: 'topic',
    header: 'Topic',
    cell: ({ row }) => <TopicCell row={row} />,
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
