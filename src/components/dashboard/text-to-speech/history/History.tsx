'use client';

import { TypeTTS } from '@/types/types';
import { Button } from '@/components/ui/button';
import SpeakerIcon from '@/assets/icons/Speaker';
import { formatDistanceToNow } from 'date-fns';
import DropdownAction from './DropdownAction';
import AudioPlayer from './AudioPlayer';
import Link from 'next/link';

interface HistoryProps {
  data: TypeTTS[];
}

export function History({ data }: HistoryProps) {
  if (data.length === 0) {
    return (
      <div className='md:w-1/3 h-full flex flex-col justify-center items-center m-auto gap-4'>
        <SpeakerIcon />
        <p className='text-xl text-default font-medium text-center'>Generated speech will appear here</p>
        <p className='text-subtle font-light'>Click on the below button to generate</p>
        <Link href='/home' className='w-5/6'>
          <Button className='w-full'>Generate text to speech</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='w-full max-h-[500px] grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 overflow-auto'>
      {data.map((item, index) => (
        <div key={index}>
          <div className='h-48 flex items-center justify-center bg-[#FFEFE8] rounded-2xl relative'>
            <SpeakerIcon isPlayer={true} />
            <AudioPlayer audioUrl={item.audio_url} />
          </div>
          <div className='flex items-center justify-between mt-2'>
            <div className='space-y-1'>
              <p className='text-xs md:text-sm font-semibold text-default'>{item.title}</p>
              <p className='text-xs text-subtle'>
                Created{' '}
                {formatDistanceToNow(item.created_at, {
                  includeSeconds: true,
                })}{' '}
                ago
              </p>
            </div>

            <DropdownAction id={item.id} audioUrl={item.audio_url} title={item.title} />
          </div>
        </div>
      ))}
    </div>
  );
}
