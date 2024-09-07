import FormInput from '@/components/dashboard/text-to-speech/generate/FormInput';

const Home = () => {
  return (
    <div className='flex flex-col justify-between items-center h-[calc(100vh-86px)]'>
      <div className='md:w-3/5'>
        <div className='my-12 space-y-3'>
          <p className='text-default mx-auto text-xl font-semibold text-center'>Convert text to speech</p>
          <p className='text-zinc-400 text-center'>
            Choose a character, enter your script and turn text to speech
          </p>
        </div>

        <FormInput />
      </div>
    </div>
  );
};

export default Home;
