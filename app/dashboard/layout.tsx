"use client"

import ProtectedRoute from '@/components/auth/protected-route';
import { TopNavigation } from '@/components/top-navigation';
import { SideNavigation } from '@/components/side-navigation';
import { Suspense, useEffect, useState } from 'react';

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

// Loading component for better UX
function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

// Timeout loading component to prevent infinite loading
function TimeoutLoading() {
  const [showTimeout, setShowTimeout] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 3000); // Show timeout message after 3 seconds (reduced from 5)
    
    return () => clearTimeout(timer);
  }, []);
  
  if (showTimeout) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground mb-2">Loading is taking longer than expected...</p>
          <p className="text-sm text-muted-foreground mb-4">This might be due to authentication or network issues.</p>
          <div className="space-x-2">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => window.location.href = '/login'} 
              className="px-4 py-2 text-sm border border-input bg-background rounded hover:bg-accent"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return <DashboardLoading />;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-background">
        {/* Top Navigation */}
        <TopNavigation />
        
        {/* Main Layout with Sidebar and Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <SideNavigation />
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6 bg-background">
            <Suspense fallback={<TimeoutLoading />}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 