import { supabaseServerClient } from '@/utils/supabase/server';
import EmptyState from '@/assets/images/profile.png';
import Image from 'next/image';
import ModalGeneratedImage from '@/components/dashboard/headshot-generator/generate/ModalGeneratedImage';

const History = async () => {
  const supabase = supabaseServerClient();

  // Get all the previously generated models from the database
  const { data: generations } = await supabase
    .from('headshot_generations')
    .select()
    .order('created_at', { ascending: false })
    .not('image_urls', 'is', null);

  return (
    <div>
      {generations && generations.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mr-2'>
          {generations.map((generation) => (
            <>
              {generation.image_urls?.map((_, index) => (
                <ModalGeneratedImage key={index} index={index} generation={generation} />
              ))}
            </>
          ))}
        </div>
      ) : (
        <div className='flex flex-col justify-center items-center h-[calc(100vh-88px)]'>
          <Image src={EmptyState} alt='Empty-state' height={330} width={347} className='mb-2' />
          <p className='text-center text-lg font-semibold text-default'>No Generations Found</p>
        </div>
      )}
    </div>
  );
};

export default History;
