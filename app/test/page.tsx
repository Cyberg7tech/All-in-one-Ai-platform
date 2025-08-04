'use client'

import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'

export default function TestPage() {
  const { user, isAuthenticated } = useAuth()
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
    }
    
    runTests()
  }, [user, isAuthenticated])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
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
      </div>
    </div>
  )
} 