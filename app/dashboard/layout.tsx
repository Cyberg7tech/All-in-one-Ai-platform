'use client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { TopNavigation } from '@/components/top-navigation';
import { SideNavigation } from '@/components/side-navigation';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect only after loading is complete and still unauthenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirectTo=/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // If we have a user, render immediately even if isLoading temporarily remains true
  if (isLoading && !user) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-background'>
        <div className='flex items-center space-x-2'>
          <Loader2 className='size-6 animate-spin' />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className='flex flex-col h-screen bg-background'>
      <TopNavigation />
      <div className='flex flex-1 overflow-hidden'>
        <SideNavigation />
        <main className='flex-1 overflow-auto p-6 bg-background'>{children}</main>
      </div>
    </div>
  );
}
