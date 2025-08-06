'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useSupabaseClient } from '@/components/providers/supabase-provider';
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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, plan: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const supabase = useSupabaseClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(getUserFromSession(session));
        setIsLoading(false);
      } catch (error) {
        console.error('Error getting session:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
      setUser(getUserFromSession(session));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [mounted, supabase]);

  const getUserFromSession = (session: Session | null): AuthUser | null => {
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email ?? '',
      name: session.user.user_metadata?.name ?? '',
    };
  };

  const refreshUser = async () => {
    if (!mounted) return;
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error('Error refreshing session:', error);
        // If there's an auth error, clear the user and try to refresh
        if (error.message.includes('Invalid Refresh Token')) {
          await supabase.auth.signOut();
        }
        setUser(null);
      } else if (!session?.user) {
        setUser(null);
      } else {
        setUser(getUserFromSession(session));
      }
    } catch (error) {
      console.error('Error in refreshUser:', error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    if (!mounted) throw new Error('Component not mounted');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    // Session will be handled by the useSession hook
  };

  const logout = async () => {
    if (!mounted) return;
    await supabase.auth.signOut();
    // Session will be handled by the useSession hook
  };

  const signup = async (email: string, password: string, name: string, plan: string) => {
    if (!mounted) throw new Error('Component not mounted');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) throw new Error(error?.message || 'Signup failed');
    await supabase.from('users').insert({
      id: data.user.id,
      email,
      name,
      role: 'user',
      subscription_plan: plan,
    });
    // Session will be handled by the useSession hook
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout, signup, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
