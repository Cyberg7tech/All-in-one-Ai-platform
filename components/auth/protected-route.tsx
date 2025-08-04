'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Small delay to allow auth state to stabilize
    const timer = setTimeout(() => {
      if (requireAuth && !user && !isAuthenticated) {
        router.push(redirectTo);
      }
      setHasChecked(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [user, isAuthenticated, requireAuth, redirectTo, router]);

  // Always render immediately - no loading states
  return <>{children}</>;
}
