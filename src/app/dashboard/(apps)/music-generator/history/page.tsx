import HistoryGrid from '@/components/dashboard/music-generator/History';
import { supabaseServerClient } from '@/utils/supabase/server';
import React from 'react';

const History = async () => {
  const supabase = supabaseServerClient();

  const { data } = await supabase
    .from('music_generations')
    .select()
    .not('music_url', 'is', null)
    .order('created_at', { ascending: false });

  return <HistoryGrid data={data ?? []} />;
};

export default History;
