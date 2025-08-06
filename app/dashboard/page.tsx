'use client';

import Link from 'next/link';
import { ArrowRight, Bot, Brain, TrendingUp, Shield, Sparkles, Plus, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { dbHelpers } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useState, useEffect, Suspense } from 'react';
import { formatDate } from '@/lib/utils';

// Remove metadata export since this is now a client component

const quickActions = [
  {
    icon: Bot,
    title: 'Create AI Agent',
    description: 'Build a custom AI agent with specialized tools',
    href: '/dashboard/agents/new',
    color: 'text-blue-500',
  },
  {
    icon: Brain,
    title: 'Chat with AI',
    description: 'Start a conversation with our AI models',
    href: '/dashboard/chat',
    color: 'text-purple-500',
  },
  {
    icon: TrendingUp,
    title: 'Create Forecast',
    description: 'Generate predictions from your data',
    href: '/dashboard/forecasting',
    color: 'text-green-500',
  },
  {
    icon: Shield,
    title: 'Monitor Anomalies',
    description: 'Set up anomaly detection alerts',
    href: '/dashboard/anomalies',
    color: 'text-red-500',
  },
];

export default function DashboardPage() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [showNameModal, setShowNameModal] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (user && (!user.name || user.name.trim() === '')) {
      setShowNameModal(true);
    } else {
      setShowNameModal(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const fetchStats = async () => {
        const supabase = getSupabaseClient();
        const { data: userStats, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user stats:', error);
          return;
        }
        setStats(userStats);
      };

      const fetchRecentActivity = async () => {
        try {
          const userActivities = await dbHelpers.getUserActivities(user.id, 10);
          setRecentActivity(userActivities || []);
        } catch (error) {
          console.error('Error fetching recent activities:', error);
          // Create some sample activities if none exist
          await createSampleActivities();
        }
      };

      const createSampleActivities = async () => {
        try {
          // Add some sample activities for new users
          await dbHelpers.addActivity(
            user.id,
            'Registration',
            'Account Created',
            'Welcome to One AI platform!',
            '👤'
          );
          await dbHelpers.addActivity(user.id, 'Login', 'Dashboard Access', 'Accessed the dashboard', '🏠');

          // Refresh activities
          const userActivities = await dbHelpers.getUserActivities(user.id, 10);
          setRecentActivity(userActivities || []);
        } catch (error) {
          console.error('Error creating sample activities:', error);
          // Use fallback demo data
          setRecentActivity([
            {
              id: '1',
              type: 'Registration',
              name: 'Account Created',
              description: 'Welcome to One AI!',
              icon: '👤',
              timestamp: new Date().toISOString(),
            },
            {
              id: '2',
              type: 'Login',
              name: 'Dashboard Access',
              description: 'Accessed the dashboard',
              icon: '🏠',
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      };

      fetchStats();
      fetchRecentActivity();
    }
  }, [user]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !user?.id) return;

    setIsSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('users').update({ name: displayName.trim() }).eq('id', user.id);

      if (error) {
        console.error('Error updating user name:', error);
        toast.error('Failed to update name. Please try again.');
        return;
      }

      await refreshUser(); // Refresh user data from context
      setShowNameModal(false);
      toast.success('Name updated successfully!');
    } catch (error) {
      console.error('Error updating user name:', error);
      toast.error('Failed to update name. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Display Name Modal */}
      {showNameModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-background p-8 rounded-lg shadow-lg w-full max-w-sm'>
            <h2 className='text-xl font-bold mb-4'>Set Your Display Name</h2>
            <form onSubmit={handleSaveName} className='space-y-4'>
              <input
                type='text'
                className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
                placeholder='Enter your name'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              <Button type='submit' className='w-full' disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Name'}
              </Button>
            </form>
          </div>
        </div>
      )}
      {/* Main Content */}
      <main className='container mx-auto px-4 py-8'>
        {/* Welcome Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold mb-2'>Welcome back, {user?.name || user?.email || ''}! 👋</h1>
              <p className='text-muted-foreground'>
                Ready to build something amazing with AI? Here's what you can do today.
              </p>
            </div>
            <div className='text-right'>
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user?.subscription_plan === 'enterprise'
                    ? 'bg-purple-100 text-purple-700'
                    : user?.subscription_plan === 'pro'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                }`}>
                {user?.subscription_plan
                  ? user.subscription_plan.charAt(0).toUpperCase() + user.subscription_plan.slice(1) + ' Plan'
                  : 'User Plan'}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Member since {user?.created_at ? formatDate(user.created_at) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className='mb-12'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-semibold'>Quick Actions</h2>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/dashboard/explore'>
                View All <ArrowRight className='w-4 h-4 ml-2' />
              </Link>
            </Button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {quickActions.map((action, index) => (
              <Card key={index} className='hover:shadow-lg transition-shadow cursor-pointer group'>
                <CardHeader className='pb-3'>
                  <div className='flex items-center space-x-3'>
                    <div
                      className={`p-2 rounded-lg bg-background ${action.color} group-hover:scale-110 transition-transform`}>
                      <action.icon className='w-5 h-5' />
                    </div>
                    <CardTitle className='text-lg'>{action.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className='mb-4'>{action.description}</CardDescription>
                  <Button size='sm' variant='outline' className='w-full' asChild>
                    <Link href={action.href}>Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Overview */}
        <section className='mb-12'>
          <h2 className='text-2xl font-semibold mb-6'>Overview</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground uppercase tracking-wide'>AI Agents</p>
                    <p className='text-2xl font-bold text-primary'>{stats?.aiAgents || 0}</p>
                  </div>
                  <Bot className='w-8 h-8 text-muted-foreground' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground uppercase tracking-wide'>API Calls</p>
                    <p className='text-2xl font-bold text-primary'>
                      {stats?.apiCalls?.toLocaleString() || 0}
                    </p>
                  </div>
                  <Brain className='w-8 h-8 text-muted-foreground' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground uppercase tracking-wide'>Forecasts</p>
                    <p className='text-2xl font-bold text-primary'>{stats?.forecasts || 0}</p>
                  </div>
                  <TrendingUp className='w-8 h-8 text-muted-foreground' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground uppercase tracking-wide'>Alerts</p>
                    <p className='text-2xl font-bold text-primary'>{stats?.alerts || 0}</p>
                  </div>
                  <Shield className='w-8 h-8 text-muted-foreground' />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-semibold'>Recent Activity</h2>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/dashboard/activity'>
                View All <ArrowRight className='w-4 h-4 ml-2' />
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className='p-0'>
              {recentActivity.length > 0 ? (
                <div className='divide-y'>
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id || index} className='p-4 hover:bg-muted/50 transition-colors'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                          <div className='text-lg'>{activity.icon || '📋'}</div>
                          <div>
                            <p className='font-medium'>{activity.name}</p>
                            <p className='text-sm text-muted-foreground'>{activity.type}</p>
                            {activity.description && (
                              <p className='text-xs text-muted-foreground mt-1'>{activity.description}</p>
                            )}
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='text-sm text-muted-foreground'>
                            {activity.timestamp ? formatDate(new Date(activity.timestamp)) : 'Recently'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='p-8 text-center'>
                  <div className='text-4xl mb-4'>🚀</div>
                  <h3 className='font-medium mb-2'>No Activity Yet</h3>
                  <p className='text-sm text-muted-foreground mb-4'>
                    Start using One AI tools to see your activity here
                  </p>
                  <Button variant='outline' size='sm' asChild>
                    <Link href='/dashboard/tools/image-generator'>Generate Your First Image</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
