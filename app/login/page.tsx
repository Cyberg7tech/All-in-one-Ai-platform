'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router, isClient]);

  if (!isClient || isLoading) return null;

  return <LoginForm />;
} 