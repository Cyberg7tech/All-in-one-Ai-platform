import React from 'react';
import ModalTrainModel from '@/components/dashboard/headshot-generator/model/ModalTrainModel';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabaseServerClient } from '@/utils/supabase/server';
import { cn, sentenceCase } from '@/utils/utils';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import EmptyState from '@/assets/images/profile.png';
import ModalLimitExceeded from '@/components/dashboard/ModalLimitExceeded';

const Models = async () => {
  const supabase = supabaseServerClient();

  // Get all the previously generated models from the database
  const { data: models } = await supabase
    .from('headshot_models')
    .select()
    .order('created_at', { ascending: false });

  return (
    <div className='flex flex-col justify-between'>
      {models && models.length > 0 ? (
        <>
          <ModalLimitExceeded isModalOpen={models?.length >= 5} />

          <div className='flex flex-col gap-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
              {/* Display the generated models with status */}
              {models.map((model) => (
                <Card key={model.id} className='border relative'>
                  <CardContent className='p-2'>
                    <Link href={`/dashboard/headshot-generator/${model.model_id}`}>
                      <Image
                        src={model.images[0]}
                        alt=''
                        width={320}
                        height={450}
                        className='w-full h-[188px] object-cover rounded-md'
                      />
                    </Link>

                    <div className='flex flex-col mt-2'>
                      <p className='text-lg font-semibold text-default mb-2'>{sentenceCase(model.name)}</p>
                      <div className='text-sm flex justify-between mb-1 '>
                        <div className='flex gap-2'>
                          <span className='capitalize'>{model.type}</span>
                          <span>-</span>
                          <span>{model.images.length} Image</span>
                        </div>
                        <Badge
                          variant='purple'
                          className={cn(
                            'capitalize absolute top-4 left-4 rounded-xl',
                            model.status === 'processing' && 'bg-orange-400/80 text-white'
                          )}>
                          {model.status}
                        </Badge>
                      </div>
                      {model.status === 'processing' ? (
                        <Badge variant='secondary' className='w-fit text-xs font-normal mt-2'>
                          Getting your model ready: {formatDistanceToNow(model.eta)}
                        </Badge>
                      ) : (
                        <div className='text-sm text-subtle/70'>
                          <p>
                            <span className='font-medium mr-2'>Trained:</span>
                            {formatDistanceToNow(model.trained_at!)}
                          </p>
                          <p>
                            <span className='font-medium mr-2'>Expires:</span>
                            {formatDistanceToNow(model.expires_at!)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      ) : (
        // Button (modal) to generate a new model if no models are found
        <div className='flex flex-col items-center justify-center h-[calc(100vh-88px)] max-w-lg mx-auto'>
          <p className='text-lg text-default text-center font-medium px-4 mb-7'>
            Get started by training your first model.
          </p>
          <Image src={EmptyState} alt='Empty-state' height={347} width={347} className='mb-14' />
          <ModalTrainModel />
        </div>
      )}
    </div>
  );
};

export default Models;
