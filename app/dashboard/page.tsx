'use client'

import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Bot, Brain, TrendingUp, Shield, Sparkles, Plus, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { DemoAuthService } from '@/lib/auth/demo-auth'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

// Remove metadata export since this is now a client component

const quickActions = [
  {
    icon: Bot,
    title: 'Create AI Agent',
    description: 'Build a custom AI agent with specialized tools',
    href: '/dashboard/agents/new',
    color: 'text-blue-500'
  },
  {
    icon: Brain,
    title: 'Chat with AI',
    description: 'Start a conversation with our AI models',
    href: '/dashboard/chat',
    color: 'text-purple-500'
  },
  {
    icon: TrendingUp,
    title: 'Create Forecast',
    description: 'Generate predictions from your data',
    href: '/dashboard/forecasting',
    color: 'text-green-500'
  },
  {
    icon: Shield,
    title: 'Monitor Anomalies',
    description: 'Set up anomaly detection alerts',
    href: '/dashboard/anomalies',
    color: 'text-red-500'
  }
]

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const userStats = DemoAuthService.getDemoStats(user.id);
      const userActivities = DemoAuthService.getRecentActivities(user.id);
      setStats(userStats);
      setRecentActivity(userActivities);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
              <p className="text-muted-foreground">
                Ready to build something amazing with AI? Here's what you can do today.
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                user?.subscription === 'enterprise' 
                  ? 'bg-purple-100 text-purple-700' 
                  : user?.subscription === 'pro'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                PRO Plan
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Member since 1/1/2024
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Quick Actions</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/explore">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-background ${action.color} group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {action.description}
                  </CardDescription>
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link href={action.href}>
                      Get Started
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">AI Agents</p>
                    <p className="text-2xl font-bold text-primary">{stats?.aiAgents || 0}</p>
                  </div>
                  <Bot className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">API Calls</p>
                    <p className="text-2xl font-bold text-primary">{stats?.apiCalls?.toLocaleString() || 0}</p>
                  </div>
                  <Brain className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Forecasts</p>
                    <p className="text-2xl font-bold text-primary">{stats?.forecasts || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Alerts</p>
                    <p className="text-2xl font-bold text-primary">{stats?.alerts || 0}</p>
                  </div>
                  <Shield className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Recent Activity</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/activity">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg">{activity.icon}</div>
                        <div>
                          <p className="font-medium">{activity.name}</p>
                          <p className="text-sm text-muted-foreground">{activity.type}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
} 