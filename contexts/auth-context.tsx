'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Session, User } from '@supabase/supabase-js';

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

  const getUserFromSession = (session: Session | null): AuthUser | null => {
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email ?? '',
      name: session.user.user_metadata?.name ?? '',
    };
  };

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
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || undefined
        });
      }
    }
  }, [supabase, fetchUserProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      throw new Error(error?.message || 'Invalid email or password');
    }
    // The auth state change listener will handle updating the user
  }, [supabase]);

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
    }
    // The auth state change listener will handle updating the user
  }, [supabase]);

  useEffect(() => {
    // On mount, check current session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user).then(userProfile => {
          setUser(userProfile);
        }).catch(() => {
          setUser(getUserFromSession(session));
        });
      } else {
        setUser(null);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session) {
          setUser(null);
        } else if (session?.user) {
          try {
            const userProfile = await fetchUserProfile(session.user);
            setUser(userProfile);
          } catch (error) {
            setUser(getUserFromSession(session));
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchUserProfile]);

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