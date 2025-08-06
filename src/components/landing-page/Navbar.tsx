// This component is used to provide navigation links across the website.
// It is typically placed at the top of each page and includes links to major sections like Home, About, Services, and Contact.
// The component also handles responsive adjustments to ensure navigation is accessible on different device sizes.

import { cn } from '@/utils/utils';
import Link from 'next/link';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HiBars3 } from 'react-icons/hi2';
import ButtonCta from './ButtonCta';
import Logo from '../Logo';

const NavbarRoutes = [
  { label: 'Features', url: '/#features' },
  { label: 'Products', url: '/#products' },
  { label: 'Testimonials', url: '/#testimonials' },
  { label: 'FAQ', url: '/#faq' },
];

export default async function Navbar() {
  return (
    <div className='w-full text-white bg-lp-background'>
      <div className={cn('max-w-6xl mx-auto flex justify-between items-center p-4')}>
        <Logo />

        <ul className='hidden md:flex items-center gap-12'>
          {NavbarRoutes.map((item, index) => (
            <li key={index} className='text-sm cursor-pointer font-medium leading-6'>
              <Link href={item.url}>{item.label}</Link>
            </li>
          ))}
        </ul>

        <div className='hidden md:block'>
          <ButtonCta label='Sign In' />
        </div>

        <Sheet>
          <SheetTrigger className='block md:hidden'>
            <HiBars3 />
          </SheetTrigger>
          <SheetContent>
            <div className='space-y-6'>
              <ul className='gap-6'>
                {NavbarRoutes.map((item, index) => (
                  <li key={index} className='text-sm cursor-pointer font-medium leading-6 py-2'>
                    <Link href={item.url}>{item.label}</Link>
                  </li>
                ))}
              </ul>
              <ButtonCta className='w-full' label='Sign In' />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
