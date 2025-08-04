'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { TrendingUp, TrendingDown, Users, Bot, Brain, Zap, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

interface MetricCard {
  title: string
  value: string | number
  change: number
  icon: any
  trend: 'up' | 'down' | 'neutral'
  description: string
}

interface ChartData {
  name: string
  value: number
  fill?: string
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState('7d')
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [usageData, setUsageData] = useState<ChartData[]>([])
  const [modelUsage, setModelUsage] = useState<ChartData[]>([])
  const [errorData, setErrorData] = useState<ChartData[]>([])

  // Ref to prevent infinite loops
  const hasLoadedAnalytics = useRef(false);

  useEffect(() => {
    if (!user?.id || hasLoadedAnalytics.current) return;
    
    loadAnalyticsData()
    hasLoadedAnalytics.current = true;
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Separate effect for timeRange changes
  useEffect(() => {
    if (user?.id && hasLoadedAnalytics.current) {
      loadAnalyticsData()
    }
  }, [timeRange]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAnalyticsData = () => {
    // Generate analytics based on user data
    const stats = {
      aiAgents: 3,
      apiCalls: 1247,
      forecasts: 8,
      alerts: 2,
      documentsProcessed: 45,
      totalTokensUsed: 125680,
      monthlyUsage: 78.5, // percentage
      storageUsed: 2.3 // GB
    }
    
    // Generate metrics based on user role
    const userMetrics: MetricCard[] = [
      {
        title: 'API Calls',
        value: stats.apiCalls.toLocaleString(),
        change: user?.role === 'admin' ? 12.5 : 8.3,
        icon: Brain,
        trend: 'up',
        description: 'Total API requests this period'
      },
      {
        title: 'Active Agents',
        value: stats.aiAgents,
        change: user?.role === 'admin' ? 25.0 : 15.2,
        icon: Bot,
        trend: 'up', 
        description: 'Currently running AI agents'
      },
      {
        title: 'Success Rate',
        value: user?.role === 'admin' ? '99.2%' : '98.7%',
        change: 2.1,
        icon: CheckCircle,
        trend: 'up',
        description: 'Successful API responses'
      },
      {
        title: 'Avg Response Time',
        value: user?.role === 'admin' ? '245ms' : '312ms',
        change: -5.4,
        icon: Clock,
        trend: 'up',
        description: 'Average API response time'
      },
      {
        title: 'Monthly Cost',
        value: user?.subscription_plan === 'enterprise' ? '$1,247' : user?.subscription_plan === 'pro' ? '$89' : '$0',
        change: user?.role === 'admin' ? 15.8 : 12.1,
        icon: DollarSign,
        trend: 'up',
        description: 'Total usage cost this month'
      },
      {
        title: 'Error Rate',
        value: user?.role === 'admin' ? '0.8%' : '1.3%',
        change: -12.5,
        icon: AlertTriangle,
        trend: 'up',
        description: 'Failed requests percentage'
      }
    ]

    // Usage data over time
    const usage: ChartData[] = [
      { name: 'Mon', value: user?.role === 'admin' ? 2400 : 850 },
      { name: 'Tue', value: user?.role === 'admin' ? 3200 : 1200 },
      { name: 'Wed', value: user?.role === 'admin' ? 2800 : 980 },
      { name: 'Thu', value: user?.role === 'admin' ? 3800 : 1400 },
      { name: 'Fri', value: user?.role === 'admin' ? 4200 : 1600 },
      { name: 'Sat', value: user?.role === 'admin' ? 2100 : 750 },
      { name: 'Sun', value: user?.role === 'admin' ? 1800 : 600 }
    ]

    // Model usage distribution
    const models: ChartData[] = user?.role === 'admin' ? [
      { name: 'GPT-4', value: 45, fill: '#8884d8' },
      { name: 'Claude-3', value: 25, fill: '#82ca9d' },
      { name: 'GPT-3.5', value: 20, fill: '#ffc658' },
      { name: 'Llama-2', value: 10, fill: '#ff7300' }
    ] : [
      { name: 'GPT-4', value: 60, fill: '#8884d8' },
      { name: 'Claude-3', value: 30, fill: '#82ca9d' },
      { name: 'GPT-3.5', value: 10, fill: '#ffc658' }
    ]

    // Error tracking
    const errors: ChartData[] = [
      { name: 'Rate Limit', value: user?.role === 'admin' ? 45 : 25 },
      { name: 'Timeout', value: user?.role === 'admin' ? 30 : 15 },
      { name: 'Invalid Request', value: user?.role === 'admin' ? 20 : 8 },
      { name: 'Auth Error', value: user?.role === 'admin' ? 5 : 2 }
    ]

    setMetrics(userMetrics)
    setUsageData(usage)
    setModelUsage(models)
    setErrorData(errors)
  }

  const timeRanges = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
    { label: 'Last year', value: '1y' }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your One Ai usage, performance, and costs
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex space-x-2">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    {metric.trend === 'up' ? (
                      <TrendingUp className={`w-4 h-4 mr-1 ${
                        metric.change > 0 ? 'text-green-500' : 'text-red-500'
                      }`} />
                    ) : (
                      <TrendingDown className={`w-4 h-4 mr-1 ${
                        metric.change > 0 ? 'text-red-500' : 'text-green-500'
                      }`} />
                    )}
                    <span className={`text-sm ${
                      metric.change > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {Math.abs(metric.change)}%
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      vs last period
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <metric.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle>API Usage Trend</CardTitle>
            <CardDescription>Daily API calls over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {usageData.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-primary rounded-t-sm w-full transition-all hover:bg-primary/80"
                    style={{ 
                      height: `${(data.value / Math.max(...usageData.map(d => d.value))) * 200}px`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <span className="text-xs text-muted-foreground mt-2">{data.name}</span>
                  <span className="text-xs font-medium">{data.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Model Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Model Usage Distribution</CardTitle>
            <CardDescription>Breakdown of AI model usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modelUsage.map((model, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: model.fill }}
                    ></div>
                    <span className="font-medium">{model.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{model.value}%</span>
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${model.value}%`,
                          backgroundColor: model.fill 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Error Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Error Analysis</CardTitle>
            <CardDescription>Types of errors encountered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {errorData.map((error, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{error.name}</span>
                  <Badge variant="outline">{error.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Peak Usage Hour</span>
                <span className="text-sm font-medium">2:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Fastest Model</span>
                <span className="text-sm font-medium">GPT-3.5 Turbo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Most Used Feature</span>
                <span className="text-sm font-medium">Text Generation</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg Session Length</span>
                <span className="text-sm font-medium">12.5 minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common analytics tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                Export Usage Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="w-4 h-4 mr-2" />
                View Error Logs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="w-4 h-4 mr-2" />
                Cost Breakdown
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                User Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Alerts */}
      {user?.subscription_plan !== 'enterprise' && (
        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-800">Usage Alert</h4>
                <p className="text-sm text-yellow-700">
                  You've used 78% of your monthly limit. 
                  Consider upgrading to avoid service interruption.
                </p>
              </div>
              <Button size="sm" className="ml-auto">
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 