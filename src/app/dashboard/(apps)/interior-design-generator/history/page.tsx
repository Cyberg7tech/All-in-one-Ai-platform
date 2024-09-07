import HistoryGrid from '@/components/dashboard/interior-design-generator/History';
import { supabaseServerClient } from '@/utils/supabase/server';
import React from 'react';

const History = async () => {
  const supabase = supabaseServerClient();

  const { data } = await supabase
    .from('interior_designs')
    .select()
    .not('image_urls', 'is', null)
    .order('created_at', { ascending: false });

  return <HistoryGrid data={data ?? []} />;
};

export default History;
