"use client"

import ProtectedRoute from '@/components/auth/protected-route';
import { TopNavigation } from '@/components/top-navigation';
import { SideNavigation } from '@/components/side-navigation';
import { Suspense, useEffect, useState } from 'react';
import { forceAuthRefresh } from '@/lib/utils/auth-cleanup';

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
  const [forceRedirect, setForceRedirect] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 5000); // Show timeout message after 5 seconds (give more time)
    
    // Only force redirect after 30 seconds, not 8 seconds
    const forceTimer = setTimeout(() => {
      setForceRedirect(true);
      // Don't force redirect to login, just show error
    }, 30000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(forceTimer);
    };
  }, []);
  
  if (forceRedirect) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 mb-4">Loading timeout - Please try again</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  
  if (showTimeout) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground mb-2">Loading is taking longer than expected...</p>
          <p className="text-sm text-muted-foreground mb-4">Authentication issue detected. Clearing cache...</p>
          <div className="space-x-2">
            <button 
              onClick={forceAuthRefresh}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Clear Auth & Reload
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