import React from 'react';
import { DataTable } from '@/components/dashboard/voice-transcription/History/HistoryTable';
import { columns } from '@/components/dashboard/voice-transcription/History/column';
import { supabaseServerClient } from '@/utils/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RiLayoutGridFill } from 'react-icons/ri';
import { RiBarChartHorizontalLine } from 'react-icons/ri';
import HistoryGrid from '@/components/dashboard/voice-transcription/History/HistoryGrid';
import UpgradePlan from '@/components/dashboard/UpgradePlan';

const History = async () => {
  const supabase = supabaseServerClient();

  // Retrieves all content creation entries from 'voice_transcriptions' table
  // Ordered by creation date, newest first
  const { data } = await supabase
    .from('voice_transcriptions')
    .select()
    .order('created_at', { ascending: false })
    .not('summary', 'is', null);

  return (
    <div className='flex flex-col justify-between items-center h-[calc(100vh-86px)]'>
      <Tabs defaultValue='table' className='w-full'>
        <div className='flex justify-end'>
          <TabsList className='flex justify-end mr-2 w-fit rounded-lg border'>
            <TabsTrigger className='py-2 px-3' value='table'>
              <RiBarChartHorizontalLine className='size-5' />
            </TabsTrigger>
            <TabsTrigger className='py-2 px-3' value='password'>
              <RiLayoutGridFill className='size-5' />
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value='table'>
          <div className='w-full'>
            <DataTable columns={columns} data={data ?? []} />
          </div>
        </TabsContent>
        <TabsContent value='password'>
          <HistoryGrid data={data ?? []} />
        </TabsContent>
      </Tabs>
      <UpgradePlan />
    </div>
  );
};

export default History;
