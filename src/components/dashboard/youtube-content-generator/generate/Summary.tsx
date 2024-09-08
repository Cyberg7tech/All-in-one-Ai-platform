'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { BiCopy } from 'react-icons/bi';
import GenerateContent from './GenerateContent';
import { TypeYoutubeContent } from '@/types/types';
import { convertToEmbedUrl, errorToast } from '@/utils/utils';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { AiOutlineLoading } from 'react-icons/ai';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';

type SummaryProps = {
  data: TypeYoutubeContent;
};

const Summary: FC<SummaryProps> = ({ data }) => {
  const supabase = supabaseBrowserClient();
  const [summary, setSummary] = useState<string>(data.summary || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('summary');

  const router = useRouter();
  const embedUrl = convertToEmbedUrl(data.url);

  const handleStream = async (data: ReadableStream) => {
    setLoading(false);
    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let streamData = '';

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      streamData += chunkValue;
      setSummary((prev) => prev + chunkValue);
    }

    return streamData;
  };

  // Function to generate the summary of the transcription by making api call to '/api/youtube-content-generator/summary'
  const generateSummary = useCallback(async (subTitle: string) => {
    try {
      const response = await fetch('/api/youtube-content-generator/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from the server');
      }

      const responseBody = response.body;

      if (!responseBody) {
        throw new Error('Something went wrong, please try again');
      }

      return await handleStream(responseBody);
    } catch (error: any) {
      errorToast(error.message || 'Failed to get transcription summary. Please try again later.');
      return null;
    }
  }, []);

  const handleCopy = () => {
    const content = activeTab === 'summary' ? summary : data.transcription;

    navigator.clipboard
      .writeText(content)
      .then(() => {
        toast({ description: 'Text copied to clipboard' });
      })
      .catch(() => {
        errorToast('Failed to copy text to clipboard');
      });
  };

  useEffect(() => {
    if (data.summary) return;

    (async () => {
      setLoading(true);
      try {
        const summary = await generateSummary(data.transcription);
        if (summary) {
          await supabase.from('youtube_content_generator').update({ summary }).eq('id', data.id);
        }
        router.refresh();
      } catch (error) {
        errorToast('Failed to get transcription summary. Please try again later.');
      } finally {
        setLoading(false);
      }
    })();
  }, [data, router, generateSummary, supabase]);

  return (
    <div className='block lg:flex justify-between gap-4 h-[calc(100vh-86px)] space-y-10 lg:space-y-0'>
      <div className='w-full lg:w-1/2 border rounded-lg overflow-auto'>
        <div className='space-y-4 p-4'>
          <p className='font-semibold text-xl leading-8'>{data.youtube_title}</p>
          <iframe
            className='h-48 sm:h-72 w-full rounded-lg'
            src={embedUrl}
            title={data.youtube_title}
            allowFullScreen
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          />

          <div className='space-y-2.5'>
            {loading ? (
              <div className='flex flex-col items-center justify-center'>
                <AiOutlineLoading className='animate-spin size-6 mb-2' />
                <p className='text-sm font-medium leading-6 text-justify'>Loading summary...</p>
              </div>
            ) : (
              // Tab component to switch between summary and transcription
              <Tabs defaultValue='summary' onValueChange={setActiveTab}>
                <div className='flex justify-between mb-4'>
                  <TabsList>
                    <TabsTrigger value='summary'>Summary</TabsTrigger>
                    <TabsTrigger value='transcription'>Transcription</TabsTrigger>
                  </TabsList>
                  <div className='flex justify-between items-center'>
                    <Button variant='outline' size='icon' onClick={handleCopy} className='size-7'>
                      <BiCopy className='size-4' />
                    </Button>
                  </div>
                </div>

                <TabsContent value='summary'>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    className='text-sm font-medium leading-6 text-justify space-y-2'>
                    {summary}
                  </ReactMarkdown>
                </TabsContent>
                <TabsContent value='transcription'>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    className='text-sm font-medium leading-6 text-justify space-y-2'>
                    {data.transcription}
                  </ReactMarkdown>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>

      <GenerateContent data={data} />
    </div>
  );
};

export default Summary;
