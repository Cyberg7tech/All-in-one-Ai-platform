import React from 'react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import AccountSettings from './AccountSettings';
import { getUserDetails } from '@/utils/supabase/server';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import Link from 'next/link';
import ButtonSignout from '../ButtonSignout';
import { AiOutlineDollarCircle } from 'react-icons/ai';
import dynamic from 'next/dynamic';

const DropdownContentWrapper = dynamic(() => import('./DropdownContentWrapper'), { ssr: false });

const UserButton = async () => {
  const user = await getUserDetails();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='bg-light-white dark:bg-light-dark/10 rounded-lg px-1.5 py-2.5 flex items-center gap-2 overflow-hidden cursor-pointer'>
          <Image
            src={user?.user_metadata?.avatar_url ?? '/avatar.png'}
            className='size-8 rounded-full'
            width={20}
            height={20}
            alt='avatar'
          />
          <p className='font-semibold text-grey dark:text-white'>{user?.user_metadata?.full_name} </p>
        </div>
      </DropdownMenuTrigger>
      <DropdownContentWrapper>
        <DropdownMenuItem className='flex items-start gap-3 overflow-hidden'>
          <Image
            src={user?.user_metadata?.avatar_url ?? '/avatar.png'}
            className='size-10 rounded-full'
            width={20}
            height={20}
            alt='avatar'
          />
          <div>
            <p className='font-semibold text-grey dark:text-white'>{user?.user_metadata?.full_name}</p>
            <p className='text-light-grey dark:text-white/90'>{user?.email}</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <AccountSettings />
        <DropdownMenuSeparator />

        <a href='mailto:vatsal1811@gmail.com'>
          <DropdownMenuItem className='cursor-pointer text-grey dark:text-white'>
            <AiOutlineQuestionCircle className='size-5 mr-2' />
            Support
          </DropdownMenuItem>
        </a>

        <DropdownMenuSeparator />
        <Link href='/pricing'>
          <DropdownMenuItem className='cursor-pointer text-grey dark:text-white'>
            <AiOutlineDollarCircle className='size-5 mr-2' />
            Pricing
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </Link>

        <ButtonSignout />

        <div className='flex items-center m-2 mt-2.5 text-[12px] text-[#83888B]'>
          <a href=''>
            <span className='border-b'> Privacy policy</span> ,
            <span className='border-b'> Terms & conditions</span>
          </a>
        </div>
      </DropdownContentWrapper>
    </DropdownMenu>
  );
};

export default UserButton;
