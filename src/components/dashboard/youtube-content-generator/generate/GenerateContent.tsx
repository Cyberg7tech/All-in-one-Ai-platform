'use client';

import { Separator } from '@/components/ui/separator';
import { FC, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BiCopy } from 'react-icons/bi';
import { cn, errorToast } from '@/utils/utils';
import { AiOutlineLoading } from 'react-icons/ai';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { TypeYoutubeContent } from '@/types/types';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import { toast } from '@/components/ui/use-toast';
import Image from 'next/image';
import ZeroState from '@/assets/images/zero-state.png';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

type GenerateContentProps = {
  data: TypeYoutubeContent;
};

interface ContentItem {
  title: string;
  description: string;
}

const languages = ['English', 'French', 'Hindi', 'Spanish', 'German', 'Japanese', 'Chinese', 'Russian'];

const plantforms = [
  {
    value: 'blog',
    label: 'Generate Blog',
    style: 'bg-[#FFEFE8] dark:bg-[#FFEFE8]/5 text-[#FF740F]',
  },
  {
    value: 'twitter',
    label: 'Generate Twitter ‘X’ Post',
    style: 'bg-[#E8F4FF] dark:bg-[#E8F4FF]/5 text-[#0F6FFF]',
  },
  {
    value: 'reddit',
    label: 'Generate Reddit Post',
    style: 'bg-[#FFE8E8] dark:bg-[#FFE8E8]/5 text-[#FF4500]',
  },
  {
    value: 'linkedin',
    label: 'Generate Linkedin Post',
    style: 'bg-[#E8EEFF] dark:bg-[#E8EEFF]/5 text-[#0836BB]',
  },
];

const GenerateContent: FC<GenerateContentProps> = ({ data }) => {
  const supabase = supabaseBrowserClient();
  const [contentData, setContentData] = useState<ContentItem[]>(
    (data?.generated_content as unknown as ContentItem[]) || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState(data.language || languages[0]);

  const summary = data.summary;

  // Handles the streaming of content generation data from the server response
  const handleStream = async (redablestream: ReadableStream) => {
    const reader = redablestream.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let streamData = '';

    // Append the stream data to the contentData state as it arrives
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      streamData += chunkValue;
    }

    if (done) {
      const parsedData = JSON.parse(streamData);
      // Explicitly provide type annotation for prevContentData
      setContentData((prevContentData: any[]) => [...parsedData.content_ideas, ...prevContentData]);

      // Save the generated content once the stream is complete
      const { error } = await supabase
        .from('youtube_content_generator')
        .update({ generated_content: [...parsedData.content_ideas, ...contentData], language })
        .eq('id', data.id);

      if (error) {
        errorToast(error.message);
      }
    }

    return streamData;
  };

  const handleGenerate = async (type: string) => {
    setIsLoading(true);

    if (!summary || !language || !type) {
      throw new Error('Please provide all the required fields');
    }

    try {
      const res = await fetch('/api/youtube-content-generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, summary, language }),
      });

      if (!res.ok) {
        throw new Error('Failed to get response from the server');
      }

      const responseBody = res.body;
      if (!responseBody) {
        throw new Error('Something went wrong, please try again');
      }

      // Handle the stream data
      await handleStream(responseBody);
    } catch (error: any) {
      errorToast(error?.message ?? `${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (containerClassName: string) => {
    // Get the text content of the container element bec
    const textContent = document.querySelector(containerClassName)?.textContent || '';

    navigator.clipboard
      .writeText(textContent)
      .then(() => {
        toast({ description: 'Text copied to clipboard' });
      })
      .catch(() => {
        toast({ description: 'Failed to copy text to clipboard', variant: 'destructive' });
      });
  };

  return (
    <div className='w-full lg:w-1/2 border rounded-lg overflow-auto'>
      <form className='space-y-6 p-4'>
        <p className='font-semibold'>
          Generate content for different platforms from the provided youtube video
        </p>

        <Separator />

        <div className='space-y-2'>
          <div className='text-default font-semibold text-sm'>Content output language</div>
          <Select onValueChange={(value) => setLanguage(value)} value={language}>
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='mt-3 grid grid-cols-2 gap-2'>
          {plantforms.map((plantform, index) => (
            <Button
              key={index}
              disabled={isLoading || !summary}
              onClick={() => handleGenerate(plantform.value)}
              variant='secondary'
              size='sm'
              className={cn('w-full', plantform.style)}>
              {plantform.label}
            </Button>
          ))}
        </div>

        <Separator />

        <div>
          <p className='text-default font-semibold font-sm leading-6'>Generated content</p>

          {contentData.length > 0 ? (
            <div className='space-y-5'>
              <div className='flex items-center justify-center'>
                {isLoading && <AiOutlineLoading3Quarters className='animate-spin size-8' />}
              </div>
              {contentData.map((content: { title: string; description: string }, index) => (
                <div key={index} className='border rounded-lg p-4 space-y-2'>
                  <div className='flex justify-between items-center'>
                    <p className='text-default text-sm font-bold leading-6'>{content?.title}</p>
                    <BiCopy
                      className='size-8 p-1.5 rounded border text-default cursor-pointer'
                      onClick={() => handleCopy(`.content-${index}`)}
                    />
                  </div>

                  <ReactMarkdown
                    className={cn(`content-${index}`, 'text-subtle text-sm font-medium leading-6 markdown')}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}>
                    {content.description}
                  </ReactMarkdown>
                  <p className='text-muted-foreground text-xs font-medium leading-6'>
                    {format(data.created_at, 'MMM d, yyyy')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex items-center justify-center'>
              {isLoading ? (
                <AiOutlineLoading className='animate-spin size-6' />
              ) : (
                <div className='flex flex-col justify-center items-center'>
                  <Image src={ZeroState} height={150} width={150} alt='zero-state' />
                  <p className='text-subtle font-medium mt-4'>No content generated yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default GenerateContent;
