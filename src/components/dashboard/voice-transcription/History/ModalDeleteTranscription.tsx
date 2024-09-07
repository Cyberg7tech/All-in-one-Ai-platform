'use client';

import React, { FC } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import { cn, errorToast } from '@/utils/utils';
import { useRouter } from 'next/navigation';
import { FaRegTrashAlt } from 'react-icons/fa';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { buttonVariants } from '@/components/ui/button';

type ModalDeleteTranscriptionProps = {
  id: string;
};

const ModalDeleteTranscription: FC<ModalDeleteTranscriptionProps> = ({ id }) => {
  const router = useRouter();

  const handleDelete = async () => {
    const supabase = supabaseBrowserClient();

    try {
      const { error } = await supabase.from('voice_transcriptions').delete().eq('id', id);

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
    <Dialog>
      <DialogTrigger asChild>
        <div className='flex justify-end'>
          <div className='rounded p-1 border cursor-pointer'>
            <FaRegTrashAlt className='size-4 text-default' />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the content from your account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>Cancel</DialogClose>
          <DialogClose
            className={cn(buttonVariants({ variant: 'destructive' }), 'w-full')}
            onClick={handleDelete}>
            Delete
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalDeleteTranscription;
