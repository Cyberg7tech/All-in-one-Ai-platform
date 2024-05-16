// This component serves as the primary visual and textual introduction on the homepage.
// It typically includes a headline, a subheading, and a call-to-action (CTA) button to engage users right from the start.
// This component plays a crucial role in setting the tone and providing key information about the product or service.

import { FaArrowRight } from 'react-icons/fa';
import Image from 'next/image';
import dashboard from '@/assets/images/dashboard.png';
import FlickIcon from '@/assets/icons/FlickIcon';
import ButtonCta from './ButtonCta';

const Hero = () => {
  return (
    <section className='space-y-[72px] px-4'>
      <div className='flex flex-col justify-center '>
        <div className='space-y-[18px] max-w-2xl mx-auto'>
          <div className='px-4 py-[6px] gap-2 bg-[#006C40]/30 rounded-full w-[15.3rem] mx-auto'>
            <div className='text-[#18EDA7] text-sm font-semibold flex items-center gap-2'>
              Unlock Your Creative Spark! <FaArrowRight className='size-3' />
            </div>
          </div>
          <div className='text-center text-[64px] font-bold leading-[4rem] tracking-[-1.28px] bg-gradient-to-b from-white via-white to-[rgba(255, 255, 255, 0.70)] bg-clip-text text-transparent relative'>
            <div className='absolute md:left-8 -top-3 md:-top-4'>
              <FlickIcon />
            </div>
            <span className='bg-clip-text text-transparent'>Generate AI Apps with ease</span>
          </div>
          <div className='max-w-96 mx-auto text-center font-inter text-base font-medium leading-[28.8px] tracking-tighter text-gray-400'>
            Unleash Your Creative Potential by Turning What You Consume into Engaging Content Ideas
          </div>
        </div>
        <div className='mt-8 mx-auto'>
          <ButtonCta />
        </div>
      </div>

      <Image src={dashboard} width={1000} height={420} alt='hero' className='mx-auto rounded-t-lg' />
    </section>
  );
};

export default Hero;
