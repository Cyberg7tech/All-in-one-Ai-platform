'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';
import { FaPlus } from 'react-icons/fa';

const ButtonNewContent = () => {
  return (
    <Link href='/home?form=true'>
      <Button size='lg' className='w-full mb-3'>
        <FaPlus className='mr-2' /> New Content
      </Button>
    </Link>
  );
};

export default ButtonNewContent;
