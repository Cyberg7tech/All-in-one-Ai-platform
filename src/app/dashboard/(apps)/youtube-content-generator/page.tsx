import UpgradePlan from '@/components/dashboard/UpgradePlan';
import InputForm from '@/components/dashboard/youtube-content-generator/generate/InputForm';

const page = () => {
  return (
    <div className='flex flex-col justify-between items-center h-[calc(100vh-86px)]'>
      <div className='w-full flex flex-col items-center justify-center mt-12'>
        <p className='text-lg text-center font-bold'>Youtube Content Generator</p>
        <p className='text-default text-center font-medium leading-6 max-w-96 mt-5'>
          Generate content from your favourite YouTube videos. Paste the URL below and create content
        </p>

        <InputForm />
      </div>

      <UpgradePlan />
    </div>
  );
};

export default page;
