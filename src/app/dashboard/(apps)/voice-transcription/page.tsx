import UpgradePlan from '@/components/dashboard/UpgradePlan';
import GenerateTranscription from '@/components/dashboard/voice-transcription/generate/GenerateTranscription';

const Home = () => {
  return (
    <div className='flex flex-col justify-between items-center h-[calc(100vh-86px)]'>
      <div>
        <p className='text-default mx-auto mt-10 mb-11 text-base font-medium max-w-52 text-center'>
          Click on start recording and store your thoughts
        </p>

        <GenerateTranscription />
      </div>

      {/* Upgrade plan card */}
      <UpgradePlan />
    </div>
  );
};

export default Home;
