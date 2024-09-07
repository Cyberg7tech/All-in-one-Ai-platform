// This component is responsible for displaying the outputs of the interior design generation process.
// It uses Tabs to toggle between viewing current outputs and historical data.
// It also allows users to select historical outputs to view or use as new inputs.

'use client';

import { FC } from 'react';
import NoStateIcon from '@/assets/icons/NoStateIcon';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaDownload } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export interface IGeneratedMusic {
  url?: string;
  prompt?: string;
}

type OutputGenerationProps = {
  music?: IGeneratedMusic;
  isLoading: boolean;
};

const OutputGeneration: FC<OutputGenerationProps> = ({ music, isLoading }) => {
  return (
    <div className='w-full md:w-3/5 border p-4 rounded-lg dark:bg-gray-800'>
      {isLoading ? (
        <div className='size-full flex flex-col bg-gray-100 dark:bg-gray-700 items-center justify-center gap-4 rounded-lg'>
          <AiOutlineLoading3Quarters className='animate-spin text-primary size-8' />
          <p className='text-lg font-medium'>Generating music for you!</p>
        </div>
      ) : music ? (
        <div className='space-y-8'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-bold text-accent-foreground'>Generated Music</h2>
            <Link href={`${music.url}?download=output.mp3`}>
              <Button variant='outline' className='rounded-full gap-2'>
                <FaDownload />
                <span>Download</span>
              </Button>
            </Link>
          </div>

          <audio controls className='w-full h-11 rounded-lg bg-[#f1f3f4] dark:bg-[#3b3b3b]'>
            <source src={music.url} type='audio/mpeg' />
            Your browser does not support the audio element.
          </audio>

          <div className='bg-[#f1f3f4] dark:bg-[#3b3b3b] p-4 rounded-lg'>
            <h3 className='text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300'>Prompt:</h3>
            <p className='text-gray-600 dark:text-gray-300 text-sm leading-relaxed'>{music.prompt}</p>
          </div>
        </div>
      ) : (
        <div className='size-full flex flex-col justify-center items-center text-center'>
          <div className='space-y-5 w-full md:max-w-sm flex flex-col justify-center items-center'>
            <NoStateIcon />
            <p className='text-default font-semibold text-xl'>Generated Music will appear here</p>
            <p className='text-gray-600 dark:text-gray-400 text-sm leading-loose'>
              Looks like you haven't created anything yet! <br /> Fill in the form and click generate to
              create your music.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutputGeneration;
