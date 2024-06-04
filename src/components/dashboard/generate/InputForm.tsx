'use client';

import React, { useCallback, useEffect, useState } from 'react';
import OutputContent from './OutputContent';
import InputWrapper from '@/components/InputWrapper';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/SubmitButton';
import { errorToast } from '@/utils/utils';
import { saveContent } from '@/app/(dashboard)/home/actions';
import { TypeContent } from '@/types/types';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import ModalLimitExceeded from './ModalLimitExceeded';

type Props = {
  generatedData?: TypeContent | null;
};

type FormFields = {
  topic: string;
  style: string;
  wordLimit: string;
  voice: string;
};

const prompts = [
  {
    topic: 'AI news show',
    style:
      'Write in a scholarly tone, utilising accurate, authoritative sources and citations. Ensure that your...',
    wordLimit: '300',
    voice: 'formal',
  },
  {
    topic: 'Virtual Reality',
    style:
      'Write in a conversational tone, using simple language and examples to explain complex concepts...',
    wordLimit: '400',
    voice: 'formal',
  },
];

const InputForm = ({ generatedData }: Props) => {
  const [formData, setFormData] = useState<FormFields>({
    topic: generatedData?.topic ?? '',
    style: generatedData?.style ?? '',
    wordLimit: generatedData?.word_limit ?? '',
    voice: generatedData?.voice ?? '',
  });

  const parsedContentData = generatedData?.results ? JSON.parse(generatedData.results) : {};

  const [contentData, setContentData] = useState(parsedContentData.content_ideas ?? []);
  // State to check if the user has reached the limit of content creations
  const [hasLimitExceeded, setHasLimitExceeded] = useState(false);

  //function to check the limit of content creations and set the state accordingly
  const limitUser = useCallback(async () => {
    const supabase = supabaseBrowserClient();

    const { error, count } = await supabase
      .from('content_creations')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return errorToast(error.message);
    }
    if (count && count >= 5) {
      setHasLimitExceeded(true);
    }
  }, []);

  //checking on load if the user has reached the limit of content creations
  useEffect(() => {
    limitUser();
  }, [limitUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handles the streaming of content generation data from the server response
  const handleStream = async (data: ReadableStream) => {
    const reader = data.getReader();
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
      setContentData(parsedData.content_ideas);
    }

    return streamData;
  };

  const handleGeneration = async () => {
    const { topic, style, wordLimit, voice } = formData;

    if (!topic || !style || !wordLimit || !voice) {
      errorToast('Please fill all required fields');
      return;
    }

    // Makes an api call to /api/generate and receives a stream response
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      errorToast('Something went wrong, please try again');
      return;
    }

    const data = res.body;
    if (!data) {
      errorToast('Something went wrong, please try again');
      return;
    }

    // Handle the stream data
    const streamData = await handleStream(data);

    // Save the generated content once the stream is complete
    await saveContent(topic, style, wordLimit, voice, streamData).catch((error) => errorToast(error));
  };

  return (
    <div className='block lg:flex items-start space-y-10 lg:space-y-0'>
      <ModalLimitExceeded isModalOpen={hasLimitExceeded} />

      <div className='w-full lg:w-1/2 mr-0 lg:mr-8'>
        <form className='space-y-3'>
          <InputWrapper id='topic' label='What do you want to Generate?'>
            <Input
              id='topic'
              name='topic'
              placeholder='AI news show'
              autoFocus
              value={formData.topic}
              onChange={handleInputChange}
            />
          </InputWrapper>

          <InputWrapper id='wordLimit' label='Word Limit'>
            <Input
              id='wordLimit'
              name='wordLimit'
              placeholder='120'
              value={formData.wordLimit}
              onChange={handleInputChange}
            />
          </InputWrapper>

          <InputWrapper id='style' label='Style'>
            <Input
              id='style'
              name='style'
              placeholder='Educational, Facts, Entertainment'
              value={formData.style}
              onChange={handleInputChange}
            />
          </InputWrapper>

          <InputWrapper id='voice' label='Voice'>
            <Input
              id='voice'
              name='voice'
              placeholder='Elon Musk, David Perrel, Sahil Bloom etc'
              value={formData.voice}
              onChange={handleInputChange}
            />
          </InputWrapper>

          <SubmitButton disabled={hasLimitExceeded} className='w-full !mt-8' formAction={handleGeneration}>
            Generate
          </SubmitButton>
        </form>

        <hr className='my-8' />

        <p className='font-semibold text-sm mb-4 text-default'>Start with one of these Prompts 👇🏻</p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {prompts.map((item, index) => (
            <div
              key={index}
              className='px-4 py-5 space-y-2 border rounded cursor-pointer'
              onClick={() => {
                setFormData({
                  ...item,
                });
              }}>
              <p className='font-semibold text-default'>{item.topic}</p>
              <p className='text-sm text-subtle'>{item.style}</p>
            </div>
          ))}
        </div>
      </div>
      <OutputContent contentData={contentData} />
    </div>
  );
};

export default InputForm;
