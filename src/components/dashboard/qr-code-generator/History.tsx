'use client';

import Image from 'next/image';
import React, { FC } from 'react';
import { TypeQrCodeGeneration } from '@/types/types';
import ModalImageView from './ModalImageView';
import NoStateIcon from '@/assets/icons/NoStateIcon';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type HistoryGridProps = {
  data: TypeQrCodeGeneration[];
};

const HistoryGrid: FC<HistoryGridProps> = ({ data }) => {
  return (
    <div>
      {data && data.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-132px)] overflow-auto'>
          {data.map((item, index) => {
            const imageUrl = item.image_url;
            return (
              <ModalImageView key={index} data={item} imageUrl={imageUrl ?? ''}>
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt='generated-room'
                    className='object-cover rounded-lg w-full h-52 cursor-pointer'
                    width={300}
                    height={300}
                  />
                ) : (
                  <div className='object-cover rounded-lg w-full h-52 cursor-pointer bg-gray-200' />
                )}
              </ModalImageView>
            );
          })}
        </div>
      ) : (
        <div className='h-[calc(100vh-132px)] flex items-center justify-center w-full'>
          <div className='max-w-80 flex flex-col items-center space-y-4 '>
            <NoStateIcon />
            <p className='text-xl text-default font-semibold text-center'>Generated QR will appear here</p>
            <p className='text-subtle text-sm text-center'>Click on the below button to generate</p>
            <Link href='/dashboard/qr-code-generator' className='w-full'>
              <Button className='w-full'>Generate the QR</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryGrid;
