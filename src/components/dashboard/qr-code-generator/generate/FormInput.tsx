// This component provides an input form for QR code generation. And shows the generated QR code in the OutputGeneration component.
// It collects 'url' and 'prompt' through an input form and uses `generateQrCodeFn` for backend processing.
// On successful QR code generation, updates the imageUrl state and triggers a page refresh.

'use client';

import React, { FC, useCallback, useEffect, useState } from 'react';
import InputWrapper from '@/components/InputWrapper';
import { SubmitButton } from '@/components/SubmitButton';
import { Input } from '@/components/ui/input';
import OutputGeneration from './OutputGeneration';
import { TypeQrCodeGeneration } from '@/types/types';
import { toast } from '@/components/ui/use-toast';
import { generateQrCodeFn } from '@/app/dashboard/(apps)/qr-code-generator/actions';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import UpgradePlan from '@/components/dashboard/UpgradePlan';
import { Button } from '@/components/ui/button';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import ModalLimitExceeded from '@/components//dashboard/qr-code-generator/generate/ModalLimitExceeded';

type FormInputProps = {
  data: TypeQrCodeGeneration[];
};

type FormFields = {
  url: string;
  prompt: string;
};

const promptSuggestions = [
  'A thar desert',
  'A tropical paradise beach',
  'A misty mountain adventure',
  'An urban skyline view',
];

const FormInput: FC<FormInputProps> = () => {
  const [imageUrl, setImageUrl] = useState<string>();
  const [formData, setFormData] = useState<FormFields>({ url: '', prompt: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [hasLimitExceeded, setHasLimitExceeded] = useState(false);

  const router = useRouter();

  //function to check the limit of content creations and set the state accordingly
  const limitUser = useCallback(async () => {
    const supabase = supabaseBrowserClient();
    const { error, count } = await supabase
      .from('qr_code_generations')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return toast({ description: error.message, variant: 'destructive' });
    }
    if (count && count >= 5) {
      setHasLimitExceeded(true);
    }
  }, []);

  //checking on load if the user has reached the limit of content creations
  useEffect(() => {
    limitUser();
  }, [limitUser]);

  // This function update the state of the form fields on input change.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // It triggers the QR code generation process and updates the imageUrl state on success.
  const handleGeneration = async (data: FormData) => {
    setIsLoading(true);
    const response = await generateQrCodeFn(data);
    if (typeof response == 'string') {
      toast({ description: response, variant: 'destructive' });
    } else {
      setImageUrl(response.image_url!);
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <div className='flex flex-col justify-between h-[calc(100vh-87px)]'>
      <ModalLimitExceeded isModalOpen={hasLimitExceeded} />

      <div className='block md:flex gap-4'>
        <form className='border p-4 rounded-lg w-full md:w-1/2'>
          <div className='flex flex-col justify-between h-full'>
            <div className='space-y-6 mb-4'>
              <InputWrapper id='url' label='Enter URL'>
                <Input
                  id='url'
                  name='url'
                  placeholder='builderkit.ai'
                  autoFocus
                  value={formData.url}
                  onChange={handleInputChange}
                />
              </InputWrapper>

              <InputWrapper id='prompt' label='Prompt'>
                <Textarea
                  id='prompt'
                  name='prompt'
                  placeholder='Enter your prompt here'
                  rows={3}
                  value={formData.prompt}
                  onChange={handleInputChange}
                />
              </InputWrapper>

              <InputWrapper label='Prompt suggestions'>
                <div className='grid lg:grid-cols-2 gap-3'>
                  {promptSuggestions.map((prompt, index) => (
                    <Button
                      key={index}
                      type='button'
                      variant='outline'
                      className='font-normal  rounded-lg'
                      onClick={() => setFormData({ ...formData, prompt })}>
                      {prompt}
                    </Button>
                  ))}
                </div>
              </InputWrapper>
            </div>

            <SubmitButton className='w-full mt-1' formAction={handleGeneration} disabled={hasLimitExceeded}>
              Generate the QR
            </SubmitButton>
          </div>
        </form>
        <OutputGeneration isLoading={isLoading} imageUrl={imageUrl} />
      </div>
      <UpgradePlan />
    </div>
  );
};

export default FormInput;
