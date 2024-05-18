import React from 'react';
import Image from 'next/image';
import Dropbox from '../../assets/images/dropbox.png';
import Paypal from '../../assets/images/paypal.png';
import Google from '../../assets/images/google.png';
import { cn } from '@/utils/utils';

const logos = [
  { src: Paypal, alt: 'Paypal', height: 50, width: 250 },
  { src: Google, alt: 'Google', height: 50, width: 230 },
  { src: Dropbox, alt: 'Dropbox', height: 20, width: 260 },
  { src: Google, alt: 'Google', height: 50, width: 230 },
];

const FeatureOn = () => {
  return (
    <div className='flex flex-col justify-center items-center space-y-[64px] mt-44'>
      <div className='text-lp-subtle text-[32px] font-normal leading-10'>Featured on:</div>
      <div className='flex justify-center flex-wrap w-full gap-10'>
        {logos.map((logo, index) => (
          <Image
            key={index}
            src={logo.src}
            alt={logo.alt}
            height={logo.height}
            width={logo.width}
            //This logic is used to add a border to all the logos except the last one
            className={cn(index !== logos.length - 1 && 'lg:border-r', 'border-[#132524] md:pr-20')}
          />
        ))}
      </div>
    </div>
  );
};

export default FeatureOn;
