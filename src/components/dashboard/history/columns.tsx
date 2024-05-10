'use client';

import { toast } from '@/components/ui/use-toast';
import { TypeContent } from '@/types/types';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import { errorToast } from '@/utils/utils';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { FaRegTrashAlt } from 'react-icons/fa';
import { format } from 'date-fns';

export const columns: ColumnDef<TypeContent>[] = [
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
    header: 'Actions',
    cell: ({ row }) => {
      return <DeleteActionCell row={row} />;
    },
  },
];

const DeleteActionCell = ({ row }: { row: any }) => {
  const router = useRouter();

  const handleDelete = async () => {
    const supabase = supabaseBrowserClient();

    try {
      const { error } = await supabase.from('content_creations').delete().eq('id', row.original.id);

      if (!error) {
        toast({ title: 'Content deleted successfully', variant: 'default' });
        router.refresh();
      } else {
        errorToast('Something went wrong, please try again');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      errorToast('Something went wrong, please try again');
    }
  };

  return (
    <div className='rounded w-fit p-1 border cursor-pointer' onClick={handleDelete}>
      <FaRegTrashAlt className='size-5' />
    </div>
  );
};

const TopicCell = ({ row }: { row: any }) => {
  const router = useRouter();

  const handlePush = (id: string) => {
    router.push(`/home/${id}`);
  };

  return (
    <div className='cursor-pointer' onClick={() => handlePush(row.original.id)}>
      <div>
        {row.original.topic.length > 40 ? `${row.original.topic.substring(0, 40)} ...` : row.original.topic}
      </div>
    </div>
  );
};
