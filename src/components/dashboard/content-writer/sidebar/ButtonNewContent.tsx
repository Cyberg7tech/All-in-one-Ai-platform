'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { FaPlus } from 'react-icons/fa';

const ButtonNewContent = () => {
  const pathname = usePathname();
  const appPath = pathname.split('/')[2];

  let url = `/dashboard/${appPath}`;
  if (appPath == 'content-writer') {
    url = `${url}?form=true`;
  }

  return (
    <Link href={url}>
      <Button size='lg' className='w-full mb-3'>
        <FaPlus className='mr-2' /> New Content
      </Button>
    </Link>
  );
};

export default ButtonNewContent;
