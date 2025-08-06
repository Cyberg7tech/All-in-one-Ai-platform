import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';
import { FaPlus } from 'react-icons/fa';

const ButtonNewVideo = () => {
  return (
    <Link href='/dashboard/chat-with-youtube'>
      <Button size='lg' className='w-full mb-3'>
        <FaPlus className='mr-2' /> New Video
      </Button>
    </Link>
  );
};

export default ButtonNewVideo;
