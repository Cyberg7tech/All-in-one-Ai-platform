'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Session } from '@supabase/supabase-js'

interface AuthUser {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean // kept for backward-compatibility, always false
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabaseClient()
  const [user, setUser] = useState<AuthUser | null>(null)

  const getUserFromSession = (session: Session | null): AuthUser | null => {
    if (!session?.user) return null
    return {
      id: session.user.id,
      email: session.user.email ?? '',
      name: session.user.user_metadata?.name ?? undefined,
    }
  }

  const refreshUser = async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error fetching session:', error)
    }
    setUser(getUserFromSession(data?.session ?? null))
  }

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setUser(getUserFromSession(data.session))
  }

  const signup = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw error
    setUser(getUserFromSession(data.session))
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  useEffect(() => {
    // Hydrate initial session
    refreshUser()

    // Subscribe to auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(getUserFromSession(session))
    })

    return () => subscription?.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading: false,
    login,
    logout,
    signup,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
} 