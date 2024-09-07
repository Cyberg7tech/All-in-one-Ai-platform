// This is the main page and includes form input for music generation.
// It uses the FormInput component for gathering user input and interacts with the server for music generation.

import FormInput from '@/components/dashboard/music-generator/generate/FormInput';

export default async function Generate() {
  return (
    <div>
      <p className='font-medium my-4'>Let’s create music</p>
      <FormInput />
    </div>
  );
}
