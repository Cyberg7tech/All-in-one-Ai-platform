'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Session, User } from '@supabase/supabase-js'

interface AuthUser {
  id: string
  email: string
  name?: string
  role?: string
  subscription_plan?: string
  created_at?: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (email: string, password: string, name: string, plan: string) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const getUserFromSession = (session: Session | null): AuthUser | null => {
    if (!session?.user) return null
    return {
      id: session.user.id,
      email: session.user.email ?? '',
      name: session.user.user_metadata?.name ?? '',
    }
  }

  const fetchUserProfile = useCallback(async (authUser: User): Promise<AuthUser> => {
    const supabase = getSupabaseClient()
    // Fetch user profile from users table
    const { data: profile } = await supabase
      .from('users')
      .select('name, role, subscription_plan, created_at')
      .eq('id', authUser.id)
      .single()
    
    return {
      id: authUser.id,
      email: authUser.email || '',
      name: profile?.name as string | undefined,
      role: profile?.role as string | undefined,
      subscription_plan: profile?.subscription_plan as string | undefined,
      created_at: profile?.created_at as string | undefined,
    }
  }, [])

  const refreshUser = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session?.user) {
      setUser(null)
      setIsLoading(false)
    } else {
      try {
        const userProfile = await fetchUserProfile(session.user)
        setUser(userProfile)
      } catch (profileError) {
        // If profile fetch fails, still set basic user info
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || undefined
        })
      }
      setIsLoading(false)
    }
  }, [fetchUserProfile])

  const login = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseClient()
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user) {
        throw new Error(error?.message || 'Invalid email or password')
      }
      const userProfile = await fetchUserProfile(data.user)
      setUser(userProfile)
    } finally {
      setIsLoading(false)
    }
  }, [fetchUserProfile])

  const signup = useCallback(async (email: string, password: string, name: string, plan: string) => {
    const supabase = getSupabaseClient()
    setIsLoading(true)
    try {
      // Create user account
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error || !data.user) {
        throw new Error(error?.message || 'Failed to create account')
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          name,
          subscription_plan: plan,
          role: 'user'
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        // Don't throw here as the auth account was created successfully
      }

      // Set user state
      const userProfile = await fetchUserProfile(data.user)
      setUser(userProfile)
    } finally {
      setIsLoading(false)
    }
  }, [fetchUserProfile])

  const logout = useCallback(async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  // Only setup auth state listener once
  useEffect(() => {
    const supabase = getSupabaseClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user).then(setUser).catch(() => {
          setUser(getUserFromSession(session))
        })
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    refreshUser() // Load on mount

    return () => subscription.unsubscribe()
  }, [refreshUser, fetchUserProfile])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 