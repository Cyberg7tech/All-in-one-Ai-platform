'use client';

import { TypeMusic } from '@/types/types';
import { FC } from 'react';
import NoStateIcon from '@/assets/icons/NoStateIcon';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FaDownload } from 'react-icons/fa';

type HistoryGridProps = {
  data: TypeMusic[];
};

const HistoryGrid: FC<HistoryGridProps> = ({ data }) => {
  return (
    <div>
      <h1 className='text-xl font-medium text-default my-4'>History</h1>

      {data?.length > 0 ? (
        <div className='h-[calc(100vh-150px)] grow overflow-auto'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {data.map((item) => (
              <div className='p-4 rounded-lg dark:bg-gray-800 border shadow-md' key={item.id}>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <h2 className='text-lg font-semibold text-accent-foreground truncate'>
                      {item.genre} - {item.mood}
                    </h2>
                    <Link href={`${item.music_url}?download=output.mp3`}>
                      <Button variant='outline' size='sm' className='gap-2 rounded-full'>
                        <FaDownload />
                        <span>Download</span>
                      </Button>
                    </Link>
                  </div>

                  <audio controls className='w-full h-10 rounded-lg bg-[#f1f3f4] dark:bg-[#3b3b3b]'>
                    <source src={item.music_url || ''} type='audio/mpeg' />
                    Your browser does not support the audio element.
                  </audio>

                  <div className='bg-[#f1f3f4] dark:bg-[#3b3b3b] p-3 rounded-lg'>
                    <h3 className='text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300'>Prompt:</h3>
                    <p className='text-gray-600 dark:text-gray-300 text-xs leading-relaxed'>{item.prompt}</p>
                  </div>

                  <p className='text-xs text-gray-500'>
                    Created: {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center h-72'>
          <NoStateIcon />
          <p className='text-lg text-subtle my-5'>No Music Available</p>
          <Link href='/generate'>
            <Button variant='default'>Generate New Music</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default HistoryGrid;
