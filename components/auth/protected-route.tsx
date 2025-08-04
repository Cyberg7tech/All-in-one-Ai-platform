'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (requireAuth && !user && !isAuthenticated) {
      router.replace(redirectTo)
    }
  }, [user, isAuthenticated, requireAuth, redirectTo, router])

  // Always render immediately - no loading screens
  return <>{children}</>
}
