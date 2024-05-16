// This snippet demonstrates the use of a ButtonSignout component to sign out a user from the application.
// You can use the ButtonSignout component to create sign-out buttons anywhere in your application.
'use client';
import { FC } from 'react';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { FiLogOut } from 'react-icons/fi';

interface ButtonSignoutProps {
  className?: string;
}
const ButtonSignout: FC<ButtonSignoutProps> = () => {
  const supabase = supabaseBrowserClient();
  const router = useRouter();

  return (
    <DropdownMenuItem
      className='cursor-pointer text-default'
      onClick={async () => {
        await supabase.auth.signOut();
        router.refresh();
      }}>
      <FiLogOut className='size-5 mr-2' />
      Log Out
    </DropdownMenuItem>
  );
};
export default ButtonSignout;
