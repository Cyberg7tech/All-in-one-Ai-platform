import { getUserDetails } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

// Custom layout for login page
const LoginLayout = async ({ children }: Props) => {
  const user = await getUserDetails();

  // Redirects to login page if user is not authenticated
  if (user) {
    redirect('/home');
  }

  return children;
};

export default LoginLayout;
