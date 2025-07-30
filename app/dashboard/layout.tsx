import ProtectedRoute from '@/components/auth/protected-route';
import { TopNavigation } from '@/components/top-navigation';
import { SideNavigation } from '@/components/side-navigation';
import { Suspense } from 'react';

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
            <Suspense fallback={<DashboardLoading />}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 