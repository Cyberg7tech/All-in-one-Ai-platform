'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SubmitButton } from '@/components/SubmitButton';
import { errorToast } from '@/utils/utils';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import InputWrapper from '@/components/InputWrapper';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { Textarea } from '@/components/ui/textarea';
import { CgOptions } from 'react-icons/cg';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RiUserVoiceLine } from 'react-icons/ri';
import { modelOptions, TypeModels, voiceOptions } from './content';
import { saveGeneratedAudio } from '@/app/dashboard/(apps)/text-to-speech/actions';
import { useRouter } from 'next/navigation';
import { upload } from '@/app/dashboard/(apps)/text-to-speech/storage';
import ModalLimitExceeded from '../../ModalLimitExceeded';

export type FormFields = {
  content: string;
  model: TypeModels;
  voice: string;
};

const maxTextLength = 200;

const FormInput = () => {
  const [limitExceeded, setIsLimitExceeded] = useState(false);
  const [formData, setFormData] = useState<FormFields>({
    content: '',
    model: modelOptions[0].value,
    voice: voiceOptions[modelOptions[0].value][0].value, // Set default voice to the first option of OpenAI
  });
  const [audio, setAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const router = useRouter();

  // function to check the limit of content creations and set the state accordingly
  const limitUser = useCallback(async () => {
    const supabase = supabaseBrowserClient();

    const { error, count } = await supabase
      .from('text_to_speech')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return errorToast(error.message);
    }

    if (count && count >= 5) {
      setIsLimitExceeded(true);
    }
  }, []);

  // Checking on load if the user has reached the limit of content creations
  useEffect(() => {
    limitUser();
  }, [limitUser]);

  // Update voice when model changes
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      voice: voiceOptions[prevData.model][0].value,
    }));
  }, [formData.model]);

  useEffect(() => {
    if (audioRef.current && audio) {
      audioRef.current.load();
    }
  }, [audio]);

  const handleStreaming = async (data: ReadableStream<Uint8Array>) => {
    const reader = data.getReader();

    let done = false;
    const chunks: Uint8Array[] = [];

    if (reader) {
      // Append the stream data to the contentData state as it arrives
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          chunks.push(value);
        }
      }
    }

    if (chunks.length == 0) {
      throw 'Failed to generate audio';
    }

    // Combine all chunks into a single Blob
    const blob = new Blob(chunks, { type: 'audio/mpeg' });
    return blob;
  };

  const handleGeneration = async () => {
    try {
      setAudio(null);

      // If the user has reached the limit of content creations, show a toast message
      if (limitExceeded) {
        errorToast('You have reached the limit of content creations for the trial period.', 'Limit Exceeded');
        return;
      }

      if (!formData.content) {
        throw 'Text content is required to generate audio';
      }

      const response = await fetch('/api/text-to-speech/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      if (response.body == null) {
        throw 'Invalid data. Failed to generate audio';
      }

      const audioBlob = await handleStreaming(response.body);
      setAudio(URL.createObjectURL(audioBlob));
      const { url: audioUrl } = await upload(audioBlob);

      const saveResponse = await saveGeneratedAudio({ audioUrl, formData });
      if (saveResponse?.error) {
        throw saveResponse.error;
      }
      router.refresh();
    } catch (error: any) {
      errorToast(error);
    }
  };

  return (
    <div className='w-full flex flex-col justify-center mx-auto'>
      {limitExceeded && <ModalLimitExceeded isModalOpen={limitExceeded} />}

      <form className='rounded-lg my-2'>
        <div className='flex flex-col justify-between h-full'>
          <div className='space-y-4 mb-8'>
            <InputWrapper
              id='content'
              label='Enter text'
              extraOption={<IoDocumentTextOutline size={18} />}
              comment={`${formData.content.length}/${maxTextLength}`}>
              <Textarea
                id='content'
                name='content'
                placeholder='This is a professional text-to-speech program that converts any written text into spoken words.'
                autoFocus
                maxLength={maxTextLength}
                rows={3}
                className='shadow-none'
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </InputWrapper>

            <div className='flex gap-6'>
              <InputWrapper id='model' label='Model' extraOption={<CgOptions size={18} />}>
                <Select
                  name='model'
                  value={formData.model}
                  onValueChange={(value) => setFormData({ ...formData, model: value as TypeModels })}>
                  <SelectTrigger className='h-11'>
                    <SelectValue placeholder='Select Model' />
                  </SelectTrigger>

                  <SelectContent>
                    {modelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </InputWrapper>

              <InputWrapper id='voice' label='Voice' extraOption={<RiUserVoiceLine size={16} />}>
                <Select
                  name='voice'
                  value={formData.voice}
                  onValueChange={(value) => setFormData({ ...formData, voice: value })}>
                  <SelectTrigger className='h-11'>
                    <SelectValue placeholder='Select Voice' />
                  </SelectTrigger>

                  <SelectContent>
                    {voiceOptions[formData.model].map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </InputWrapper>
            </div>
          </div>

          <SubmitButton className='w-full' size='lg' formAction={handleGeneration} disabled={limitExceeded}>
            Generate
          </SubmitButton>
        </div>
      </form>

      {audio !== null && (
        <div className='mt-10 space-y-4'>
          <p className='text-default font-semibold text-sm'>Output</p>
          <audio
            ref={audioRef}
            controls
            className='w-full h-9 rounded-lg bg-[#f1f3f4] dark:bg-[#3b3b3b]'
            key={audio}>
            <source src={audio} type='audio/mpeg' />
          </audio>
        </div>
      )}
    </div>
  );
};

export default FormInput;
