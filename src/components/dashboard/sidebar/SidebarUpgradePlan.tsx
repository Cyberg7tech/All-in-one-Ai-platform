import Link from 'next/link';
import React from 'react';
import { LuArrowUpRight } from 'react-icons/lu';

const SidebarUpgradePlan = () => {
  return (
    <Link href='/pricing'>
      <div className='border border-[#FFDDCB] bg-[#FFEFE8] dark:bg-[#311200] dark:border-[#4E1D00] py-3 px-4 rounded-lg space-y-3'>
        <div className='flex justify-between items-center text-orange'>
          <p className='font-semibold text-sm'>Upgrade plan</p>
          <LuArrowUpRight className='size-4' />
        </div>
        <div className='text-grey dark:text-white text-sm'>
          <p>Upgrade now to unlock higher limits and pro features</p>
        </div>
      </div>
    </Link>
  );
};

export default SidebarUpgradePlan;
