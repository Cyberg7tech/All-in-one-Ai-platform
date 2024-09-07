'use client';

import { TypeImageEnhancerUpscaler } from '@/types/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { FC } from 'react';
import NoStateIcon from '@/assets/icons/NoStateIcon';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type HistoryGridProps = {
  data: TypeImageEnhancerUpscaler[];
};

const HistoryGrid: FC<HistoryGridProps> = ({ data }) => {
  const router = useRouter();

  return (
    <div>
      <h1 className='text-2xl font-medium text-default mb-4'>My Generated Images</h1>

      {data?.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-auto'>
          {data.map((item) => (
            <Image
              key={item.id}
              src={item?.output_image ?? ''}
              alt='upscaled_image'
              className='object-cover rounded-lg w-full h-64 cursor-pointer'
              onClick={() => router.push(`/dashboard/image-enhancer-upscaler/${item.id}`)}
              width={300}
              height={300}
            />
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center h-72'>
          <NoStateIcon />
          <p className='text-lg text-subtle my-5'>No Images Available</p>
          <Link href='/dashboard/image-enhancer-upscaler'>
            <Button variant='default'>Generate New Images</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default HistoryGrid;
