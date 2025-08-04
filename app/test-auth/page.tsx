'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function TestAuthPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded-lg">
          <p><strong>Authentication Status:</strong> {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg">
          <p><strong>User Email:</strong> {user?.email || 'No user'}</p>
          <p><strong>User Name:</strong> {user?.name || 'No name'}</p>
          <p><strong>User ID:</strong> {user?.id || 'No ID'}</p>
        </div>

        <div className="flex gap-4">
          {isAuthenticated ? (
            <Button onClick={handleLogout} variant="destructive">
              Logout
            </Button>
          ) : (
            <Button onClick={() => router.push('/login')}>
              Login
            </Button>
          )}
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
} 