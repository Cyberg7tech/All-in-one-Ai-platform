import React, { FC } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type ModalLimitExceededProps = {
  isModalOpen: boolean;
};

const ModalLimitExceeded: FC<ModalLimitExceededProps> = ({ isModalOpen }) => {
  return (
    <Dialog defaultOpen={isModalOpen}>
      <DialogContent className='w-11/12 rounded-lg'>
        <DialogHeader>
          <DialogTitle className='text-center text-lg font-semibold mb-1.5'>Trial Limit Exceeded</DialogTitle>
          <DialogDescription className='text-center text-sm leading-6'>
            Get all the apps with complete GitHub access with BuilderKit.ai
          </DialogDescription>
        </DialogHeader>
        <Link href='https://www.builderkit.ai/#pricing' target='_blank'>
          <Button className='mt-4 w-full'>Get Builderkit.ai</Button>
        </Link>
      </DialogContent>
    </Dialog>
  );
};

export default ModalLimitExceeded;
