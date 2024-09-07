// This component handles input for generating headshots using a predefined AI model.
// It manages user input through a form, updating local state on each input change.
// The form submission triggers an API call to generate headshots, and handles the response asynchronously.
// Uses `useEffect` to listen for changes via a real-time database subscription and updates the UI accordingly.

'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { TypeHeadshotModel } from '@/types/types';
import InputWrapper from '@/components/InputWrapper';
import { SubmitButton } from '@/components/SubmitButton';
import { errorToast, sentenceCase } from '@/utils/utils';
import { Textarea } from '@/components/ui/textarea';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import OutputGeneration from './OutputGeneration';
import { Input } from '@/components/ui/input';
import { generateHeadshotFn } from '@/app/dashboard/(apps)/headshot-generator/[id]/actions';
import ModalLimitExceeded from '@/components/dashboard/ModalLimitExceeded';

interface FormInputProps {
  model: TypeHeadshotModel;
}

type FormFields = {
  prompt: string;
  'neg-prompt': string;
};

const FormInput: FC<FormInputProps> = ({ model }) => {
  const supabase = supabaseBrowserClient();

  const [isPending, setIsPending] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormFields>({ prompt: '', 'neg-prompt': '' });
  const [generationId, setGenerationId] = useState<string>();
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [hasLimitExceeded, setHasLimitExceeded] = useState(false);

  const router = useRouter();

  //function to check the limit of content creations and set the state accordingly
  const limitUser = useCallback(async () => {
    const { error, count } = await supabase
      .from('headshot_generations')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return errorToast(error.message);
    }
    if (count && count >= 5) {
      setHasLimitExceeded(true);
    }
  }, [supabase]);

  //checking on load if the user has reached the limit of content creations
  useEffect(() => {
    limitUser();
  }, [limitUser]);

  // Handle input change for the form fields and update the formData state with user input data
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Asynchronously triggered by form submission, this function sends data to the server to initiate headshot generation.
  // It handles pre and post request states, displaying error messages or updating the generation ID upon success.
  const handleGeneration = async (data: FormData) => {
    setIsPending(true);

    // Call the generateHeadshotFn function to generate headshots from server actions
    const response = await generateHeadshotFn(model.model_id, data);
    if (typeof response == 'string') {
      errorToast(response);
      setIsPending(false);
    } else {
      setGenerationId(response.id);
    }
  };

  // Realtime database subscription to listen for changes in the generated images.
  // This subscription gets triggered only if the row is updated with new image URLs. It doesn't respond to insert or delete.
  useEffect(() => {
    const channel = supabase
      .channel('value-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'headshot_generations',
        },
        async (payload) => {
          // Update images state if the generation ID matches the payload and the image URLs are present
          if (payload.new.id === generationId && payload.new.image_urls) {
            setGeneratedImages(payload.new.image_urls);
            setIsPending(false);
            router.replace(`/dashboard/headshot-generator/${model.model_id}/${payload.new.id}`);
            router.refresh();
          }
        }
      )
      .subscribe();

    // Clear the channel subscription when the component unmounts
    return async () => {
      await supabase.removeChannel(channel);
    };
    return () => {};
  }, [generationId, supabase, router, model.model_id]);

  return (
    <div className='block lg:flex items-start space-y-5 lg:space-y-0'>
      {hasLimitExceeded && <ModalLimitExceeded isModalOpen={hasLimitExceeded} />}

      <div className='w-full lg:w-1/2 mr-0 lg:mr-7'>
        <div className='mb-6'>
          <p className='font-semibold text-default'>Model: {sentenceCase(model.name)}</p>
        </div>

        <form className='flex flex-col justify-between px-1'>
          <div className='flex flex-col gap-4 mb-8'>
            <InputWrapper id='prompt' label='Describe the image to be generated'>
              <Textarea
                id='prompt'
                name='prompt'
                placeholder='Write a detailed description of the image you want to generate.'
                rows={6}
                value={formData.prompt}
                onChange={handleInputChange}
              />
            </InputWrapper>

            <InputWrapper id='neg-prompt' label='Negative Prompt'>
              <Input
                id='neg-prompt'
                name='neg-prompt'
                placeholder='Negative Prompt'
                value={formData['neg-prompt']}
                onChange={handleInputChange}
              />
            </InputWrapper>
          </div>

          <SubmitButton className='w-full' formAction={handleGeneration} disabled={hasLimitExceeded}>
            Generate
          </SubmitButton>
        </form>
      </div>

      {/* Section to show generated results. It has two tabs output data & history */}
      <OutputGeneration isPending={isPending} generatedImages={generatedImages} />
    </div>
  );
};

export default FormInput;
