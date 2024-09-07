'use client';

import { usePathname } from 'next/navigation';
import { FC } from 'react';

interface NavTitleProps {}

const NavTitle: FC<NavTitleProps> = () => {
  const pathname = usePathname();

  const appUrl = pathname.split('/')[2];
  const appName = appUrl.replaceAll('-', ' ');

  const title = pathname.includes('/history') ? 'History' : appName;

  return <div className='text-lg font-semibold text-default capitalize'>{title}</div>;
};

export default NavTitle;
