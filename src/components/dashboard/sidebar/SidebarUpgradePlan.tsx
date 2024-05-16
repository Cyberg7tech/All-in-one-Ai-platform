import Link from 'next/link';
import React from 'react';
import { LuArrowUpRight } from 'react-icons/lu';

const SidebarUpgradePlan = () => {
  return (
    <Link href='/pricing'>
      <div className='border border-destructive/10 bg-destructive/10 dark:bg-destructive/20 py-3 px-4 rounded-lg space-y-3'>
        <div className='flex justify-between items-center text-destructive'>
          <p className='font-semibold text-sm'>Upgrade plan</p>
          <LuArrowUpRight className='size-4' />
        </div>
        <div className='text-default text-sm'>
          <p>Upgrade now to unlock higher limits and pro features</p>
        </div>
      </div>
    </Link>
  );
};

export default SidebarUpgradePlan;
