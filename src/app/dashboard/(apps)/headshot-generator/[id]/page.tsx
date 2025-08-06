// This component is responsible for generating headshots based on a specific model.
// It fetches model details and associated generation history from the database using the model ID.
// The 'FormInput' component is then used to allow users to input positive & negative prompts and initiate new generations.
// It is designed to respond dynamically to the 'id' parameter in the URL path, which represents the model ID.

import FormInput from '@/components/dashboard/headshot-generator/generate/FormInput';
import ModalGeneratedImage from '@/components/dashboard/headshot-generator/generate/ModalGeneratedImage';
import { supabaseServerClient } from '@/utils/supabase/server';
import { IoMdAdd } from 'react-icons/io';
import Link from 'next/link';

type TypeParams = {
  params: { id: string };
  searchParams?: { form: string };
};

export default async function GenerateImage({ params, searchParams }: TypeParams) {
  const supabase = supabaseServerClient();

  const { data: model } = await supabase.from('headshot_models').select().eq('model_id', params.id).single();

  if (model == null) {
    return <p className='text-center mt-10'>Model not found.</p>;
  }

  const { data: generations } = await supabase
    .from('headshot_generations')
    .select()
    .eq('model_id', params.id);

  return (
    <div>
      {searchParams?.form === 'true' ? (
        <FormInput model={model} />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mr-2'>
          <Link href='?form=true'>
            <div className='w-full h-[188px] flex items-center justify-center gap-1 bg-secondary border rounded-md'>
              <IoMdAdd />
              <p className='text-sm font-medium'>Generate headshot</p>
            </div>
          </Link>

          {generations?.map((generation) => (
            <>
              {generation.image_urls?.map((_, index) => (
                <ModalGeneratedImage key={index} index={index} generation={generation} />
              ))}
            </>
          ))}
        </div>
      )}
    </div>
  );
}
