'use client'

import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'

export default function TestAuthPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [renderCount, setRenderCount] = useState(0)

  useEffect(() => {
    setRenderCount(prev => prev + 1)
  }, [])

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Auth State Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded">
            <h2 className="font-semibold">Current State:</h2>
            <p><strong>isLoading:</strong> {isLoading.toString()}</p>
            <p><strong>isAuthenticated:</strong> {isAuthenticated.toString()}</p>
            <p><strong>User:</strong> {user ? user.email : 'null'}</p>
            <p><strong>Render Count:</strong> {renderCount}</p>
          </div>

          <div className="p-4 bg-yellow-50 rounded">
            <h2 className="font-semibold">Debug Info:</h2>
            <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
            <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'Server'}</p>
          </div>

          {isLoading && (
            <div className="p-4 bg-red-50 rounded">
              <h2 className="font-semibold text-red-800">⚠️ Still Loading!</h2>
              <p className="text-red-600">The auth context is still in loading state.</p>
            </div>
          )}

          {!isLoading && isAuthenticated && (
            <div className="p-4 bg-green-50 rounded">
              <h2 className="font-semibold text-green-800">✅ Authenticated!</h2>
              <p className="text-green-600">User is authenticated and loading is complete.</p>
            </div>
          )}

          {!isLoading && !isAuthenticated && (
            <div className="p-4 bg-orange-50 rounded">
              <h2 className="font-semibold text-orange-800">⚠️ Not Authenticated</h2>
              <p className="text-orange-600">Loading is complete but user is not authenticated.</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Force Refresh
          </button>
        </div>
      </div>
    </div>
  )
} 