// This component provides Google authentication using Supabase's auth UI.
// It is configured to redirect users to a specified callback URL upon successful authentication.
// The appearance of the auth button is customized according to the application's theme.

'use client';

import { supabaseBrowserClient } from '@/utils/supabase/client';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { cn } from '@/utils/utils';
import { FaGoogle } from 'react-icons/fa';

export default function GoogleAuth() {
  const { theme } = useTheme();

  const handleGoogleAuth = async () => {
    const supabase = supabaseBrowserClient();

    // Ensure the redirect URL is configured correctly in the Supabase project settings.
    // Incorrect configuration can lead to failed authentication attempts or security vulnerabilities.
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  return (
    <div className='w-full my-4'>
      <Button
        size='lg'
        onClick={handleGoogleAuth}
        className={cn(
          'w-full h-11 gap-2',
          theme != 'light' ? 'text-white bg-[#2A2A2A]' : 'text-black bg-[#F7F7F7]'
        )}>
        <FaGoogle size={17} />
        <span>Sign in with Google</span>
      </Button>
    </div>
  );
}

// You can also implement rate limiting or add additional logging for authentication attempts.
// This can help mitigate brute force attacks and provide insights into potential security threats.
