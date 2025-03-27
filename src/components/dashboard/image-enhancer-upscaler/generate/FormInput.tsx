// This component is used to take input from the user and display the generated image.

'use client';

import { FC, useEffect, useState, useCallback } from 'react';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import UploadReferenceImage from './UploadReferenceImage';
import OutputGeneration from './OutputGeneration';
import { generateFn } from '@/app/dashboard/(apps)/image-enhancer-upscaler/actions';
import { cn, errorToast } from '@/utils/utils';
import { SubmitButton } from '@/components/SubmitButton';
import Enhance from '@/assets/icons/enhance.svg';
import Upscale from '@/assets/icons/upscale.svg';
import { Button } from '@/components/ui/button';
import ModalLimitExceeded from '../../ModalLimitExceeded';
import Image from 'next/image';

type FormInputProps = {
  inputImage?: string;
  outputImage?: string | null;
};

type FormFields = {
  input_image: string;
};

const FormInput: FC<FormInputProps> = ({ inputImage, outputImage }) => {
  const supabase = supabaseBrowserClient();
  const router = useRouter();

  const initialData: FormFields = {
    input_image: inputImage ?? '',
  };

  //state to check if the user has reached the limit of content creations
  const [hasLimitExceeded, setHasLimitExceeded] = useState(false);
  const [type, setType] = useState<string>(''); //to check the type of operation to be performed on input image
  const [predictionId, setPredictionId] = useState<string>();
  const [formData, setFormData] = useState<FormFields>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to initiate the image upscaling/enhancing process by calling generateFn from server actions.
  const handleGeneration = async () => {
    if (type === '') {
      errorToast('Please select enhance or upscale type.');
      return;
    }

    const image = formData.input_image;
    if (!image) {
      errorToast('Please enter all the required fields.');
      return;
    }

    setIsLoading(true);
    const response = await generateFn(image, type);
    // Handle response from the server action function.
    // If the response is a string then it is an error message, otherwise it is the prediction id.
    if (typeof response === 'string') {
      errorToast(response);
      setIsLoading(false);
    } else {
      setPredictionId(response.id);
    }
  };

  // Relatime Subscribes to database changes to receive updates on design generation status and results.
  useEffect(() => {
    const channel = supabase
      .channel('value-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'image_enhancer_upscaler',
        },
        async (payload) => {
          if (payload.new.prediction_id === predictionId && payload.new.output_image) {
            router.push(`/dashboard/image-enhancer-upscaler/${payload.new.id}`);
          }
        }
      )
      .subscribe();

    // Clean-up function to unsubscribe from the channel.
    return () => {
      channel.unsubscribe();
    };
  }, [predictionId, supabase, router]);

  //function to check the limit of content creations and set the state accordingly
  const limitUser = useCallback(async () => {
    const supabase = supabaseBrowserClient();
    const { error, count } = await supabase
      .from('image_enhancer_upscaler')
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

  return (
    <div>
      <div className='flex lg:flex-row flex-col gap-3 lg:gap-2 mt-2 max-md:pb-4'>
        {hasLimitExceeded && <ModalLimitExceeded isModalOpen={hasLimitExceeded} />}
        <div className='border p-4 rounded-lg w-full flex flex-col gap-4 md:h-[450px]'>
          <form className='space-y-4'>
            <UploadReferenceImage
              image={formData.input_image}
              onImageChange={(value) => setFormData({ ...formData, input_image: value })}
            />

            <div className='flex gap-2 w-full md:flex-row flex-col'>
              <Button
                variant='secondary'
                type='button'
                onClick={() => setType('enhance')}
                className={cn('w-1/2 gap-2', type === 'enhance' && 'border-2 border-primary/30')}>
                <Image src={Enhance} alt='Upscale' width={30} height={30} className='size-4 dark:invert' />
                Enhance Image
              </Button>
              <Button
                variant='secondary'
                type='button'
                onClick={() => setType('upscale')}
                className={cn('w-1/2 gap-2', type === 'upscale' && 'border-2 border-primary/30')}>
                <Image src={Upscale} alt='Upscale' width={30} height={30} className='size-4 dark:invert' />
                Upscale Image
              </Button>
            </div>

            <SubmitButton
              disabled={hasLimitExceeded}
              isLoading={isLoading}
              formAction={handleGeneration}
              className='w-full'>
              Generate Image
            </SubmitButton>
          </form>
        </div>

        {/* Display output */}
        <OutputGeneration isLoading={isLoading} imageUrl={outputImage} type={type} />
      </div>
    </div>
  );
};

export default FormInput;
