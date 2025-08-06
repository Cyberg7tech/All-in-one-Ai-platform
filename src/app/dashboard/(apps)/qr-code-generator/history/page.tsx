import HistoryGrid from '@/components/dashboard/qr-code-generator/History';
import { supabaseServerClient } from '@/utils/supabase/server';
import React from 'react';

const History = async () => {
  const supabase = supabaseServerClient();

  const { data } = await supabase
    .from('qr_code_generations')
    .select()
    .not('image_url', 'is', null)
    .order('created_at', { ascending: false });

  return <HistoryGrid data={data ?? []} />;
};

export default History;
