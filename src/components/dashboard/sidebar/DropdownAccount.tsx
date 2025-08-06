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
import { cn } from '@/utils/utils';
import { buttonVariants } from '@/components/ui/button';

const DropdownContentWrapper = dynamic(() => import('./DropdownContentWrapper'), { ssr: false });

const DropdownAccount = async () => {
  const user = await getUserDetails();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            buttonVariants({ variant: 'secondary', size: 'lg' }),
            'flex justify-start px-1.5 py-2.5 !w-full gap-2 cursor-pointer'
          )}>
          {user ? (
            <>
              <Image
                src={user.user_metadata?.avatar_url ?? '/avatar.png'}
                className='size-5 rounded-full'
                width={20}
                height={20}
                alt='avatar'
              />
              <p className='font-semibold text-default truncate'>{user.user_metadata?.full_name} </p>
            </>
          ) : (
            <p className='font-semibold text-default truncate'>Settings</p>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownContentWrapper>
        {user && (
          <>
            <div className='flex items-start gap-3 overflow-hidden px-2 py-1.5'>
              <Image
                src={user.user_metadata?.avatar_url ?? '/avatar.png'}
                className='size-10 rounded-full'
                width={20}
                height={20}
                alt='avatar'
              />
              <div>
                <p className='font-semibold text-default'>{user.user_metadata?.full_name}</p>
                <p className='text-default dark:text-white/90'>{user.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <AccountSettings user={user} />
            <DropdownMenuSeparator />
          </>
        )}

        <a href='mailto:hello@builderkit.ai'>
          <DropdownMenuItem className='cursor-pointer text-default'>
            <AiOutlineQuestionCircle className='size-5 mr-2' />
            Support
          </DropdownMenuItem>
        </a>

        <DropdownMenuSeparator />
        <Link href='https://www.builderkit.ai/#pricing' target='_blank'>
          <DropdownMenuItem className='cursor-pointer text-default'>
            <AiOutlineDollarCircle className='size-5 mr-2' />
            Pricing
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </Link>

        {user && <ButtonSignout />}

        <div className='flex items-center m-2 mt-2.5 text-xs text-subtle'>
          <a href='#'>
            <span className='border-b'> Privacy policy</span> ,
            <span className='border-b'> Terms & conditions</span>
          </a>
        </div>
      </DropdownContentWrapper>
    </DropdownMenu>
  );
};

export default DropdownAccount;
