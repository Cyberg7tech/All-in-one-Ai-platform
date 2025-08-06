import FormInput from '@/components/dashboard/image-enhancer-upscaler/generate/FormInput';
import { supabaseServerClient } from '@/utils/supabase/server';

export default async function Generate({ params }: { params: { id: string } }) {
  const supabase = supabaseServerClient();

  const { data } = await supabase
    .from('image_enhancer_upscaler')
    .select('id, input_image, output_image')
    .eq('id', params.id)
    .not('output_image', 'is', null)
    .single();

  return (
    <div className='p-2 flex flex-col justify-between'>
      <FormInput inputImage={data?.input_image} outputImage={data?.output_image} />
    </div>
  );
}
