// This component is used to take input from the user and display the generated designs.

'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { TypeInteriorDesign } from '@/types/types';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import InputWrapper from '@/components/InputWrapper';
import UploadReferenceImage from './UploadReferenceImage';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import ModalSelectRoomTheme from './ModalSelectRoomTheme';
import OutputGeneration from './OutputGeneration';
import { generateDesignFn } from '@/app/dashboard/(apps)/interior-design-generator/actions';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn, errorToast } from '@/utils/utils';
import { SubmitButton } from '@/components/SubmitButton';
import { roomOptions, roomThemes } from './content';
import { toast } from '@/components/ui/use-toast';
import ModalLimitExceeded from '../../ModalLimitExceeded';

type FormInputProps = {
  data?: TypeInteriorDesign;
};

type FormFields = {
  prompt: string;
  image: string;
  roomType: string;
  theme: string;
};

const FormInput: FC<FormInputProps> = ({ data }) => {
  const [hasLimitExceeded, setHasLimitExceeded] = useState(false);

  const supabase = supabaseBrowserClient();
  const router = useRouter();

  //function to check the limit of content creations and set the state accordingly
  const limitUser = useCallback(async () => {
    const { error, count } = await supabase
      .from('interior_designs')
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

  //TODO change the initial data to match the data structure
  const initialData: FormFields = {
    prompt: data?.prompt ?? '',
    image: data?.ref_image ?? '',
    roomType: data?.room_type ?? roomOptions[0].value,
    theme: data?.theme ?? roomThemes[0].name,
  };

  const [predictionId, setPredictionId] = useState<string>();
  const [generatedData, setGeneratedData] = useState<{
    image_urls: string[];
    id: string;
    theme: string;
  }>({
    image_urls: data?.image_urls ?? [],
    id: data?.id ?? '',
    theme: data?.theme ?? '',
  });
  const [formData, setFormData] = useState<FormFields>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to initiate the design generation process by calling generateDesignFn from server actions.
  const handleGeneration = async (inputFormData: FormData) => {
    if (hasLimitExceeded) {
      return toast({
        description: 'You have reached the limit of content creations. Please upgrade to continue.',
        variant: 'destructive',
      });
    }
    const prompt = inputFormData.get('prompt') as string;
    const roomType = inputFormData.get('roomType') as string;

    const randomTheme = inputFormData.get('theme') as string;
    const randomImage = inputFormData.get('image') as string;

    const theme = randomTheme ?? formData.theme;
    const image = randomImage ?? formData.image;

    if (!prompt || !theme || !roomType || !image) {
      errorToast('Please enter all the required fields.');
      return;
    }

    setIsLoading(true);

    const response = await generateDesignFn(prompt, theme, roomType, image);
    // Handle response from the server action function.
    // If the response is a string then it is an error message, otherwise it is the prediction id.
    if (typeof response === 'string') {
      errorToast(response);
      setIsLoading(false);
    } else {
      setPredictionId(response.id);
    }
  };

  // Function to handle generation of random room
  const handleRandomRoomGeneration = () => {
    const randomData = {
      prompt: 'Generate a bedroom with a modern design',
      image: 'https://i.pinimg.com/736x/1d/ca/70/1dca70b45500dfe77e36e138f1fd86b1.jpg',
      roomType: 'bedroom',
      theme: 'Bohemian',
    };

    setFormData(randomData);

    const formDataObject = new FormData();
    Object.entries(randomData).forEach(([key, value]) => {
      formDataObject.append(key, value);
    });

    // Call the handleGeneration function with the formData object
    handleGeneration(formDataObject);
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
          table: 'interior_designs',
        },
        async (payload) => {
          if (payload.new.prediction_id === predictionId && payload.new.image_urls) {
            setGeneratedData({
              image_urls: payload.new.image_urls,
              id: payload.new.id,
              theme: payload.new.output_style,
            });
            setIsLoading(false);
            // Refresh the current page to reflect changes.
            router.replace(`generate/${payload.new.id}`);
            router.refresh();
          }
        }
      )
      .subscribe();

    // Clean-up function to unsubscribe from the channel.
    return () => {
      channel.unsubscribe();
    };
  }, [predictionId, supabase, router]);

  return (
    <div>
      {hasLimitExceeded && <ModalLimitExceeded isModalOpen={hasLimitExceeded} />}
      <p className='text-default font-semibold mb-2'>Let’s create a room</p>
      <div className='block md:flex gap-4'>
        <div className='border p-4 rounded-lg w-full md:w-2/5 lg:w-3/12'>
          <form>
            <UploadReferenceImage
              image={formData.image}
              onImageChange={(value) => setFormData({ ...formData, image: value })}
            />

            <Separator className='my-4' />

            {/* Select toom type */}
            <InputWrapper id='selectRoom' label='Select Room' className='mb-4'>
              <Select
                name='roomType'
                value={formData.roomType}
                onValueChange={(value) => setFormData({ ...formData, roomType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder='Choose' />
                </SelectTrigger>
                <SelectContent>
                  {roomOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </InputWrapper>

            {/* Section to select room theme */}
            <div className='mb-4'>
              <div className='flex items-center justify-between mb-2'>
                <p className='text-default font-medium text-sm'>Room Theme</p>
                <ModalSelectRoomTheme
                  handleSelectRoom={(room) => setFormData({ ...formData, theme: room })}
                  selected={formData.theme}
                />
              </div>

              <div className='overflow-x-auto flex flex-nowrap gap-2'>
                {/* Show first 5, and rest in the modal when view more. */}
                {roomThemes.slice(0, 5).map((room, index) => (
                  <div
                    key={index}
                    onClick={() => setFormData((prev) => ({ ...prev, theme: room.name }))}
                    className={cn(
                      'relative flex flex-col justify-center items-center cursor-pointer border-4 border-transparent w-36',
                      formData.theme === room.name && 'border-blue-600 rounded-lg'
                    )}>
                    <div className='w-32 h-28 rounded overflow-hidden'>
                      <Image
                        src={room.image}
                        alt={room.name}
                        width={120}
                        height={120}
                        className='object-cover h-28 w-32'
                      />
                    </div>
                    <Badge variant='transparent' className='absolute bottom-2'>
                      {room.name}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt input */}
            <InputWrapper id='prompt' label='Instructions' className='mb-4'>
              <Textarea
                id='prompt'
                name='prompt'
                placeholder='Enter prompt'
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              />
            </InputWrapper>

            {/* Generate button */}
            <SubmitButton
              className='w-full'
              isLoading={isLoading}
              disabled={hasLimitExceeded}
              formAction={handleGeneration}>
              Generate Image
            </SubmitButton>
          </form>
        </div>

        {/* Display output */}
        <OutputGeneration
          isLoading={isLoading}
          data={generatedData!}
          disabled={hasLimitExceeded}
          handleRandomRoomGeneration={handleRandomRoomGeneration}
        />
      </div>
    </div>
  );
};

export default FormInput;
