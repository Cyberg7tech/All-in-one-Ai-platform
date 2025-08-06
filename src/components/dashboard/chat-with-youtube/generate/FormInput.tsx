'use client';

import React, { useCallback, useEffect, useState } from 'react';
import InputWrapper from '@/components/InputWrapper';
import { SubmitButton } from '@/components/SubmitButton';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createNewChat, getYoutubeVideoDeatils } from '@/app/dashboard/(apps)/chat-with-youtube/actions';
import { errorToast } from '@/utils/utils';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import ModalLimitExceeded from '../../ModalLimitExceeded';

const summaryOptions = [
  {
    value: 'detialed',
    label: 'Detailed',
  },
  {
    value: 'concise',
    label: 'Concise',
  },
  {
    value: 'short',
    label: 'Short',
  },
  {
    value: 'long',
    label: 'Long',
  },
];

const toneOptions = [
  {
    value: 'formal',
    label: 'Formal',
  },
  {
    value: 'casual',
    label: 'Casual',
  },
  {
    value: 'friendly',
    label: 'Friendly',
  },
  {
    value: 'professional',
    label: 'Professional',
  },
];

const FormInput = () => {
  const [isLoading, setIsLoading] = useState(false);
  // State to check if the user has reached the limit of content creations
  const [limitExceeded, setIsLimitExceeded] = useState(false);

  const router = useRouter();

  //function to check the limit of content creations and set the state accordingly
  const limitUser = useCallback(async () => {
    const supabase = supabaseBrowserClient();

    const { error, count } = await supabase
      .from('chat_with_youtube')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return errorToast(error.message);
    }

    if (count && count >= 5) {
      setIsLimitExceeded(true);
    }
  }, []);

  //checking on load if the user has reached the limit of content creations
  useEffect(() => {
    limitUser();
  }, [limitUser]);

  // This function is called when the form is submitted.
  const handleGeneration = async (formdata: FormData) => {
    if (isLoading) return;

    // If the user has reached the limit of content creations, show a toast message
    if (limitExceeded) {
      errorToast('You have reached the limit of content creations for the trial period.', 'Limit Exceeded');
      return;
    }

    setIsLoading(true);

    const url = formdata.get('url') as string;
    const tone = formdata.get('tone') as string;
    const style = formdata.get('style') as string;

    // Check if all the fields are filled.
    if (!url || !tone || !style) {
      errorToast('Please fill all the fields');
      setIsLoading(false);
      return;
    }

    const isYouTubeUrl = url.includes('youtube.com');

    if (!isYouTubeUrl) {
      errorToast('Please provide a valid YouTube video URL.');
      return;
    }

    try {
      // Get the youtube video title from the video url.
      const data = await getYoutubeVideoDeatils(url);
      if (data.error) {
        throw data.error;
      }

      // Create a new chat with the data.
      const response = await createNewChat(tone, style, data.title!, data.subtitle, url);
      if (typeof response === 'string') {
        throw new Error('Failed to save data in the database.');
      }
      router.replace(`/dashobard/chat-with-youtube/${response.id}`);
    } catch (error) {
      errorToast(`${error}`);
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col justify-center max-w-lg md:w-[512px] mx-auto'>
      {limitExceeded && <ModalLimitExceeded isModalOpen={limitExceeded} />}
      <form className='rounded-lg mt-2'>
        <div className='flex flex-col justify-between h-full'>
          <div className='space-y-2 mb-8'>
            <InputWrapper id='url' label='Enter youtube video link'>
              <Input
                id='url'
                name='url'
                placeholder='Type in the content you want'
                autoFocus
                className='bg-transparent'
              />
            </InputWrapper>

            <InputWrapper id='selectStyle' label='Summary output style'>
              <Select name='style'>
                <SelectTrigger>
                  <SelectValue placeholder='In the style of' />
                </SelectTrigger>

                <SelectContent>
                  {summaryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </InputWrapper>

            <InputWrapper id='selectTone' label='Tone'>
              <Select name='tone'>
                <SelectTrigger>
                  <SelectValue placeholder='Select tone' />
                </SelectTrigger>

                <SelectContent>
                  {toneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </InputWrapper>
          </div>

          <SubmitButton
            className='w-full'
            size={'lg'}
            formAction={handleGeneration}
            disabled={isLoading || limitExceeded}>
            Generate
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};

export default FormInput;
