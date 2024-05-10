import InputForm from '@/components/dashboard/generate/InputForm';
import { supabaseServerClient } from '@/utils/supabase/server';
import React from 'react';

const page = async () => {
  const supabase = supabaseServerClient();

  const { data } = await supabase.from('voice_transcriptions').select('id');

  return (
    <div className='flex flex-col justify-between'>
      <div>
        <InputForm firstTime={data?.length === 0} />
      </div>
    </div>
  );
};

export default page;
