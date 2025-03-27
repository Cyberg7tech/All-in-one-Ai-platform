// This component serves as the primary interface for the AI Image Generation feature.
// It includes form inputs to configure the image generation parameters like model, prompt, etc.
// The component uses several nested components like InputWrapper, Select, and OutputGeneration to build the UI.

'use client';

import React, { FC, useCallback, useEffect, useState } from 'react';
import InputWrapper from '@/components/InputWrapper';
import { SubmitButton } from '@/components/SubmitButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import OutputGeneration from './OutputGeneration';
import { TypeImageGeneration } from '@/types/types';
import { toast } from '@/components/ui/use-toast';
import { generateImageFn } from '@/app/dashboard/(apps)/image-generator/actions';
import { imageModels } from '@/app/dashboard/(apps)/image-generator/models';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import Demo1 from '@/assets/images/demo-1.jpg';
import Demo2 from '@/assets/images/demo-2.jpg';
import { Badge } from '@/components/ui/badge';
import ModalLimitExceeded from '../../ModalLimitExceeded';

type FormInputProps = {
  data: TypeImageGeneration[];
};

type FormFields = {
  model: string;
  prompt: string;
  'neg-prompt': string;
  'no-of-outputs': string;
  guidance: string;
  inference: string;
};

const initialData: FormFields = {
  model: imageModels[0].value, // Set the default model from available models.
  prompt: '',
  'neg-prompt': '',
  'no-of-outputs': '1',
  guidance: '10',
  inference: '50',
};

const FormInput: FC<FormInputProps> = () => {
  const supabase = supabaseBrowserClient();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictionId, setPredictionId] = useState<string>();
  const [generatedImages, setGeneratedImages] = useState<any | null>();
  const [formData, setFormData] = useState<FormFields>(initialData);

  // State to check if the user has reached the limit of content creations
  const [hasLimitExceeded, setHasLimitExceeded] = useState(false);
  const router = useRouter();

  //function to check the limit of content creations and set the state accordingly
  const limitUser = useCallback(async () => {
    const { error, count } = await supabase
      .from('image_generations')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return toast({ description: error.message, variant: 'destructive' });
    }
    if (count && count >= 5) {
      setHasLimitExceeded(true);
    }
  }, [supabase]);

  //checking on load if the user has reached the limit of content creations
  useEffect(() => {
    limitUser();
  }, [limitUser]);

  // Handles changes in form inputs and updates the state accordingly.
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to initiate the image generation process by calling generateImageFn from server actions.
  const handleGeneration = async (data: FormData) => {
    if (hasLimitExceeded) {
      toast({
        description: 'You have reached the limit of content creations. Upgrade to continue.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);

    const response = await generateImageFn(data);

    if (typeof response == 'string') {
      toast({ description: response, variant: 'destructive' });
      setIsLoading(false);
    } else {
      setPredictionId(response.id);
    }
  };

  // Relatime Subscribes to database changes to receive updates on image generation status and results.
  useEffect(() => {
    const channel = supabase
      .channel('value-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'image_generations',
        },
        async (payload) => {
          if (payload.new.prediction_id === predictionId && payload.new.image_urls) {
            setGeneratedImages(payload.new);
            setIsLoading(false);
            // Refresh the current page to reflect changes.
            router.refresh();
          }
        }
      )
      .subscribe();

    // Clean-up function to unsubscribe from database changes.
    return async () => {
      await supabase.removeChannel(channel);
    };
    return () => {};
  }, [predictionId, supabase, router]);

  const handleRandomImageGeneration = () => {
    const randomData = {
      model: imageModels[0].value,
      prompt: 'A beautiful landscape with a river flowing through the mountains',
      'neg-prompt': 'A dark and gloomy forest with no sunlight',
      'no-of-outputs': '4',
      guidance: '10',
      inference: '50',
    };

    setFormData(randomData);

    const formDataObject = new FormData();
    Object.entries(randomData).forEach(([key, value]) => {
      formDataObject.append(key, value);
    });

    // Call the handleGeneration function with the formData object
    handleGeneration(formDataObject);
  };

  const images = [
    { src: Demo1, alt: 'model-output', model: 'SX XL' },
    { src: Demo2, alt: 'model-output', model: 'Pixar' },
  ];

  return (
    <div>
      {hasLimitExceeded && <ModalLimitExceeded isModalOpen={hasLimitExceeded} />}

      <p className='text-default font-semibold mb-2'>Let's generate a new image</p>
      <div className='block md:flex gap-4'>
        <div className='border p-4 rounded-lg w-full md:w-2/5 lg:w-1/4'>
          <form>
            <div className='flex flex-col gap-6 mb-5'>
              <InputWrapper label='Select Model'>
                <Select
                  name='model'
                  value={formData.model}
                  onValueChange={(value) => setFormData({ ...formData, model: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {imageModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </InputWrapper>

              <div className='bg-border dark:bg-border/50 rounded-lg p-2'>
                <p className='text-subtle text-xs font-medium mb-1'>Model output sample</p>
                <div className='grid grid-cols-2 gap-1 w-fit'>
                  {images.map((image, index) => (
                    <div key={index} className='relative flex flex-col justify-center items-center'>
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={200}
                        height={200}
                        className='h-full rounded'
                      />
                      <Badge className='absolute bottom-2' variant='transparent'>
                        {image.model}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <InputWrapper id='prompt' label='Prompt'>
                <Textarea
                  id='prompt'
                  name='prompt'
                  placeholder='Image Prompt'
                  autoFocus
                  value={formData.prompt}
                  onChange={handleInputChange}
                />
              </InputWrapper>

              <div className='flex flex-col md:flex-row gap-6 md:gap-2'>
                <InputWrapper id='no-of-outputs' label='No. of images' description='(min: 1, max: 4)'>
                  <Input
                    type='number'
                    min={1}
                    max={4}
                    id='no-of-outputs'
                    name='no-of-outputs'
                    value={formData['no-of-outputs']}
                    onChange={handleInputChange}
                  />
                </InputWrapper>
                <InputWrapper id='guidance' label='Guidance' description='(min: 1, max: 50)'>
                  <Input
                    type='number'
                    min={1}
                    max={50}
                    id='guidance'
                    name='guidance'
                    value={formData.guidance}
                    onChange={handleInputChange}
                  />
                </InputWrapper>
                <InputWrapper id='inference' label='Inference' description='(min: 1, max: 500)'>
                  <Input
                    type='number'
                    min={1}
                    max={500}
                    id='inference'
                    name='inference'
                    value={formData.inference}
                    onChange={handleInputChange}
                  />
                </InputWrapper>
              </div>

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
            <SubmitButton
              className='w-full'
              isLoading={isLoading}
              disabled={hasLimitExceeded}
              formAction={handleGeneration}>
              Generate Image
            </SubmitButton>
          </form>
        </div>
        <OutputGeneration
          data={generatedImages}
          isLoading={isLoading}
          disabled={hasLimitExceeded}
          loaders={Number(formData['no-of-outputs'])}
          handleRandomImageGeneration={handleRandomImageGeneration}
        />
      </div>
    </div>
  );
};

export default FormInput;
