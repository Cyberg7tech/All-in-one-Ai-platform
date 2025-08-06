// This is the main page and includes form input for QR code generation.
// It uses the FormInput component for gathering user input and interacts with the server using `supabaseServerClient`.

import { supabaseServerClient } from '@/utils/supabase/server';
import FormInput from '@/components/dashboard/qr-code-generator/generate/FormInput';

export default async function Generate() {
  const supabase = supabaseServerClient();

  const { data } = await supabase
    .from('qr_code_generations')
    .select()
    .order('created_at', { ascending: false })
    .not('image_url', 'is', null);

  return (
    <div>
      <FormInput data={data!} />
    </div>
  );
}
