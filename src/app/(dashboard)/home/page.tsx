import InputForm from '@/components/dashboard/generate/InputForm';
import { supabaseServerClient } from '@/utils/supabase/server';
import React from 'react';

const page = async () => {
  const supabase = supabaseServerClient();

  const { data } = await supabase.from('content_creations').select('id');

  return (
    <div className='flex flex-col justify-between'>
      <InputForm firstTime={data?.length === 0} />
    </div>
  );
};

export default page;
