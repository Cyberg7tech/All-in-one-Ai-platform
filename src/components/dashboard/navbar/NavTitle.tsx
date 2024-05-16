'use client';

import { usePathname } from 'next/navigation';
import { FC } from 'react';

interface NavTitleProps {}

const NavTitle: FC<NavTitleProps> = () => {
  const pathname = usePathname();

  const title = pathname.includes('/home')
    ? 'Content Writer'
    : pathname === '/history'
      ? 'History'
      : pathname === '/pricing'
        ? 'Pricing'
        : pathname === '/prompt-library'
          ? 'Prompt Library'
          : 'Content Writer';

  return (
    <>
      <div className='text-lg font-semibold text-default'>{title}</div>
    </>
  );
};

export default NavTitle;
