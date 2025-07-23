import ProtectedRoute from '@/components/auth/protected-route';
import { TopNavigation } from '@/components/top-navigation';
import { SideNavigation } from '@/components/side-navigation';

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
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 