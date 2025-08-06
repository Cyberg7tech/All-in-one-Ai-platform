import UpgradePlan from '@/components/dashboard/UpgradePlan';
import InputForm from '@/components/dashboard/content-writer/generate/InputForm';
import { supabaseServerClient } from '@/utils/supabase/server';
import { PlusIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import React from 'react';

type TypeParams = {
  searchParams?: { form: string };
};

const page = async ({ searchParams }: TypeParams) => {
  const supabase = supabaseServerClient();

  const { data } = await supabase.from('content_creations').select('id');

  if (searchParams?.form === 'true' || data?.length !== 0) {
    return (
      <div className='flex flex-col justify-between'>
        <InputForm />
      </div>
    );
  }

  return (
    <div className='flex flex-col justify-between w-full h-[calc(100vh-86px)] '>
      <div className='border rounded-lg blue-gradient px-6 py-5 w-full text-white'>
        <p className='text-lg font-semibold mb-3'>How to use the builder kit tools</p>
        <ul className='text-sm'>
          <li className='flex items-center gap-2'>
            1. Click on
            <Link
              href='?form=true'
              className='flex items-center w-fit rounded gap-0.5 py-0.5 px-1 text-[10px] font-medium text-default dark:text-black bg-white'>
              <PlusIcon />
              New Content
            </Link>
          </li>
          <li>2. Enter the input data</li>
          <li>3. Generate the output</li>
        </ul>
      </div>
      <UpgradePlan />
    </div>
  );
};

export default page;
