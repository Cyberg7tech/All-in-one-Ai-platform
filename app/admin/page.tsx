'use client';

import { useState } from 'react';
import {
  Users,
  Activity,
  DollarSign,
  TrendingUp,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  apiCalls: number;
  systemHealth: 'good' | 'warning' | 'critical';
  uptime: string;
  storage: { used: number; total: number };
  memory: { used: number; total: number };
  cpu: number;
}

export default function AdminDashboard() {
  const [stats] = useState<DashboardStats>({
    totalUsers: 1247,
    activeUsers: 342,
    totalRevenue: 15420,
    apiCalls: 234567,
    systemHealth: 'good',
    uptime: '99.98%',
    storage: { used: 245, total: 500 },
    memory: { used: 12.4, total: 32 },
    cpu: 34,
  });

  const [recentActivity] = useState([
    { id: 1, user: 'john@example.com', action: 'Created AI Agent', time: '2 min ago', type: 'create' },
    { id: 2, user: 'sarah@company.com', action: 'Generated Image', time: '5 min ago', type: 'generate' },
    { id: 3, user: 'mike@startup.com', action: 'Upgraded to Pro', time: '12 min ago', type: 'upgrade' },
    { id: 4, user: 'lisa@agency.com', action: 'API Key Generated', time: '18 min ago', type: 'api' },
    { id: 5, user: 'tom@business.com', action: 'Voice Transcription', time: '25 min ago', type: 'generate' },
  ]);

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'good':
        return <CheckCircle className='size-4 text-green-500' />;
      case 'warning':
        return <AlertTriangle className='size-4 text-yellow-500' />;
      case 'critical':
        return <AlertTriangle className='size-4 text-red-500' />;
      default:
        return <CheckCircle className='size-4 text-green-500' />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <div className='size-2 bg-blue-500 rounded-full' />;
      case 'generate':
        return <div className='size-2 bg-green-500 rounded-full' />;
      case 'upgrade':
        return <div className='size-2 bg-purple-500 rounded-full' />;
      case 'api':
        return <div className='size-2 bg-orange-500 rounded-full' />;
      default:
        return <div className='size-2 bg-gray-500 rounded-full' />;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
          <p className='text-muted-foreground'>Platform overview and system metrics</p>
        </div>
        <div className='flex items-center space-x-2'>
          {getHealthIcon(stats.systemHealth)}
          <span className='text-sm font-medium'>System Healthy</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalUsers.toLocaleString()}</div>
            <p className='text-xs text-muted-foreground'>
              <span className='text-green-600'>+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Users</CardTitle>
            <Activity className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.activeUsers}</div>
            <p className='text-xs text-muted-foreground'>Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Revenue</CardTitle>
            <DollarSign className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>${stats.totalRevenue.toLocaleString()}</div>
            <p className='text-xs text-muted-foreground'>
              <span className='text-green-600'>+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>API Calls</CardTitle>
            <TrendingUp className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{(stats.apiCalls / 1000).toFixed(1)}K</div>
            <p className='text-xs text-muted-foreground'>This month</p>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Server className='size-5 mr-2' />
              System Resources
            </CardTitle>
            <CardDescription>Real-time system performance metrics</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='flex items-center'>
                  <Cpu className='size-4 mr-2 text-blue-500' />
                  CPU Usage
                </span>
                <span className='font-medium'>{stats.cpu}%</span>
              </div>
              <div className='w-full bg-muted rounded-full h-2'>
                <div
                  className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${stats.cpu}%` }}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='flex items-center'>
                  <Database className='size-4 mr-2 text-green-500' />
                  Memory
                </span>
                <span className='font-medium'>
                  {stats.memory.used}GB / {stats.memory.total}GB
                </span>
              </div>
              <div className='w-full bg-muted rounded-full h-2'>
                <div
                  className='bg-green-500 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${(stats.memory.used / stats.memory.total) * 100}%` }}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='flex items-center'>
                  <HardDrive className='size-4 mr-2 text-purple-500' />
                  Storage
                </span>
                <span className='font-medium'>
                  {stats.storage.used}GB / {stats.storage.total}GB
                </span>
              </div>
              <div className='w-full bg-muted rounded-full h-2'>
                <div
                  className='bg-purple-500 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${(stats.storage.used / stats.storage.total) * 100}%` }}
                />
              </div>
            </div>

            <div className='flex items-center justify-between pt-2 border-t'>
              <span className='flex items-center text-sm'>
                <Wifi className='size-4 mr-2 text-green-500' />
                Uptime
              </span>
              <Badge variant='secondary' className='text-green-600'>
                {stats.uptime}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Activity className='size-5 mr-2' />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest user actions and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {recentActivity.map((activity) => (
                <div key={activity.id} className='flex items-center space-x-3'>
                  {getActivityIcon(activity.type)}
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>{activity.action}</p>
                    <p className='text-xs text-muted-foreground'>{activity.user}</p>
                  </div>
                  <div className='flex items-center text-xs text-muted-foreground'>
                    <Clock className='size-3 mr-1' />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
            <Button variant='outline' className='w-full mt-4'>
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Button variant='outline' className='h-20 flex-col'>
              <Users className='size-6 mb-2' />
              Manage Users
            </Button>
            <Button variant='outline' className='h-20 flex-col'>
              <Database className='size-6 mb-2' />
              Database
            </Button>
            <Button variant='outline' className='h-20 flex-col'>
              <TrendingUp className='size-6 mb-2' />
              Analytics
            </Button>
            <Button variant='outline' className='h-20 flex-col'>
              <Server className='size-6 mb-2' />
              System Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
