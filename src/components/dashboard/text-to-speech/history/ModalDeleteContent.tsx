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

const ModalDeleteContent = ({ id }: { id: string }) => {
  const router = useRouter();

  const handleDelete = async () => {
    const supabase = supabaseBrowserClient();

    const { error } = await supabase.from('text_to_speech').delete().eq('id', id);
    if (error) {
      errorToast(error.message);
      return;
    }

    toast({ description: 'Content deleted successfully' });
    router.refresh();
  };

  return (
    <Dialog>
      <DialogTrigger className='w-full hover:bg-accent cursor-pointer rounded'>
        <div className='flex items-center gap-2 px-2 py-1.5 text-sm'>
          <LuTrash2 />
          <p>Delete</p>
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
