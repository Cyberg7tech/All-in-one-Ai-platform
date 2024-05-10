import React from 'react';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FaBars } from 'react-icons/fa6';
import Logo from '@/components/Logo';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { FaPlus } from 'react-icons/fa';
import UserButton from './UserButton';
import { usePathname } from 'next/navigation';
import { SidebarRoutes } from './SidebarItems';
import { cn } from '@/utils/utils';
import SidebarUpgradePlan from './SidebarUpgradePlan';

const MobileSidebar = () => {
  const pathname = usePathname();
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
                <FaPlus className='mr-2' /> New Chat
              </Button>
            </Link>

            <div className='space-y-1'>
              {SidebarRoutes.map((route, index) => {
                const isActive = pathname.startsWith(route.path);

                return (
                  <SheetClose asChild key={index}>
                    <Link
                      href={route.path}
                      className={cn(
                        buttonVariants({ variant: 'light-gray' }),
                        isActive &&
                          'border !border-[#E8E8E8] dark:!border-dark rounded-lg bg-light-white dark:bg-light-dark/10 !text-[#3E3E3E] dark:!text-white'
                      )}>
                      <div>{route.icon}</div>
                      <span>{route.label}</span>
                    </Link>
                  </SheetClose>
                );
              })}
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
