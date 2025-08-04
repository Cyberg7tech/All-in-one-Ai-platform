'use client'

import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'

export default function TestPage() {
  const { user, isAuthenticated } = useAuth()
<<<<<<< HEAD
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    const results = []
    
    // Test 1: Check if auth context is working
    results.push(`Auth Context: Ready`)
    
    // Test 2: Check authentication status
    results.push(`Authentication: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`)
    
    // Test 3: Check user data
    if (user) {
      results.push(`User: ${user.email} (${user.name || 'No name'})`)
    } else {
      results.push('User: Not logged in')
=======
  const [results, setResults] = useState<string[]>([])

  useEffect(() => {
    const runTests = () => {
      const results: string[] = []
      
      results.push(`Auth Context: Ready`)
      results.push(`User: ${user ? user.email : 'Not logged in'}`)
      results.push(`Authenticated: ${isAuthenticated ? 'Yes' : 'No'}`)
      
      // Check localStorage
      results.push('--- LocalStorage Keys ---')
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes('supabase')) {
          results.push(`Found: ${key}`)
        }
      }
      
      // Check sessionStorage
      results.push('--- SessionStorage Keys ---')
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.includes('supabase')) {
          results.push(`Found: ${key}`)
        }
      }
      
      setResults(results)
>>>>>>> 9fc9c4cfb4188dfdfb529d549129f2d94e14b44a
    }
    
    runTests()
    
    // Run tests every 2 seconds
    const interval = setInterval(runTests, 2000)
    
<<<<<<< HEAD
    setTestResults(results)
=======
    return () => clearInterval(interval)
>>>>>>> 9fc9c4cfb4188dfdfb529d549129f2d94e14b44a
  }, [user, isAuthenticated])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
<<<<<<< HEAD
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
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>User: {user ? user.email : 'None'}</p>
        </div>
        
        <div className="p-4 bg-green-100 rounded">
          <h2 className="font-semibold mb-2">Instructions:</h2>
          <p>If you see "Ready" for Auth Context and the page loads without getting stuck, the fixes are working.</p>
          <p>If you're still seeing loading issues, check the browser console for errors.</p>
        </div>
=======
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Current Status:</h2>
        <p>User: {user?.email || 'Not logged in'}</p>
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">Test Results:</h2>
        <pre className="text-sm">
          {results.join('\n')}
        </pre>
>>>>>>> 9fc9c4cfb4188dfdfb529d549129f2d94e14b44a
      </div>
    </div>
  )
} 