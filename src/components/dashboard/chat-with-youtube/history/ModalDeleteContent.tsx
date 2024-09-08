import { toast } from '@/components/ui/use-toast';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import { cn, errorToast } from '@/utils/utils';
import { useRouter } from 'next/navigation';
import { LuTrash2 } from 'react-icons/lu';
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

const ModalDeleteContent = ({ row }: { row: any }) => {
  const router = useRouter();

  const handleDelete = async () => {
    const supabase = supabaseBrowserClient();

    const { error } = await supabase.from('chat_with_youtube').delete().eq('id', row.original.id);
    if (error) {
      errorToast('Something went wrong, please try again');
      return;
    }

    toast({ description: 'Content deleted successfully' });
    router.refresh();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className='flex justify-end'>
          <div className='rounded p-1 border cursor-pointer'>
            <LuTrash2 className='size-4' />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from
            our servers.
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

export default ModalDeleteContent;
