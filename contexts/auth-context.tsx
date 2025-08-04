'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  subscription_plan?: string;
  created_at?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, plan: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const supabase = getSupabaseClient();

  const fetchUserProfile = useCallback(async (authUser: User): Promise<AuthUser> => {
    // Fetch user profile from users table
    const { data: profile } = await supabase
      .from('users')
      .select('name, role, subscription_plan, created_at')
      .eq('id', authUser.id)
      .single();
    
    return {
      id: authUser.id,
      email: authUser.email || '',
      name: profile?.name as string | undefined,
      role: profile?.role as string | undefined,
      subscription_plan: profile?.subscription_plan as string | undefined,
      created_at: profile?.created_at as string | undefined,
    };
  }, [supabase]);

  const getUserFromSession = useCallback((session: Session | null): AuthUser | null => {
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email ?? '',
      name: session.user.user_metadata?.name ?? '',
    };
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      setUser(null);
    } else {
      try {
        const userProfile = await fetchUserProfile(session.user);
        setUser(userProfile);
      } catch (profileError) {
        // If profile fetch fails, still set basic user info
        setUser(getUserFromSession(session));
      }
    }
  }, [supabase, fetchUserProfile, getUserFromSession]);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      throw new Error(error?.message || 'Invalid email or password');
    }
    
    // Immediately set basic user info to prevent race conditions
    const basicUser = getUserFromSession(data.session);
    if (basicUser) {
      setUser(basicUser);
      
      // Fetch full profile in background
      fetchUserProfile(data.user)
        .then(setUser)
        .catch(() => {
          console.warn('Failed to fetch user profile after login, using basic session data');
        });
    }
  }, [supabase, getUserFromSession, fetchUserProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  const signup = useCallback(async (email: string, password: string, name: string, plan: string) => {
    // Create user account
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      throw new Error(error?.message || 'Failed to create account');
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
      });
    
    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Don't throw here as the auth account was created successfully
    }
    
    // Immediately set user info if session exists
    if (data.session) {
      const basicUser = getUserFromSession(data.session);
      if (basicUser) {
        setUser({ ...basicUser, name, subscription_plan: plan, role: 'user' });
      }
    }
  }, [supabase, getUserFromSession]);

  useEffect(() => {
    // Get initial session immediately - use basic user info first for speed
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Set basic user info immediately to avoid loading states
        setUser(getUserFromSession(session));
        
        // Then fetch full profile in background
        fetchUserProfile(session.user)
          .then(setUser)
          .catch(() => {
            // Keep the basic user info if profile fetch fails
            console.warn('Failed to fetch user profile, using basic session data');
          });
      } else {
        setUser(null);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
        } else if (session?.user) {
          // Set basic info first for immediate UI update
          setUser(getUserFromSession(session));
          
          // Then update with full profile
          try {
            const userProfile = await fetchUserProfile(session.user);
            setUser(userProfile);
          } catch (profileError) {
            // Keep the basic user info if profile fetch fails
            console.warn('Failed to fetch user profile, using basic session data');
          }
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [supabase, fetchUserProfile, getUserFromSession]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 