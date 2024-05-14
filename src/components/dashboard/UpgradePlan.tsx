import React from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';

const UpgradePlan = () => {
  return (
    <div className='p-4 border border-[#ECECEC] dark:border-dark rounded-lg mt-10 w-full'>
      <p className='font-semibold text-lg mb-3'>Upgrade now to experience the best of builderkit</p>

      <ul className='list-disc list-inside '>
        <li>Get Access to Advanced Features</li>
        <li>Get Access to Top AI Models</li>
        <li>Get 24/7 Support</li>
      </ul>
      <Link href='/pricing'>
        <Button className='mt-6 w-full font-semibold text-grey text-sm' variant='buy-now'>
          Upgrade Plan
        </Button>
      </Link>
    </div>
  );
};

export default UpgradePlan;
