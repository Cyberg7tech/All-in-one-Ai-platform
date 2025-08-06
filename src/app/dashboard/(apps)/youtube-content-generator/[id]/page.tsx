import Summary from '@/components/dashboard/youtube-content-generator/generate/Summary';
import { supabaseServerClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function Generate({ params }: { params: { id: string } }) {
  const supabase = supabaseServerClient();

  const { data, error } = await supabase
    .from('youtube_content_generator')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    redirect('/dashboard/youtube-content-generator');
  }

  return <Summary data={data} />;
}
