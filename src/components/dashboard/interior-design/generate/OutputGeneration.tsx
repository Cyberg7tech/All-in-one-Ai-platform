// This component is responsible for displaying the outputs of the interior design generation process.
// It uses Tabs to toggle between viewing current outputs and historical data.
// It also allows users to select historical outputs to view or use as new inputs.

'use client';

import React, { FC } from 'react';
import downloadImage from '@/utils/utils';
import { TbDownload } from 'react-icons/tb';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { TiArrowShuffle } from 'react-icons/ti';
import { Badge } from '@/components/ui/badge';
import NoStateIcon from '@/assets/icons/NoStateIcon';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

type OutputGenerationProps = {
  data: { image_urls: string[]; id: string; theme: string };
  handleRandomRoomGeneration: () => void;
  isLoading?: boolean;
  disabled?: boolean;
};

// Shows a blurred image while the actual image is loading.
const blurImageDataUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEXSURBVHgBVZDPSsNAEMa//dP8WVOheFToJejBKh7E4hMIXn0FwcfwrQSvPoFevFQUIdrE0NBTXRPTcbJrxc4yLHzz229nRtzd3lCy2YdJ+og5oyiG1hpSKwhICAEXWrGgdYBeEPLdg1TKp5AOEL8kaxqqc+Ci4tr8PcP11SUuzs/+IO/YAdq70HeLx4d7JIMBtmyNpq4RhKEHheQ+GArDCDGL6f4I6egQL08TlHmO7eHQg0RLgLgHfmCbBvOiwPQtg+2K/NMqZFM3WLYtiAgbxiCvKuzs7kGsBmETZ0RuIp6CtS+7wPHJGCaKYGLTkcz4o4/Gp8wIB05fn5FNuLfyA0VZIl0cwNpPtzZRzWYknDthPVj5J/0AA1VXn/cQBtkAAAAASUVORK5CYII=';

const OutputGeneration: FC<OutputGenerationProps> = ({
  data,
  handleRandomRoomGeneration,
  isLoading,
  disabled,
}) => {
  return (
    <div className='border p-4 rounded-lg w-full md:w-3/5 lg:w-4/5 my-5 md:my-0'>
      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className='h-64 w-full flex flex-col bg-border dark:bg-border/50 items-center justify-center gap-4 rounded-lg'>
              <AiOutlineLoading3Quarters className='animate-spin text-primary size-8' />
              <p>Generating room</p>
            </div>
          ))}
        </div>
      ) : data.image_urls.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {data.image_urls.map((item, index) => (
            <div key={index} className='group relative flex flex-col justify-center items-center'>
              <Image
                src={item}
                alt=''
                width={260}
                height={260}
                className='border rounded-md mx-auto w-full'
                placeholder='blur'
                blurDataURL={blurImageDataUrl}
              />

              <Badge variant='transparent' className='absolute bottom-2'>
                {data.theme}
              </Badge>
              {/* Download option on hover to a specific design */}
              <div className='absolute inset-0 bg-black/30 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-auto cursor-pointer'>
                <Button
                  variant='secondary'
                  onClick={() => downloadImage(item, 'interior.png')}
                  className='rounded-full'>
                  <TbDownload className='mr-2' />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='size-full flex flex-col justify-center items-center'>
          <div className='space-y-5 w-full md:max-w-sm flex flex-col justify-center items-center'>
            <NoStateIcon />
            <p className='text-default font-semibold text-xl'>Generated Room will appear here</p>
            <p className='text-center text-subtle text-sm'>
              Looks like you haven't created anything yet! Click the button and then click generate
            </p>
            <Button className='gap-2' onClick={handleRandomRoomGeneration} disabled={disabled}>
              <TiArrowShuffle />
              Generate random room
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutputGeneration;
