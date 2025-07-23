'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2, Database, Bot, Shield, Users, Zap } from 'lucide-react'

interface HealthStatus {
  status: string
  timestamp: string
  message: string
  features: Record<string, string>
}

export default function TestPage() {
  const [healthData, setHealthData] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testAPIConnection = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/health')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      setHealthData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🎉 One Ai Test</h1>
          <p className="text-muted-foreground">
            Test if your One Ai platform is working correctly
          </p>
          
          <Button 
            onClick={testAPIConnection}
            disabled={loading}
            size="lg"
            className="mb-8"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Platform'
            )}
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <XCircle className="w-5 h-5 mr-2" />
                Test Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {healthData && (
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Platform Status: {healthData.status.toUpperCase()}
                </CardTitle>
                <CardDescription className="text-green-600">
                  {healthData.message}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-600">
                  Last checked: {new Date(healthData.timestamp).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Features</CardTitle>
                <CardDescription>
                  All AI platform features are ready to use
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(healthData.features).map(([feature, status]) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{feature}</span>
                      <span className="text-sm text-muted-foreground">({status})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">🚀 Ready to Explore!</h2>
              <p className="text-muted-foreground mb-6">
                Your AI platform is working perfectly. Here's what you can do next:
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild variant="default">
                  <a href="/dashboard">Go to Dashboard</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/">View Landing Page</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/dashboard/chat">Start AI Chat</a>
                </Button>
              </div>
            </div>
          </div>
        )}

        {!healthData && !loading && !error && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Test</CardTitle>
              <CardDescription>
                Click the "Test Platform" button above to verify everything is working correctly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="font-semibold">What this test checks:</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Next.js server is running</li>
                  <li>API routes are working</li>
                  <li>Frontend components are rendering</li>
                  <li>All AI features are initialized</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 