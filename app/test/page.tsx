'use client'

import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'

export default function TestPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    const results = []
    
    // Test 1: Check if auth context is working
    results.push(`Auth Context: ${isLoading ? 'Loading' : 'Ready'}`)
    
    // Test 2: Check authentication status
    results.push(`Authentication: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`)
    
    // Test 3: Check user data
    if (user) {
      results.push(`User: ${user.email} (${user.name || 'No name'})`)
    } else {
      results.push('User: Not logged in')
    }
    
    // Test 4: Check browser info
    results.push(`Browser: ${navigator.userAgent}`)
    
    // Test 5: Check storage
    try {
      const storageKeys = ['oneai-auth', 'supabase.auth.token']
      const storageStatus = storageKeys.map(key => {
        const hasLocal = localStorage.getItem(key) !== null
        const hasSession = sessionStorage.getItem(key) !== null
        return `${key}: ${hasLocal ? 'local' : ''}${hasSession ? 'session' : ''}`
      })
      results.push(`Storage: ${storageStatus.join(', ')}`)
    } catch (e) {
      results.push('Storage: Error checking')
    }
    
    setTestResults(results)
  }, [user, isLoading, isAuthenticated])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Test Results:</h2>
          <ul className="space-y-1">
            {testResults.map((result, index) => (
              <li key={index} className="text-sm">{result}</li>
            ))}
          </ul>
        </div>
        
        <div className="p-4 bg-blue-100 rounded">
          <h2 className="font-semibold mb-2">Current State:</h2>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>User: {user ? user.email : 'None'}</p>
        </div>
        
        <div className="p-4 bg-green-100 rounded">
          <h2 className="font-semibold mb-2">Instructions:</h2>
          <p>If you see "Ready" for Auth Context and the page loads without getting stuck, the fixes are working.</p>
          <p>If you're still seeing loading issues, check the browser console for errors.</p>
        </div>
      </div>
    </div>
  )
} 