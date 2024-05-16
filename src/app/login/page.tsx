// This page represents the login screen of the application.
// It displays a central form allowing users to log in or register either through email or Google authentication.
// The application name is dynamically fetched from the config and displayed at the top.
// The `EmailAuth` and `GoogleAuth` components are used here for handling the respective authentication methods.

import EmailAuth from '@/components/auth/EmailAuth';
import GoogleAuth from '@/components/auth/GoogleAuth';
import { Separator } from '@/components/ui/separator';

export default function Login() {
  return (
    <div className='h-screen flex'>
      <div className='w-full flex flex-col items-center justify-center px-6'>
        <div className='text-2xl md:text-4xl font-medium mb-6 text-center space-y-2'>
          <p>AI Content Writer Tool </p>
          <p className='text-lg'>by Builderkit.ai</p>
        </div>
        <h2 className='text-default text-sm mt-3 mb-9 font-medium'>Login or register with your email</h2>
        <div className='w-full sm:max-w-md flex flex-col gap-6 items-center'>
          <GoogleAuth />
          <Separator className='w-3/4' />
          <EmailAuth />
        </div>
      </div>
    </div>
  );
}
