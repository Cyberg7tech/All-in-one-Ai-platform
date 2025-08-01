"use client"

import { useEffect, useRef, useState } from 'react';
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
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Add a small delay to prevent flash of loading
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect when we're certain about auth state
    if (!isLoading && requireAuth && !isAuthenticated && !hasRedirected.current && showContent) {
      console.log('Redirecting to login - not authenticated');
      hasRedirected.current = true;
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router, showContent]);

  // Reset redirect flag when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      hasRedirected.current = false;
      console.log('User authenticated:', user?.email);
    }
  }, [isAuthenticated, user]);

  // Show loading while checking authentication or before showing content
  if (isLoading || !showContent) {
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 