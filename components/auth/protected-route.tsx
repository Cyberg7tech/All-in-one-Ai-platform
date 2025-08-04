"use client"

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

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

  // Debug logging
  console.log('🔍 ProtectedRoute:', { isLoading, isAuthenticated, userEmail: user?.email });

  useEffect(() => {
    // Only redirect when we're certain about auth state
    if (!isLoading && requireAuth && !isAuthenticated && !hasRedirected.current) {
      console.log('🔄 Redirecting to login - not authenticated');
      hasRedirected.current = true;
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  // Reset redirect flag when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      hasRedirected.current = false;
      console.log('✅ User authenticated:', user?.email);
    }
  }, [isAuthenticated, user]);

  // Show loading while checking authentication
  if (isLoading) {
    console.log('⏳ Showing loading state');
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
    console.log('🔄 Redirecting - user not authenticated');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering protected content');
  return <>{children}</>;
} 