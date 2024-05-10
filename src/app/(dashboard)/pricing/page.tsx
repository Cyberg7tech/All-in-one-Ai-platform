import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import React from 'react';
import { FaCheck } from 'react-icons/fa6';

const pricingPlans = [
  {
    name: 'PRO',
    price: 40,
    features: ['200 mins/mo', 'Unlimited Content', 'Unlimited Audiograms', 'Magic Chat'],
  },
  {
    name: 'Enterprise',
    price: 100,
    features: ['200 mins/mo', 'Unlimited Content', 'Unlimited Audiograms', 'Magic Chat'],
    mostPopular: true,
  },
];

const Pricing = () => {
  return (
    <div className='m-2'>
      <div className='flex my-14 justify-center'>
        <p className='text-lg font-medium text-center tracking-tight max-w-2xl'>
          Unlock the most powerful AI research assistant. Use Builder kit to go to the next level, upgraded AI
          models, unlimited file upload, and API credits.
        </p>
      </div>
      <div className='max-w-3xl block lg:flex justify-center items-end mx-auto gap-5'>
        {pricingPlans.map((plan, index) => (
          <div
            key={index}
            className={cn(
              'w-full border border-[#F1F1F1] py-6 px-5 rounded-2xl h-fit mt-5 lg:mt-0',
              plan.mostPopular && 'border-t-8 border-t-[#FF3C00]'
            )}>
            {plan.mostPopular && (
              <div className='px-2 bg-[#FFF1EC] rounded w-fit mb-5'>
                <span className='text-[#FF3C00] text-[12px] font-semibold'>MOST POPULAR</span>
              </div>
            )}
            <p className='font-medium mb-4'>{plan.name}</p>
            <div className='mb-6'>
              <span className='text-5xl font-semibold text-grey dark:text-white'>${plan.price}</span>
              <span className='text-[#ABABAB]'>/month</span>
            </div>
            <Button className='w-full'>Upgrade Plan</Button>
            <div className='border border-dashed border-[#E4E4E4] my-6' />
            <p className='text-title font-medium mb-6'>The Pro Plan Includes</p>
            <div className='space-y-3'>
              {plan.features.map((feature, index) => (
                <div key={index} className='font-medium flex items-center gap-3'>
                  <FaCheck />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
