'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  // Avoid any static caching for auth routes
  // and ensure fresh render to read client-side session state
  // during navigation.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('Login page effect:', { mounted, isLoading, isAuthenticated, user: !!user });
    if (mounted && !isLoading && isAuthenticated && user) {
      console.log('Redirecting to dashboard...');
      // Try immediate redirect
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated, isLoading, router, mounted, user]);

  if (!mounted || isLoading) return null;

  return <LoginForm />;
}
