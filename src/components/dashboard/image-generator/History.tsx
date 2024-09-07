'use client';

import React, { FC } from 'react';
import NoStateIcon from '@/assets/icons/NoStateIcon';
import { TypeImageGeneration } from '@/types/types';
import ModalViewImage from './ModalViewImage';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type HistoryGridProps = {
  data: TypeImageGeneration[];
};

const HistoryGrid: FC<HistoryGridProps> = ({ data }) => {
  return (
    <div>
      <p className='text-2xl font-medium text-default mb-4'>My Generated Images</p>

      {data?.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pr-1 h-[calc(100vh-132px)] overflow-auto'>
          {data.map((item) => (
            <React.Fragment key={item.id}>
              {item.image_urls &&
                item.image_urls.map((imageUrl, index) => (
                  <div className='rounded-lg' key={index}>
                    <ModalViewImage data={item} imageUrl={imageUrl} />
                  </div>
                ))}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center h-72'>
          <NoStateIcon />
          <p className='text-lg text-subtle my-5'>No Image Available</p>
          <Link href='/dashboard/image-generator'>
            <Button variant='default'>Generate New Image</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default HistoryGrid;
