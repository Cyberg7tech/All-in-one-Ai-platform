'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'

export default function AuthDebugPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [storageInfo, setStorageInfo] = useState<any>({})
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  useEffect(() => {
    // Check all storage keys
    const checkStorage = () => {
      const storage: any = {}
      
      // Check localStorage
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('supabase') || key.includes('auth') || key.includes('oneai'))) {
            storage[`localStorage: ${key}`] = localStorage.getItem(key)?.substring(0, 50) + '...'
          }
        }
      } catch (e) {
        storage.localStorageError = e.message
      }

      // Check sessionStorage
      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key && (key.includes('supabase') || key.includes('auth') || key.includes('oneai'))) {
            storage[`sessionStorage: ${key}`] = sessionStorage.getItem(key)?.substring(0, 50) + '...'
          }
        }
      } catch (e) {
        storage.sessionStorageError = e.message
      }

      setStorageInfo(storage)
    }

    // Check Supabase session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      setSessionInfo({
        hasSession: !!session,
        sessionError: error?.message,
        user: session?.user?.email,
        expiresAt: session?.expires_at,
        tokenType: session?.token_type
      })
    }

    checkStorage()
    checkSession()

    // Refresh every 2 seconds
    const interval = setInterval(() => {
      checkStorage()
      checkSession()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Information</h1>
      
      <div className="space-y-6">
        {/* Auth Context Status */}
        <div className="p-4 bg-blue-100 rounded">
          <h2 className="font-semibold mb-2">Auth Context Status:</h2>
          <pre className="text-sm">
            {JSON.stringify({
              isLoading,
              isAuthenticated,
              userEmail: user?.email,
              userName: user?.name
            }, null, 2)}
          </pre>
        </div>

        {/* Supabase Session */}
        <div className="p-4 bg-green-100 rounded">
          <h2 className="font-semibold mb-2">Supabase Session:</h2>
          <pre className="text-sm">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>

        {/* Storage Info */}
        <div className="p-4 bg-yellow-100 rounded">
          <h2 className="font-semibold mb-2">Storage Keys:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(storageInfo, null, 2)}
          </pre>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Debug Instructions:</h2>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>Login to your account</li>
            <li>Check if session persists in storage</li>
            <li>Refresh the page</li>
            <li>Check if you're still logged in</li>
            <li>If logged out, check which storage keys are missing</li>
          </ol>
        </div>
      </div>
    </div>
  )
}