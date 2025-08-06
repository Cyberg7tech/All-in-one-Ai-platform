import { TypeAudio } from '@/types/types';
import React, { FC } from 'react';
import { format } from 'date-fns';
import ModalDeleteTranscription from './ModalDeleteTranscription';
import ModalOutput from '../generate/ModalOutput';

type HistoryGridType = {
  data: TypeAudio[];
};

const HistoryGrid: FC<HistoryGridType> = ({ data }) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mr-2'>
      {data.map((item) => (
        <div key={item.id} className='border p-6 rounded-lg'>
          <ModalOutput
            transcription={item.transcription ?? ''}
            summary={item.summary ?? ''}
            audio_url={item.audio_url ?? ''}>
            <div className='cursor-pointer'>
              <p className='line-clamp-1 text-default font-semibold mb-2 capitalize'>{item.transcription}</p>
              <p className='line-clamp-3 text-default text-sm mb-6'>{item.transcription}</p>
            </div>
          </ModalOutput>
          <div className='flex items-center justify-between'>
            <p className='text-subtle text-xs font-semibold text-pretty'>
              {format(item.created_at, 'MMM dd, yyyy')}
            </p>
            <ModalDeleteTranscription id={item.id} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryGrid;
