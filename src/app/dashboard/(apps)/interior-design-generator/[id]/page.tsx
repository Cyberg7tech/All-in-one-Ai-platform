import FormInput from '@/components/dashboard/interior-design-generator/generate/FormInput';
import { supabaseServerClient } from '@/utils/supabase/server';

export default async function Generate({ params }: { params: { id: string } }) {
  const supabase = supabaseServerClient();

  const { data } = await supabase
    .from('interior_designs')
    .select()
    .eq('id', params.id)
    .not('image_urls', 'is', null)
    .order('created_at', { ascending: false })
    .single();

  return (
    <div className='p-2 flex flex-col justify-between'>
      <FormInput data={data!} />
    </div>
  );
}
