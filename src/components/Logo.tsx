// Logo Component that redirects users to the homepage.
// It is used across various parts of the application to provide a consistent way to return to the main page.

import Image from 'next/image';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href='/'>
      <div className='flex items-center gap-2'>
        <Image src='/logo.png' className='size-8' width={50} height={50} alt='logo' />
        <p className='text-lg not-italic font-extrabold leading-6 text-[#3C3C3C] dark:text-white'>
          BuilderKit
        </p>
      </div>
    </Link>
  );
}
