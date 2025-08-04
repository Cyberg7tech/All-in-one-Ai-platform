"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    console.log('🔍 ProtectedRoute:', { isLoading, isAuthenticated, userEmail: user?.email })

    // Only run when loading has finished
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        console.log('🔄 Redirecting to login - not authenticated')
        router.replace('/login')
      } else {
        console.log('✅ User authenticated:', user.email)
        setAuthChecked(true)
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  // Show loading while checking authentication
  if (isLoading || !authChecked) {
    console.log('⏳ Showing loading state')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Only render children when authenticated and auth check is complete
  console.log('✅ Rendering protected content')
  return <>{children}</>
}

export default ProtectedRoute 