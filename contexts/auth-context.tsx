'use client';
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let mounted = true;

    const initializeAuth = async () => {
      try {
        const client = getSupabaseClient();
        
        // Get initial session
        const { data: { session }, error } = await client.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error('Error getting session:', error);
          } else {
            setUser(getUserFromSession(session));
          }
          setIsLoading(false);
        }

        // Listen for auth changes
        const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
          if (mounted) {
            setUser(getUserFromSession(session));
          }
        });

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
  }, [isClient]);

  const getUserFromSession = (session: Session | null): AuthUser | null => {
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email ?? '',
      name: session.user.user_metadata?.name ?? '',
    };
  };

  const refreshUser = async () => {
    if (!isClient) return;
    const client = getSupabaseClient();
    const { data: { session }, error } = await client.auth.getSession();
    if (error || !session?.user) {
      setUser(null);
    } else {
      setUser(getUserFromSession(session));
    }
  };

  const login = async (email: string, password: string) => {
    if (!isClient) throw new Error('Client not initialized');
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    setUser(getUserFromSession(data.session));
  };

  const logout = async () => {
    if (!isClient) return;
    const client = getSupabaseClient();
    await client.auth.signOut();
    setUser(null);
  };

  const signup = async (email: string, password: string, name: string, plan: string) => {
    if (!isClient) throw new Error('Client not initialized');
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signUp({ email, password });
    if (error || !data.user) throw new Error(error?.message || 'Signup failed');
    await client.from('users').insert({
      id: data.user.id,
      email,
      name,
      role: 'user',
      subscription_plan: plan,
    });
    setUser(getUserFromSession(data.session));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, signup, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
} 