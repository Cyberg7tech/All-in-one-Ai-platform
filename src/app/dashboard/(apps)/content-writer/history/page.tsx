import UpgradePlan from '@/components/dashboard/UpgradePlan';
import { DataTable } from '@/components/dashboard/content-writer/history/HistoryTable';
import { columns } from '@/components/dashboard/content-writer/history/columns';
import { supabaseServerClient } from '@/utils/supabase/server';
import React from 'react';

const page = async () => {
  const supabase = supabaseServerClient();

  // Retrieves all content creation entries from 'content_creations' table
  // Ordered by creation date, newest first
  const { data } = await supabase
    .from('content_creations')
    .select()
    .order('created_at', { ascending: false })
    .not('topic', 'is', null);

  return (
    <div className='flex flex-col justify-between items-center h-[calc(100vh-86px)]'>
      <div className='w-full'>
        <DataTable columns={columns} data={data ?? []} />
      </div>
      <UpgradePlan />
    </div>
  );
};

export default page;
