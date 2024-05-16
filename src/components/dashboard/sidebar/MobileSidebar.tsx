import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FaBars } from 'react-icons/fa6';
import Logo from '@/components/Logo';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { FaPlus } from 'react-icons/fa';
import UserButton from './UserButton';
import SidebarUpgradePlan from './SidebarUpgradePlan';
import { SidebarRoutes } from './content';
import { cn } from '@/utils/utils';

const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger className=' pr-4 hover:opacity-75 transition'>
        <FaBars />
      </SheetTrigger>
      <SheetContent side='left' className='p-5 pt-8'>
        <div className='h-full flex flex-col justify-between'>
          <div>
            <div className='mb-6'>
              <Logo />
            </div>

            <Link href='/home'>
              <Button size='lg' className='w-full mb-3'>
                <FaPlus className='mr-2' /> New Content
              </Button>
            </Link>

            <div className='space-y-1'>
              {SidebarRoutes.map((route, index) => (
                <SheetClose asChild key={index}>
                  <Link
                    href={route.path}
                    className={cn(
                      buttonVariants({ variant: 'secondary' }),
                      'w-full flex justify-start bg-transparent gap-2 font-semibold border border-transparent hover:border-border rounded-lg text-subtle tracking-tight'
                    )}>
                    <div>{route.icon}</div>
                    <span>{route.label}</span>
                  </Link>
                </SheetClose>
              ))}
            </div>
          </div>

          <div className='space-y-3'>
            <SidebarUpgradePlan />

            <UserButton />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
