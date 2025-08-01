"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  subscription_plan?: string;
  created_at?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, plan: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (authUser: any): Promise<AuthUser> => {
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
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const userProfile = await fetchUserProfile(session.user);
      setUser(userProfile);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Check for existing session on mount
    const getSession = async () => {
      try {
        // Use getSession for better session recovery
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            const userProfile = await fetchUserProfile(session.user);
            setUser(userProfile);
          } else {
            setUser(null);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };
    
    // Get initial session
    getSession();
    
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;
      
      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user);
        setUser(userProfile);
        setIsLoading(false);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });
    
    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        throw new Error(error?.message || 'Invalid email or password');
      }
      const userProfile = await fetchUserProfile(data.user);
      setUser(userProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const signup = async (email: string, password: string, name: string, plan: string) => {
    setIsLoading(true);
    try {
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

      // Set user state
      const userProfile = await fetchUserProfile(data.user);
      setUser(userProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 