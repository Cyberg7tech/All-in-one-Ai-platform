import React from 'react';
import { Button } from '../ui/button';
import ModalUpgradePlan from './ModalUpgradePlan';

const UpgradePlan = () => {
  return (
    <div className='px-4 py-3.5 border rounded-lg mt-10 w-full'>
      <p className='font-semibold text-default mb-3'>Upgrade now to experience the best of builderkit</p>

      <ul className='list-disc list-inside font-medium text-sm text-default'>
        <li>Get Access to Advanced Features</li>
        <li>Get Access to Top AI Models</li>
        <li>Get 24/7 Support</li>
      </ul>
      <ModalUpgradePlan>
        <Button size='lg' variant='secondary' className='mt-6 w-full'>
          Upgrade Plan
        </Button>
      </ModalUpgradePlan>
    </div>
  );
};

export default UpgradePlan;
