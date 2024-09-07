import { FC } from 'react';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HiBars3 } from 'react-icons/hi2';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { navItems } from './Navbar';
import { RxExternalLink } from 'react-icons/rx';
import Logo from '@/components/Logo';
import DropdownAccount from '../sidebar/DropdownAccount';

interface MobileSidebarMenuProps {}

const MobileSidebarMenu: FC<MobileSidebarMenuProps> = () => {
  return (
    <div className='flex lg:hidden items-center gap-2'>
      <Sheet>
        <SheetTrigger className='block lg:hidden'>
          <HiBars3 />
        </SheetTrigger>

        <SheetContent>
          <Logo />

          <div className='space-y-3 mt-8'>
            {navItems.map((item) => (
              <SheetClose key={item.title} className='w-full' asChild>
                <Link href={item.href}>
                  <Button variant='secondary' className='gap-2 w-full justify-start'>
                    {item.icon}
                    {item.title}
                  </Button>
                </Link>
              </SheetClose>
            ))}

            <Link href='https://www.builderkit.ai/#pricing' target='_blank'>
              <Button className='gap-2 border border-destructive/10 bg-destructive/10 dark:bg-destructive/20 text-destructive shadow-none w-full mt-3 justify-start'>
                Get Builderkit.ai
                <RxExternalLink />
              </Button>
            </Link>

            <DropdownAccount />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSidebarMenu;
