import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FiArrowUpRight } from 'react-icons/fi';
import Link from 'next/link';
import { getUserDetails } from '@/utils/supabase/server';
import { LuUser } from 'react-icons/lu';

const AccountSettings = async () => {
  const user = await getUserDetails();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className='flex items-center rounded-sm px-2 py-1.5 cursor-pointer text-default hover:bg-accent'>
          <LuUser className='size-5' />
          <p className='text-sm ml-2'>Account</p>
        </div>
      </DialogTrigger>
      <DialogContent className='w-11/12 md:w-1/3 gap-3 rounded-lg'>
        <DialogHeader className='flex flex-row justify-between items-start'>
          <div>
            <DialogTitle className='mb-2 text-default text-left text-lg font-semibold'>Account</DialogTitle>
            <DialogDescription className='text-default dark:text-white/90 text-left text-sm'>
              Choose the avatar that best describes your use case
            </DialogDescription>
          </div>
        </DialogHeader>
        <DropdownMenuSeparator />
        <div className='space-y-5'>
          <div className='space-y-1'>
            <p className='font-medium text-subtle text-base'>Display Name</p>
            <p className='font-semibold text-default'>{user?.user_metadata.full_name}</p>
          </div>
          <div className='space-y-1'>
            <p className='font-medium text-subtle text-base'>Email Address</p>
            <p className='font-semibold text-default'>{user?.email}</p>
          </div>
          <div className='space-y-1'>
            <div className='flex justify-between items-center'>
              <div>
                <p className='font-medium text-subtle text-base'>Current Plan</p>
                <p className='font-semibold text-default'>Free</p>
              </div>
              <Link href='/pricing'>
                <Button variant='destructive' className='gap-2 py-4 text-sm font-semibold'>
                  Upgrade Plan
                  <FiArrowUpRight className='size-4' />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountSettings;
