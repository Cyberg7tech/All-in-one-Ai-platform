// This component handles both user registration and login via email.
// It toggles between login and registration forms based on the user's choice.
// Forms are submitted to the `signIn` or `signUp` actions depending on the mode (login or register).
// Errors during form submission are displayed using the `toast` function.
// Successful authentication redirects the user to the `/dashboard`.

'use client';

import { FC, useState } from 'react';
import { Input } from '../ui/input';
import { SubmitButton } from '../SubmitButton';
import { Button } from '../ui/button';
import { signIn, signUp } from '@/app/login/actions';
import { toast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';

interface EmailAuthProps {}

const EmailAuth: FC<EmailAuthProps> = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);

  const router = useRouter();

  // authStatusLabel is a dynamic text that changes based on whether the user is in login or registration mode.
  const authStatusLabel = isLogin ? "Don't have an account?" : 'Already have an account?';

  // handleFormAction is an asynchronous function triggered on form submission.
  // It calls the signIn or signUp functions based on the isLogin state.
  const handleFormAction = async (formData: FormData) => {
    let error;

    if (isLogin) {
      error = await signIn(formData);
    } else {
      error = await signUp(formData);
    }

    if (error) {
      toast({ description: error, variant: 'destructive' });
      return;
    }

    router.push('/home');
  };

  return (
    <form className='animate-in flex-1 flex flex-col w-full justify-center gap-4 text-foreground mt-2'>
      {!isLogin && <Input id='full-name' name='full-name' placeholder='Name' required className='h-11' />}
      <Input id='email' name='email' placeholder='Email' required className='h-11' />
      <Input
        id='password'
        type='password'
        name='password'
        placeholder='Password'
        required
        className='mb-8 h-11'
      />

      <SubmitButton formAction={handleFormAction} className='h-12'>
        {isLogin ? 'Sign In' : 'Sign Up'}
      </SubmitButton>

      <div className='text-sm font-light text-center text-subtle mt-2'>
        <span>{authStatusLabel}</span>
        <Button
          type='button'
          variant='link'
          onClick={() => setIsLogin(!isLogin)}
          className='text-sm text-primary px-2 font-semibold'>
          {isLogin ? 'Register' : 'Login'}
        </Button>
      </div>
    </form>
  );
};

export default EmailAuth;

// For this component, you can consider adding server-side validation for additional security.
// This will help prevent malicious users from bypassing client-side validations.
