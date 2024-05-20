'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { useShowNewForm } from '@/hooks/use-new-content';

const ButtonNewContent = () => {
  const { setShowNewForm } = useShowNewForm();

  return (
    <Link href='/home'>
      <Button size='lg' className='w-full mb-3' onClick={() => setShowNewForm(false)}>
        <FaPlus className='mr-2' /> New Content
      </Button>
    </Link>
  );
};

export default ButtonNewContent;
