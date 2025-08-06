import UpgradePlan from '@/components/dashboard/UpgradePlan';
import FormInput from '@/components/dashboard/chat-with-youtube/generate/FormInput';

const Home = () => {
  return (
    <div className='flex flex-col justify-between items-center h-[calc(100vh-86px)]'>
      <div className='max-md:w-full'>
        <p className='text-default mx-auto my-11 text-base font-medium max-w-52 text-center'>
          Upload Youtube video URL to start chat with the video
        </p>

        <FormInput />
      </div>

      {/* Upgrade plan card */}
      <UpgradePlan />
    </div>
  );
};

export default Home;
