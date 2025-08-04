"use client"

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { authDebug } from '@/lib/utils/debug';

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
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);
  const [isReady, setIsReady] = useState(false);

  // Debug logging
  authDebug.log('ProtectedRoute state', { isLoading, isAuthenticated, userEmail: user?.email, isReady });

  useEffect(() => {
    // Add a small delay to ensure auth state is stable
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect when we're certain about auth state and component is ready
    if (isReady && !isLoading && requireAuth && !isAuthenticated && !hasRedirected.current) {
      authDebug.log('Redirecting to login - not authenticated');
      hasRedirected.current = true;
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router, isReady]);

  // Reset redirect flag when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      hasRedirected.current = false;
      authDebug.log('User authenticated in ProtectedRoute', { email: user?.email });
    }
  }, [isAuthenticated, user]);

  // Show loading while checking authentication or not ready
  if (isLoading || !isReady) {
    authDebug.log('Showing loading state', { isLoading, isReady });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (requireAuth && !isAuthenticated) {
    authDebug.log('Redirecting - user not authenticated');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  authDebug.log('Rendering protected content');
  return <>{children}</>;
} 