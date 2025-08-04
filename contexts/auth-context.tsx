'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback, useMemo } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { authDebug } from '@/lib/utils/debug';

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
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, plan: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use refs to prevent multiple simultaneous auth operations
  const isInitializing = useRef(false);
  const authListenerSetup = useRef(false);
  const lastProcessedEvent = useRef<string | null>(null);
  const loadingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Helper to set loading with timeout
  const setLoadingWithTimeout = useCallback((loading: boolean) => {
    if (loadingTimeout.current) {
      clearTimeout(loadingTimeout.current);
      loadingTimeout.current = null;
    }
    if (loading) {
      setIsLoading(true);
      // Set a maximum loading time of 5 seconds
      loadingTimeout.current = setTimeout(() => {
        authDebug.warn('Loading timeout reached, forcing loading to false');
        setIsLoading(false);
      }, 5000);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = useCallback(async (authUser: User): Promise<AuthUser> => {
    const supabase = getSupabaseClient();
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
  }, []);

  const refreshUser = useCallback(async () => {
    const supabase = getSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      setUser(null);
      setIsLoading(false);
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
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    // Don't set loading here as it conflicts with the auth listener
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        throw new Error(error?.message || 'Invalid email or password');
      }
      // Don't manually set user here - let the auth listener handle it
      // This prevents race conditions and duplicate state updates
    } catch (error) {
      // Re-throw the error to be handled by the caller
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, plan: string) => {
    const supabase = getSupabaseClient();
    // Don't set loading here as it conflicts with the auth listener
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
      // Don't manually set user here - let the auth listener handle it
      // This prevents race conditions and duplicate state updates
    } catch (error) {
      // Re-throw the error to be handled by the caller
      throw error;
    }
  }, []);

  // Only setup auth state listener once
  useEffect(() => {
    const supabase = getSupabaseClient();
    let mounted = true;
    let authSubscription: any = null;

    const initializeAuth = async () => {
      if (isInitializing.current) return;
      isInitializing.current = true;
      setLoadingWithTimeout(true);
      try {
        // First, try to get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (mounted && !error) {
          if (session?.user) {
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
          } else {
            setUser(null);
          }
          authDebug.log('Auth initialization complete', { hasUser: !!session?.user });
        }
      } catch (error) {
        if (mounted) {
          authDebug.error('Auth initialization error', error);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoadingWithTimeout(false);
          isInitializing.current = false;
        }
      }
    };

    // Set up auth state listener
    const setupAuthListener = () => {
      // Prevent multiple listeners
      if (authListenerSetup.current) {
        return;
      }
      authListenerSetup.current = true;
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          if (!mounted) return;
          // Prevent processing duplicate events
          const eventKey = `${event}-${session?.user?.id || 'no-session'}-${Date.now()}`;
          if (event !== 'TOKEN_REFRESHED' && event !== 'INITIAL_SESSION') {
            // For non-refresh events, check if we recently processed a similar event
            const lastEventTime = lastProcessedEvent.current?.split('-').pop();
            if (lastEventTime && Date.now() - parseInt(lastEventTime) < 100) {
              return;
            }
          }
          lastProcessedEvent.current = eventKey;
          authDebug.log('Auth state change', { event, userId: session?.user?.id });
          if (event === 'SIGNED_OUT' || !session) {
            setUser(null);
            authDebug.log('User signed out, clearing loading state');
            setLoadingWithTimeout(false);
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
            if (session?.user) {
              // Only update user if it's different
              if (!user || user.id !== session.user.id) {
                try {
                  const userProfile = await fetchUserProfile(session.user);
                  setUser(userProfile);
                } catch (profileError) {
                  authDebug.error('Profile fetch error', profileError);
                  setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.name || undefined
                  });
                }
              }
              authDebug.log('User authenticated, clearing loading state');
              setLoadingWithTimeout(false);
            }
          }
        }
      );
      authSubscription = subscription;
    };

    // Initialize everything
    initializeAuth();
    setupAuthListener();

    return () => {
      mounted = false;
      authListenerSetup.current = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, [setLoadingWithTimeout, fetchUserProfile, user]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
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