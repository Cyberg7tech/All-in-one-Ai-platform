import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';

const ModalUpgradePlan = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='destructive' className='gap-2 py-4 text-sm font-semibold'>
          Upgrade Plan
          <FiArrowUpRight className='size-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='w-11/12 rounded-lg'>
        <DialogHeader>
          <DialogTitle className='text-center text-lg font-semibold mb-1.5'>Pricing</DialogTitle>
          <DialogDescription className='text-center text-sm leading-6'>
            BuilderKit.ai Apps come with Stripe & Lemon Squeezy Integration. You can set up your payments
            within minutes in just a few steps
          </DialogDescription>
        </DialogHeader>
        <Link href='https://www.builderkit.ai/#pricing' target='_blank'>
          <Button className='mt-4 w-full'>Get Builderkit.ai</Button>
        </Link>
      </DialogContent>
    </Dialog>
  );
};

export default ModalUpgradePlan;
