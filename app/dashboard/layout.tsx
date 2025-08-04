"use client"

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TopNavigation } from '@/components/top-navigation';
import { SideNavigation } from '@/components/side-navigation';

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router, isClient]);

  if (!isClient || isLoading) return null;

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Navigation */}
      <TopNavigation />
      
      {/* Main Layout with Sidebar and Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SideNavigation />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
} 