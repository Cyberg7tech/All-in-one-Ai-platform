'use client';

import { TypeInteriorDesign } from '@/types/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { FC } from 'react';
import NoStateIcon from '@/assets/icons/NoStateIcon';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type HistoryGridProps = {
  data: TypeInteriorDesign[];
};

const HistoryGrid: FC<HistoryGridProps> = ({ data }) => {
  const router = useRouter();

  return (
    <div>
      <h1 className='text-2xl font-medium text-default mb-4'>My Generated Rooms</h1>

      {data?.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 h-[calc(100vh-132px)] overflow-auto'>
          {data.map((item) => (
            <div className='h-max p-1.5 rounded-lg bg-muted' key={item.id}>
              <Image
                src={item?.image_urls?.[1] ?? ''}
                alt='generated-room'
                className='object-cover rounded-lg w-full h-64 cursor-pointer'
                onClick={() => router.push(`/dashboard/interior-design/${item.id}`)}
                width={300}
                height={300}
              />
              <p className='text-xs font-medium text-default capitalize mt-1.5 p-2 border truncate rounded bg-white dark:bg-border'>
                {item.prompt}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center h-72'>
          <NoStateIcon />
          <p className='text-lg text-subtle my-5'>No Room Available</p>
          <Link href='/dashboard/interior-design'>
            <Button variant='default'>Generate New Rooms</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default HistoryGrid;
