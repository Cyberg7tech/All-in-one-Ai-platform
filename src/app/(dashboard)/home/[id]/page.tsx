import InputForm from '@/components/dashboard/generate/InputForm';
import { TypeContent } from '@/types/types';
import { supabaseServerClient } from '@/utils/supabase/server';

export default async function Generate({ params }: { params: { id: string } }) {
  const supabase = supabaseServerClient();

  const { data } = await supabase
    .from('content_creations')
    .select()
    .eq('id', params.id)
    .not('results', 'is', null)
    .order('created_at', { ascending: false })
    .single();

  return (
    <div className='flex flex-col justify-between h-[calc(100vh-86px)]'>
      <InputForm generatedData={data as TypeContent | null} />
    </div>
  );
}
