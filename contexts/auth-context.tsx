"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { authCircuitBreaker, loadingManager } from '@/lib/utils/circuit-breaker';

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
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      const userProfile = await fetchUserProfile(data.user);
      setUser(userProfile);
    }
  };

  useEffect(() => {
    let mounted = true;
    let sessionCheckAttempted = false;
    
    // Check for existing session on mount with circuit breaker
    const getSession = async () => {
      if (!mounted || sessionCheckAttempted) return;
      sessionCheckAttempted = true;
      setIsLoading(true);
      
      // Start loading tracking
      loadingManager.startLoading('auth', 30000); // 30 second max
      
      // CHROMIUM BROWSER SPECIAL HANDLING
      const isChromium = typeof window !== 'undefined' && 
        (navigator.userAgent.toLowerCase().includes('chrome') || 
         navigator.userAgent.toLowerCase().includes('chromium') || 
         navigator.userAgent.toLowerCase().includes('edge') || 
         navigator.userAgent.toLowerCase().includes('brave'));
      
      if (isChromium) {
        console.log('CHROMIUM DETECTED: Using enhanced auth recovery');
        
        // NUCLEAR RECOVERY: Force reload if completely stuck
        const nuclearTimer = setTimeout(() => {
          console.warn('NUCLEAR RECOVERY: Chromium auth completely stuck - forcing reload');
          window.location.reload();
        }, 30000); // 30 seconds for Chromium
        
        // Cancel nuclear recovery if auth succeeds
        const cancelNuclear = () => clearTimeout(nuclearTimer);
        
        // Store cleanup function
        (window as any).__cancelNuclearRecovery = cancelNuclear;
      } else {
        console.log('NON-CHROMIUM: Using standard auth - will persist until manual logout');
      }
      
      try {
        // Use circuit breaker for auth calls
        const result = await authCircuitBreaker.execute(
          async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            return data;
          },
          () => ({ user: null }) // Fallback
        );
        
        if (mounted) {
          loadingManager.clearLoading('auth');
          
          // Cancel nuclear recovery on success
          if (typeof window !== 'undefined' && (window as any).__cancelNuclearRecovery) {
            (window as any).__cancelNuclearRecovery();
          }
          
          if (result?.user) {
            const userProfile = await fetchUserProfile(result.user);
            setUser(userProfile);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (mounted) {
          loadingManager.clearLoading('auth');
          // Don't set user to null on error - let them retry
          console.log('Auth error occurred, but keeping current session state');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Use requestIdleCallback for better performance during hot reloads
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => getSession(), { timeout: 1000 });
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(getSession, 100);
    }
    
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
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
    
    // Handle tab visibility changes to prevent unnecessary loading
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !sessionCheckAttempted) {
        sessionCheckAttempted = false; // Reset to allow retry
        getSession();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      mounted = false;
      loadingManager.clearLoading('auth');
      listener?.subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Force cleanup on unmount
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          loadingManager.clearAll();
        }, 100);
      }
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
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  };

  const signup = async (email: string, password: string, name: string, plan: string) => {
    setIsLoading(true);
    try {
      // 1. Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, subscription_plan: plan },
        },
      });
      if (error || !data.user) {
        throw new Error(error?.message || 'Sign up failed');
      }
      // 2. Optionally insert into users table for profile info
      await supabase.from('users').upsert({
        id: data.user.id,
        email,
        name,
        subscription_plan: plan,
        role: 'user',
      });
      const userProfile = await fetchUserProfile(data.user);
      setUser(userProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
    refreshUser,
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