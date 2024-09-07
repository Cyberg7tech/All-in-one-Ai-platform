import HistoryGrid from '@/components/dashboard/image-enhancer-upscaler/History';
import { supabaseServerClient } from '@/utils/supabase/server';
import React from 'react';

const History = async () => {
  const supabase = supabaseServerClient();

  const { data } = await supabase
    .from('image_enhancer_upscaler')
    .select()
    .not('output_image', 'is', null)
    .order('created_at', { ascending: false });

  return <HistoryGrid data={data ?? []} />;
};

export default History;
