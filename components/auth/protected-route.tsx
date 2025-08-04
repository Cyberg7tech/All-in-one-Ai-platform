'use client'

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Small delay to allow auth state to stabilize
    const timer = setTimeout(() => {
      // Only redirect if we need auth, user is not authenticated, and we're not already on login page
      if (requireAuth && !user && !isAuthenticated && pathname !== redirectTo) {
        router.push(redirectTo);
      }
      setHasChecked(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [user, isAuthenticated, requireAuth, redirectTo, router, pathname]);

  // Always render immediately - no loading states
  return <>{children}</>;
}
