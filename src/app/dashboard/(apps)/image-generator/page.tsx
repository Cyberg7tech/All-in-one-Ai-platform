// This is the main page and includes form input for image generation.
// It uses the FormInput component for gathering user input and interacts with the server using `supabaseServerClient`.

import { supabaseServerClient } from '@/utils/supabase/server';
import FormInput from '@/components/dashboard/image-generator/generate/FormInput';

export default async function Generate() {
  const supabase = supabaseServerClient();

  const { data } = await supabase
    .from('image_generations')
    .select()
    .order('created_at', { ascending: false })
    .not('image_urls', 'is', null);

  return <FormInput data={data!} />;
}
