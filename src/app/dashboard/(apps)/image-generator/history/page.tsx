import HistoryGrid from '@/components/dashboard/image-generator/History';
import { supabaseServerClient } from '@/utils/supabase/server';
import React from 'react';

const History = async () => {
  const supabase = supabaseServerClient();

  const { data } = await supabase
    .from('image_generations')
    .select()
    .not('image_urls', 'is', null)
    .order('created_at', { ascending: false });

  return <HistoryGrid data={data ?? []} />;
};

export default History;
