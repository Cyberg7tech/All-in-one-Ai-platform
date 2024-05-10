import MachinLerningIcon from '@/assets/icons/MachinLerningIcon';
import { toast } from '@/components/ui/use-toast';
import { errorToast } from '@/utils/utils';
import React from 'react';
import { IoMdCopy } from 'react-icons/io';

type Content = {
  title: string;
  description: string;
};

type Props = {
  contentData: Content[];
};

const OutputContent = ({ contentData }: Props) => {
  return (
    <div className='w-full lg:w-1/2 pl-0 lg:pl-8 lg:border-l border-[#ECECEC] dark:border-[#272626]'>
      {contentData.length > 0 ? (
        <p className='text-sm font-medium mb-4'>Output</p>
      ) : (
        <p className='text-base font-medium text-center mb-16 mt-10 text-input-title dark:text-white'>
          Your output will be displayed here
        </p>
      )}
      {contentData.length > 0 ? (
        <div className='space-y-5 overflow-auto max-h-[calc(100vh-130px)]'>
          {contentData.map((content, index) => (
            <div key={index} className='border border-[#EEE] dark:border-[#272626] p-4 rounded-lg '>
              <div className='flex justify-between items-start'>
                <p className='text-lg font-medium text-[#333333] dark:text-[#E5E7EB] mb-2'>
                  {content?.title}
                </p>

                <IoMdCopy
                  className='size-10 p-1 rounded border text-[#3e3e3e] border-[#EEE] dark:border-[#272626] cursor-pointer'
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
              <p className='text-base text-[#4B5563] dark:text-[#9CA3AF]'>{content.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className='flex justify-center'>
          <MachinLerningIcon />
        </div>
      )}
    </div>
  );
};

export default OutputContent;
