'use client';

import { Input } from '@/components/ui/input';
import { useCallback, useEffect, useState } from 'react';
import { FaArrowRight } from 'react-icons/fa6';
import { SubmitButton } from '@/components/SubmitButton';
import { errorToast } from '@/utils/utils';
import { useRouter } from 'next/navigation';
import { getYoutubeVideoDetails } from '@/app/dashboard/(apps)/youtube-content-generator/actions';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import ModalLimitExceeded from '../../ModalLimitExceeded';

const InputForm = () => {
  // State to check if the user has reached the limit of content creations
  const [hasLimitExceeded, setHasLimitExceeded] = useState(false);

  const supabase = supabaseBrowserClient();
  const router = useRouter();

  const handleGeneration = async (formData: FormData) => {
    try {
      const url = formData.get('url') as string;
      if (!url) {
        throw 'Please provide YouTube video URL.';
      }

      const isYouTubeUrl = url.includes('youtube.com');
      if (!isYouTubeUrl) {
        throw 'Please provide a valid YouTube video URL.';
      }

      const response = await getYoutubeVideoDetails(url);
      if (response.error) {
        throw response.error;
      }

      router.replace(`/dashboard/youtube-content-generator/${response.id}`);
    } catch (error) {
      errorToast(`${error}`);
    }
  };

  //function to check the limit of content creations and set the state accordingly
  const limitUser = useCallback(async () => {
    const { error, count } = await supabase
      .from('youtube_content_generator')
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

  return (
    <>
      {hasLimitExceeded && <ModalLimitExceeded isModalOpen={hasLimitExceeded} />}

      <form className='mt-11 w-full flex items-center mx-auto max-w-2xl relative'>
        <Input
          placeholder='https://youtube.com/'
          className='rounded-md pl-4 pr-10 py-2 border w-full'
          type='url'
          name='url'
          autoFocus
        />
        <SubmitButton
          size='icon'
          variant='secondary'
          className='rounded-r-md absolute right-0 top-0 h-full rounded-l-none border'
          disabled={hasLimitExceeded}
          formAction={handleGeneration}>
          <FaArrowRight />
        </SubmitButton>
      </form>
    </>
  );
};

export default InputForm;
