'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PiCopy } from 'react-icons/pi';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';

interface ModalOutputProps {
  transcription: string;
  summary: string;
  audio_url: string;
  children?: React.ReactNode;
  defualtOpen?: boolean;
}

const ModalOutput: React.FC<ModalOutputProps> = ({
  transcription,
  summary,
  audio_url,
  children,
  defualtOpen = false,
}) => {
  const [activeTab, setActiveTab] = useState<string>('summary');

  const handleTabChange: (value: string) => void = (value) => {
    setActiveTab(value);
  };

  const copyContentToClipboard = () => {
    navigator.clipboard
      .writeText(activeTab === 'summary' ? summary : transcription)
      .then(() => {
        toast({ description: 'Text copied to clipboard' });
      })
      .catch(() => {
        toast({ description: 'Failed to copy text to clipboard', variant: 'destructive' });
      });
  };

  return (
    <Dialog defaultOpen={defualtOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='max-w-3xl w-full'>
        <div>
          <p className='text-default text-center text-lg font-semibold mb-5'>
            {transcription.length && transcription.length > 60
              ? `${transcription.slice(0, 60)}...`
              : transcription}
          </p>
          <Tabs defaultValue='summary' onValueChange={handleTabChange}>
            <TabsList className='mb-5 mx-auto w-full'>
              <TabsTrigger value='summary'>Summary</TabsTrigger>
              <TabsTrigger value='transcript'>Transcript</TabsTrigger>
            </TabsList>

            <audio controls className='mb-5 w-full'>
              <source src={audio_url} type='audio/mpeg' />
            </audio>

            <TabsContent className='text-subtle text-sm mb-5 mt-0' value='transcript'>
              {transcription}
            </TabsContent>
            <TabsContent className='text-subtle text-sm mb-5 mt-0' value='summary'>
              {summary}
            </TabsContent>
          </Tabs>

          <Button
            variant='secondary'
            className='w-full text-default gap-1.5'
            onClick={copyContentToClipboard}>
            <PiCopy className='size-4' />
            Copy Text
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalOutput;
