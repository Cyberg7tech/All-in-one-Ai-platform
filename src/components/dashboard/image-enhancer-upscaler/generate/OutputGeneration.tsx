// This component is responsible for displaying the outputs of enhancing/.
// It uses Tabs to toggle between viewing current outputs and historical data.
// It also allows users to select historical outputs to view or use as new inputs.

'use client';

import React, { FC } from 'react';
import downloadImage from '@/utils/utils';
import { TbDownload } from 'react-icons/tb';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import NoStateIcon from '@/assets/icons/NoStateIcon';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

type OutputGenerationProps = {
  type: string;
  imageUrl?: string | null;
  isLoading?: boolean;
};

// Shows a blurred image while the actual image is loading.
const blurImageDataUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEXSURBVHgBVZDPSsNAEMa//dP8WVOheFToJejBKh7E4hMIXn0FwcfwrQSvPoFevFQUIdrE0NBTXRPTcbJrxc4yLHzz229nRtzd3lCy2YdJ+og5oyiG1hpSKwhICAEXWrGgdYBeEPLdg1TKp5AOEL8kaxqqc+Ci4tr8PcP11SUuzs/+IO/YAdq70HeLx4d7JIMBtmyNpq4RhKEHheQ+GArDCDGL6f4I6egQL08TlHmO7eHQg0RLgLgHfmCbBvOiwPQtg+2K/NMqZFM3WLYtiAgbxiCvKuzs7kGsBmETZ0RuIp6CtS+7wPHJGCaKYGLTkcz4o4/Gp8wIB05fn5FNuLfyA0VZIl0cwNpPtzZRzWYknDthPVj5J/0AA1VXn/cQBtkAAAAASUVORK5CYII=';

const OutputGeneration: FC<OutputGenerationProps> = ({ isLoading, imageUrl, type }) => {
  return (
    <div className='border p-4 rounded-lg w-full'>
      {isLoading ? (
        <div className='size-full flex flex-col bg-border dark:bg-border/50 items-center justify-center gap-4 rounded-lg '>
          <AiOutlineLoading3Quarters className='animate-spin text-primary size-8' />
          <p>{type === 'enhance' ? 'Enhancing' : 'Upscaling'}</p>
        </div>
      ) : imageUrl ? (
        <div className=' relative flex flex-col justify-center items-center h-full'>
          <Image
            src={imageUrl}
            alt=''
            width={260}
            height={260}
            className='border rounded-md object-cover w-full max-h-[480px]'
            placeholder='blur'
            blurDataURL={blurImageDataUrl}
          />

          {/* Download option on hover  */}
          <div className='absolute inset-0 bg-black/30 flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity duration-300 h-auto cursor-pointer '>
            <Button
              variant='secondary'
              onClick={async () => await downloadImage(imageUrl, 'Generated_image.png')}
              className='rounded-full'>
              <TbDownload className='mr-2' />
              Download
            </Button>
          </div>
        </div>
      ) : (
        <div className='size-full flex flex-col justify-center items-center'>
          <div className='space-y-5 w-full md:max-w-sm flex flex-col justify-center items-center text-center'>
            <NoStateIcon />
            <p className='text-default font-semibold text-xl'>Generated images will appear here</p>
            <p className='text-center text-subtle text-sm'>Looks like you haven't created anything yet!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutputGeneration;
