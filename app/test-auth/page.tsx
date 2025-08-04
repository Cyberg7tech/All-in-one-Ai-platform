'use client'

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function TestAuthPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Loading State:</strong> {isLoading ? '⏳ Loading...' : '✅ Not Loading'}
          </div>
          <div>
            <strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <strong>User ID:</strong> {user?.id || 'None'}
          </div>
          <div>
            <strong>User Email:</strong> {user?.email || 'None'}
          </div>
          <div>
            <strong>User Name:</strong> {user?.name || 'None'}
          </div>
          <div className="pt-4 space-x-4">
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
            <Button onClick={() => router.push('/login')} variant="outline">
              Go to Login
            </Button>
            {isAuthenticated && (
              <Button onClick={handleLogout} variant="destructive">
                Logout
              </Button>
            )}
          </div>
          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              This page helps diagnose authentication issues. Check the console for detailed logs.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Add ?debug=true to the URL to see more detailed logs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 