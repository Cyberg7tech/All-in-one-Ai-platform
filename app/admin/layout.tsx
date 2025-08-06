'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  Database, 
  Key, 
  Mail, 
  CreditCard,
  Activity,
  UserCheck,
  Shield,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-switcher';
import { AIIcon } from '@/components/ui/ai-icon';

const adminNavItems = [
  {
    title: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Dashboard overview and stats'
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'Manage users and permissions'
  },
  {
    title: 'Analytics',
    href: '/admin/analytics', 
    icon: BarChart3,
    description: 'Platform usage analytics'
  },
  {
    title: 'Database',
    href: '/admin/database',
    icon: Database,
    description: 'Database management'
  },
  {
    title: 'API Keys',
    href: '/admin/api-keys',
    icon: Key,
    description: 'Manage API keys and access'
  },
  {
    title: 'Emails',
    href: '/admin/emails',
    icon: Mail,
    description: 'Email templates and logs'
  },
  {
    title: 'Billing',
    href: '/admin/billing',
    icon: CreditCard,
    description: 'Subscriptions and payments'
  },
  {
    title: 'Activity',
    href: '/admin/activity',
    icon: Activity,
    description: 'System activity logs'
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Platform configuration'
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check admin authorization
    const checkAdminAccess = async () => {
      try {
        // Simulate admin check - replace with actual admin verification
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        if (!isAdmin) {
          router.push('/dashboard');
          return;
        }
        setIsAuthorized(true);
      } catch (error) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AIIcon size={48} className="mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
            
            <div className="flex items-center space-x-2">
              <AIIcon size={24} />
              <span className="font-bold">One AI</span>
              <Badge variant="destructive" className="text-xs">
                Admin
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="size-4" />
            </Button>
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Exit Admin</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-card border-r transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center">
                <Shield className="size-5 mr-2 text-primary" />
                Admin Panel
              </h2>
              <p className="text-sm text-muted-foreground">Platform Management</p>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {adminNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="size-5 text-muted-foreground group-hover:text-primary" />
                      <div>
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </nav>

            {/* Admin Quick Stats */}
            <div className="p-4 border-t">
              <Card className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Active Users</span>
                    <span className="font-medium">1,247</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">API Calls Today</span>
                    <span className="font-medium">23.4K</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">System Health</span>
                    <Badge variant="secondary" className="text-xs">
                      <div className="size-2 bg-green-500 rounded-full mr-1" />
                      Good
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
