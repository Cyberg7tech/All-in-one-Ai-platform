import { toast } from '@/components/ui/use-toast';
import { errorToast } from '@/utils/utils';
import React from 'react';
import { BiCopy } from 'react-icons/bi';
import ZeroState from '@/assets/images/zero-state.png';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

type Props = {
  contentData: string;
};

const OutputContent = ({ contentData }: Props) => {
  return (
    <div className='w-full lg:w-1/2 px-1 lg:px-6 lg:border-l'>
      {contentData.length > 0 ? (
        <>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium'>Output</p>
            <BiCopy
              className='size-8 p-1.5 rounded border text-default cursor-pointer'
              onClick={() => {
                navigator.clipboard
                  .writeText(contentData)
                  .then(() => {
                    toast({ title: 'Content copied to clipboard', variant: 'default' });
                  })
                  .catch(() => {
                    errorToast("Couldn't copy content to clipboard");
                  });
              }}
            />
          </div>
          <div className='lg:max-h-[calc(100vh-150px)] sm:pr-2 overflow-auto'>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              className='text-sm font-medium leading-6 text-justify space-y-2 markdown'>
              {contentData}
            </ReactMarkdown>
          </div>
        </>
      ) : (
        <>
          <p className='text-base font-medium text-center mb-16 mt-10 text-default'>
            Your output will be displayed here
          </p>
          <div className='flex justify-center'>
            <Image src={ZeroState} height={478} width={478} alt='zero-state' />
          </div>
        </>
      )}
    </div>
  );
};

export default OutputContent;
