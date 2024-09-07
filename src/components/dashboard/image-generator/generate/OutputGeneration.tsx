// This component is responsible for displaying the outputs of the image generation process.
// It uses Tabs to toggle between viewing current outputs and historical data.
// It also allows users to select historical outputs to view or use as new inputs.

'use client';

import { FC } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { Button } from '@/components/ui/button';
import { TiArrowShuffle } from 'react-icons/ti';
import NoStateIcon from '@/assets/icons/NoStateIcon';
import { TypeImageGeneration } from '@/types/types';
import ModalViewImage from '../ModalViewImage';

type OutputGenerationProps = {
  data?: TypeImageGeneration;
  isLoading?: boolean;
  disabled?: boolean;
  loaders: number;
  handleRandomImageGeneration: () => void;
};

const OutputGeneration: FC<OutputGenerationProps> = ({
  data,
  isLoading,
  disabled,
  loaders,
  handleRandomImageGeneration,
}) => {
  const imageUrls = data?.image_urls;

  return (
    <div className='border p-4 rounded-lg w-full md:w-3/5 lg:w-3/4 my-5 md:my-0'>
      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Array.from({ length: loaders }).map((_, index) => (
            <div
              key={index}
              className='h-64 w-full flex flex-col bg-border dark:bg-border/50 items-center justify-center gap-4 rounded-lg'>
              <AiOutlineLoading3Quarters className='animate-spin text-primary size-8' />
              <p>Generating images</p>
            </div>
          ))}
        </div>
      ) : (
        <>
          {imageUrls && imageUrls.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {imageUrls.map((imageUrl, index) => (
                <div key={index} className='group relative flex flex-col justify-center items-center'>
                  <ModalViewImage data={data} imageUrl={imageUrl} isFooter={false} />
                </div>
              ))}
            </div>
          ) : (
            <div className='space-y-5 size-full flex flex-col justify-center items-center'>
              <NoStateIcon />
              <p className='text-default font-semibold text-xl'>Generated Image will appear here</p>
              <p className='text-center text-subtle text-sm '>
                Looks like you haven't created anything yet! Click the button and then click generate
              </p>
              <Button className='gap-2' onClick={handleRandomImageGeneration} disabled={disabled}>
                <TiArrowShuffle />
                Generate random image
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OutputGeneration;
