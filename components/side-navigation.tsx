'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wrench, History, LogOut, BarChart3, Grid3X3 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

const navigationItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'AI Apps', href: '/dashboard/ai-apps', icon: Grid3X3 },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Tools', href: '/dashboard/explore', icon: Wrench },
  { name: 'History', href: '/dashboard/history', icon: History },
];

export function SideNavigation() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className='w-64 bg-card border-r border-border hidden md:flex md:flex-col'>
      {/* Navigation Items */}
      <nav className='flex-1 overflow-y-auto py-4'>
        <div className='px-3 space-y-1'>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}>
                <div className='flex items-center space-x-3'>
                  <item.icon className='size-5' />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Section */}
      <div className='p-4 border-t border-border'>
        <Button
          variant='ghost'
          className='w-full justify-start text-muted-foreground hover:text-foreground'
          onClick={logout}>
          <LogOut className='size-4 mr-3' />
          Logout
        </Button>
      </div>
    </div>
  );
}
