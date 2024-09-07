'use client';

import { TypeAudio } from '@/types/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import ModalOutput from '../generate/ModalOutput';
import ModalDeleteTranscription from './ModalDeleteTranscription';

export const columns: ColumnDef<TypeAudio>[] = [
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
      return <div>{format(row.original.created_at, 'MMM dd, yyyy')}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return <ModalDeleteTranscription id={row.original.id} />;
    },
  },
];

const TopicCell = ({ row }: { row: any }) => {
  return (
    <ModalOutput
      transcription={row.original.transcription}
      summary={row.original.summary}
      audio_url={row.original.audio_url}>
      <div className='cursor-pointer'>
        {row.original.transcription.length > 40
          ? `${row.original.transcription.substring(0, 40)} ...`
          : row.original.transcription}
      </div>
    </ModalOutput>
  );
};
