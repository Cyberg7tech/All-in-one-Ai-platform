'use client';

import React, { FC, useCallback, useEffect, useState } from 'react';
import { BiCopy, BiLoaderCircle } from 'react-icons/bi';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { convertToEmbedUrl, errorToast } from '@/utils/utils';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { ingestFileInVector } from '@/app/dashboard/(apps)/chat-with-youtube/actions';
import { useRouter } from 'next/navigation';
import { TypeYoutubeChat } from '@/types/types';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface SummaryProps {
  data: TypeYoutubeChat;
}

const Summary: FC<SummaryProps> = ({ data }) => {
  const supabase = supabaseBrowserClient();
  const router = useRouter();

  const [summary, setSummary] = useState<string>(data?.summary || '');
  const [activeTab, setActiveTab] = useState<string>('summary');

  // Function to copy the summary to the clipboard
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

  // Function to handle summary stream
  const handleStream = async (data: ReadableStream) => {
    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let streamData = '';

    // Append the stream data to the state
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      streamData += chunkValue;
      setSummary((prev) => prev + chunkValue);
    }

    return streamData;
  };

  // Function to generate the summary of the transcription by making api call to '/api/chat-with-youtube/summary'
  const generateSummary = useCallback(async (transcription: string, tone: string, style: string) => {
    const response = await fetch('/api/chat-with-youtube/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcription, tone, style }),
    });

    if (!response.ok) {
      errorToast('Please try again later.');
      return;
    }

    // Stream response from the server (api call)
    const streamResponse = response.body;
    if (!streamResponse) {
      errorToast('Failed to get transcription summary. Please try again later.');
      return;
    }
    return await handleStream(streamResponse);
  }, []);

  useEffect(() => {
    if (summary) return;

    // Function to fetch the transcription summary
    const fetchSummary = async () => {
      try {
        // Ingest the transcription text into the vector system
        if (!data.ingestion_done) {
          const response = await ingestFileInVector(data.transcription, data.id);
          if (response) {
            throw new Error(response);
          }
        }

        const summary = await generateSummary(data.transcription, data.tone, data.style);
        if (summary) {
          await supabase.from('chat_with_youtube').update({ summary }).eq('id', data.id);
        }
        router.refresh();
      } catch (error) {
        errorToast(`${error}`);
      }
    };
    fetchSummary();
  }, [data, summary, router, generateSummary, supabase]);

  return (
    <>
      <iframe
        src={convertToEmbedUrl(data.url)}
        title='YouTube video player'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        referrerPolicy='strict-origin-when-cross-origin'
        className='h-48 sm:h-72 w-full rounded'
      />
      {summary ? (
        <div className='p-4 mt-4 space-y-4 text-default border rounded'>
          <Tabs defaultValue='summary' onValueChange={setActiveTab}>
            <div className='flex justify-between mb-4'>
              <TabsList>
                <TabsTrigger value='summary'>Summary</TabsTrigger>
                <TabsTrigger value='transcription'>Transcription</TabsTrigger>
              </TabsList>
              <Button variant='outline' size='icon' onClick={handleCopy} className='size-7'>
                <BiCopy className='size-4' />
              </Button>
            </div>

            <TabsContent value='summary'>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                className='font-medium text-sm leading-6 space-y-2 text-justify'>
                {summary}
              </ReactMarkdown>
            </TabsContent>
            <TabsContent value='transcription'>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                className='font-medium text-sm leading-6 space-y-2 text-justify'>
                {data.transcription}
              </ReactMarkdown>
            </TabsContent>
          </Tabs>

          <p className='text-xs text-muted-foreground font-medium'>
            {format(new Date(data.created_at), 'MMM dd, yyyy')}
          </p>
        </div>
      ) : (
        <div className='p-4 mt-4 border rounded overflow-hidden flex justify-center items-center gap-3 h-1/2'>
          <BiLoaderCircle className='animate-spin size-6 text-default' />
          <p className='font-medium text-sm leading-6'>Generating summary...</p>
        </div>
      )}
    </>
  );
};

export default Summary;
