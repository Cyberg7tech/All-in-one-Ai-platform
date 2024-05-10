import Link from 'next/link';
import React from 'react';
import { LuArrowUpRight } from 'react-icons/lu';

const SidebarUpgradePlan = () => {
  return (
    <Link href='/pricing'>
      <div className='border border-[#FFDDCB] bg-[#FFEFE8] dark:bg-orange-200/10 dark:border-orange-500 py-3 px-4 rounded-lg space-y-3'>
        <div className='flex justify-between items-center text-orange'>
          <p className='font-semibold'>Upgrade plan</p>
          <LuArrowUpRight className='size-5' />
        </div>
        <div className='text-grey dark:text-white'>
          <p>Upgrade to experience the pro benefits.</p>
        </div>
      </div>
    </Link>
  );
};

export default SidebarUpgradePlan;
