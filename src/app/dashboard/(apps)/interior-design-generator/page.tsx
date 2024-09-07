// This is the main page and includes form input for interior design generation.
// It uses the FormInput component for gathering user input and interacts with the server for interior design generation.

import FormInput from '@/components/dashboard/interior-design-generator/generate/FormInput';

export default async function Generate() {
  return <FormInput />;
}
