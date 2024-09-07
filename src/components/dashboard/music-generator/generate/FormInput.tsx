// This component is used to take input from the user and display the generated music.

'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { TypeMusic } from '@/types/types';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import InputWrapper from '@/components/InputWrapper';
import { Textarea } from '@/components/ui/textarea';
import { SubmitButton } from '@/components/SubmitButton';
import { toast } from '@/components/ui/use-toast';
import OutputGeneration, { IGeneratedMusic } from './OutputGeneration';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { BsFillClockFill } from 'react-icons/bs';
import { BiHappyBeaming } from 'react-icons/bi';
import { PiMusicNoteFill } from 'react-icons/pi';
import { BsTextareaT } from 'react-icons/bs';
import { errorToast } from '@/utils/utils';
import { generateMusicFn } from '@/app/dashboard/(apps)/music-generator/actions/generate-music.actions';
import { useRouter } from 'next/navigation';
import ModalLimitExceeded from '../../ModalLimitExceeded';

type FormInputProps = {
  data?: TypeMusic;
};

type FormFields = {
  prompt: string;
  genre: string;
  mood: string;
  duration: number;
};

const genreOptions = ['Pop', 'Rock', 'Jazz', 'Classical', 'EDM', 'Hip Hop', 'Country', 'Ambient'];
const moodOptions = ['Happy', 'Sad', 'Energetic', 'Calm', 'Dark', 'Romantic'];

const FormInput: FC<FormInputProps> = ({ data }) => {
  const [hasLimitExceeded, setHasLimitExceeded] = useState(false);

  const initialData: FormFields = {
    prompt: data?.prompt ?? '',
    genre: data?.genre ?? genreOptions[0],
    mood: data?.mood ?? moodOptions[0],
    duration: data?.duration ? data.duration : 30,
  };
  const [formData, setFormData] = useState<FormFields>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [predictionId, setPredictionId] = useState<string>();
  const [generatedMusic, setGeneratedMusic] = useState<IGeneratedMusic>();

  const supabase = supabaseBrowserClient();

  const router = useRouter();

  //function to check the limit of content creations and set the state accordingly
  const limitUser = useCallback(async () => {
    const { error, count } = await supabase
      .from('music_generations')
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

  // Function to initiate the music generation process by calling from server actions.
  const handleGeneration = async () => {
    try {
      if (hasLimitExceeded) {
        throw 'You have reached the limit of content creations. Please upgrade to continue.';
      }

      if (!formData.prompt) {
        throw 'Prompt is required to generate a music';
      }

      setIsLoading(true);

      const { id, error } = await generateMusicFn(formData);
      if (error) {
        throw error;
      }
      setPredictionId(id);
    } catch (error) {
      errorToast(`${error}`);
      setIsLoading(false);
    }
  };

  // Relatime Subscribes to database changes to receive updates on music generation status and results.
  useEffect(() => {
    const channel = supabase
      .channel('value-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'music_generations',
        },
        async (payload) => {
          if (payload.new.prediction_id === predictionId) {
            if (payload.new.error || payload.new.music_url === null) {
              errorToast(payload.new.error ?? 'Music generation failed.');
            } else {
              setGeneratedMusic({
                url: payload.new.music_url,
                prompt: payload.new.prompt,
              });
            }
            setIsLoading(false);
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
    <>
      {hasLimitExceeded && <ModalLimitExceeded isModalOpen={hasLimitExceeded} />}

      <div className='h-[calc(100vh-150px)] flex flex-col md:flex-row gap-4'>
        <div className='w-full md:w-2/5 border p-4 rounded-lg'>
          <form className='space-y-8'>
            {/* Prompt input */}
            <InputWrapper id='prompt' label='Prompt' extraOption={<BsTextareaT size={18} />}>
              <Textarea
                id='prompt'
                name='prompt'
                placeholder='Edo25 major g melodies that sound triumphant and cinematic. Leading up to a crescendo that resolves in a 9th harmonic'
                required
                rows={5}
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              />
            </InputWrapper>

            {/* Select genre */}
            <InputWrapper id='selectGenre' label='Genre' extraOption={<PiMusicNoteFill size={18} />}>
              <Select
                name='genre'
                value={formData.genre}
                onValueChange={(value) => setFormData({ ...formData, genre: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genreOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </InputWrapper>

            {/* Select mood */}
            <InputWrapper id='selectMood' label='Mood' extraOption={<BiHappyBeaming size={18} />}>
              <Select
                name='mood'
                value={formData.mood}
                onValueChange={(value) => setFormData({ ...formData, mood: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {moodOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </InputWrapper>

            {/* Select duration */}
            <InputWrapper
              id='selectDuration'
              label='Music Duration'
              comment='Max 60 sec'
              extraOption={<BsFillClockFill />}>
              <div className='flex items-center gap-4'>
                <Slider
                  defaultValue={[formData.duration]}
                  min={5}
                  max={60}
                  step={1}
                  onValueChange={(value) => setFormData({ ...formData, duration: value[0] })}
                />
                <p className='w-24 text-sm'>
                  {formData.duration} <span className='text-subtle font-light'>seconds</span>
                </p>
              </div>
            </InputWrapper>

            {/* Generate button */}
            <SubmitButton className='w-full' disabled={hasLimitExceeded} formAction={handleGeneration}>
              Generate Music
            </SubmitButton>
          </form>
        </div>

        {/* Display output */}
        <OutputGeneration isLoading={isLoading} music={generatedMusic} />
      </div>
    </>
  );
};

export default FormInput;
