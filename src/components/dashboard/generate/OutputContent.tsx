import { toast } from '@/components/ui/use-toast';
import { errorToast } from '@/utils/utils';
import React from 'react';
import { BiCopy } from 'react-icons/bi';
import ZeroState from '@/assets/images/zero-state.png';
import Image from 'next/image';

type Content = {
  title: string;
  description: string;
};

type Props = {
  contentData: Content[];
};

const OutputContent = ({ contentData }: Props) => {
  return (
    <div className='w-full lg:w-1/2 pl-0 lg:pl-8 lg:border-l'>
      {contentData.length > 0 ? (
        <p className='text-sm font-medium mb-4'>Output</p>
      ) : (
        <p className='text-base font-medium text-center mb-16 mt-10 text-default'>
          Your output will be displayed here
        </p>
      )}
      {contentData.length > 0 ? (
        <div className='space-y-5 overflow-auto h-full lg:max-h-[calc(100vh-122px)]'>
          {contentData.map((content, index) => (
            <div key={index} className='border p-4 rounded-lg '>
              <div className='flex justify-between items-start'>
                <p className='text-lg font-medium text-default mb-2'>{content?.title}</p>

                <BiCopy
                  className='size-8 p-1.5 rounded border text-default cursor-pointer'
                  onClick={() => {
                    navigator.clipboard
                      .writeText(`${content.title} \n ${content.description}`)
                      .then(() => {
                        toast({ title: 'Content copied to clipboard', variant: 'default' });
                      })
                      .catch(() => {
                        errorToast("Couldn't copy content to clipboard");
                      });
                  }}
                />
              </div>
              <p className='text-sm text-default font-medium text-justify'>{content.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className='flex justify-center'>
          <Image src={ZeroState} height={478} width={478} alt='zero-state' />
        </div>
      )}
    </div>
  );
};

export default OutputContent;
