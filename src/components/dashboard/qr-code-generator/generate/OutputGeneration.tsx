import React, { FC } from 'react';
import Image from 'next/image';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { Button } from '@/components/ui/button';
import { TbDownload } from 'react-icons/tb';
import downloadQrCode from '@/utils/utils';
import NoStateIcon from '@/assets/icons/NoStateIcon';

type OutputGenerationProps = {
  isLoading: boolean;
  imageUrl?: string;
};

const OutputGeneration: FC<OutputGenerationProps> = ({ isLoading, imageUrl }) => {
  return (
    <div className='border p-4 rounded-lg w-full md:w-1/2 mt-5 md:mt-0'>
      {isLoading ? (
        <div className='flex flex-col items-center justify-center h-full gap-4'>
          <div className='animate-spin text-primary'>
            <AiOutlineLoading3Quarters className='size-8' />
          </div>
          <div className='text-default text-sm font-semibold'>Generating QR</div>
        </div>
      ) : (
        <>
          {imageUrl ? (
            <div className='relative w-fit group'>
              <Image height={400} width={400} alt='QR Image' className='rounded-lg' src={imageUrl} />

              <div className='absolute inset-0 bg-black/30 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg'>
                <Button
                  variant='secondary'
                  onClick={() => downloadQrCode(imageUrl, 'qr-code.png')}
                  className='rounded-full'>
                  <TbDownload className='mr-2' />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className='flex h-full flex-col items-center justify-center space-y-4'>
              <NoStateIcon />
              <p className='text-default text-xl font-semibold text-center'>Generated QR will appear here</p>
              <p className='text-subtle text-sm text-center'>Create to download your QR Code</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OutputGeneration;
