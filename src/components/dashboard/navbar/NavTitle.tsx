'use client';

import { usePathname } from 'next/navigation';
import { FC } from 'react';

interface NavTitleProps {}

const NavTitle: FC<NavTitleProps> = () => {
  const pathname = usePathname();

  const title =
    pathname === '/home'
      ? 'Content Writer'
      : pathname === '/history'
        ? 'History'
        : pathname === '/pricing'
          ? 'Pricing'
          : pathname === '/prompt-library'
            ? 'Prompt Library'
            : 'Dashboard';

  return (
    <>
      <div className='text-lg font-semibold text-grey dark:text-white'>{title}</div>
    </>
  );
};

export default NavTitle;
