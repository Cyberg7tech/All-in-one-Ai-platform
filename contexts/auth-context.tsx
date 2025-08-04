"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import BrowserDebugger from '@/lib/utils/browser-debugger';

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
  const debug = BrowserDebugger.getInstance();
  
  // Use refs to prevent multiple simultaneous auth operations
  const isInitializing = useRef(false);
  const authListenerSetup = useRef(false);
  const lastProcessedEvent = useRef<string | null>(null);

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
    let authSubscription: any = null;
    
    // Initialize auth state
    const initializeAuth = async () => {
      // Prevent multiple simultaneous initializations
      if (isInitializing.current) {
        return;
      }
      
      isInitializing.current = true;
      
      try {
        // First, try to get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted && !error) {
          if (session?.user) {
            debug.log('Found existing session', 'success');
            try {
              const userProfile = await fetchUserProfile(session.user);
              setUser(userProfile);
              debug.log('User profile loaded successfully', 'success');
            } catch (profileError) {
              debug.log('Error fetching user profile, using basic info', 'warn');
              // If profile fetch fails, still set basic user info
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || undefined
              });
            }
          } else {
            debug.log('No existing session found', 'info');
            setUser(null);
          }
          setIsLoading(false);
          debug.log('Auth initialization complete', 'success');
        }
      } catch (error) {
        if (mounted) {
          debug.log(`Error initializing auth: ${error}`, 'error');
          setUser(null);
          setIsLoading(false);
        }
      } finally {
        isInitializing.current = false;
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
          const eventKey = `${event}-${session?.user?.id || 'no-session'}`;
          if (lastProcessedEvent.current === eventKey && event !== 'TOKEN_REFRESHED') {
            return;
          }
          lastProcessedEvent.current = eventKey;
          
          debug.log(`Auth state changed: ${event} (session: ${!!session})`, 'info');
          
          if (event === 'SIGNED_OUT' || !session) {
            debug.log('User signed out', 'info');
            setUser(null);
            setIsLoading(false);
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.user && user?.id !== session.user.id) {
              debug.log(`Processing ${event} event`, 'info');
              try {
                const userProfile = await fetchUserProfile(session.user);
                setUser(userProfile);
                debug.log('User profile updated from auth change', 'success');
              } catch (profileError) {
                debug.log('Error fetching user profile on auth change', 'warn');
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || undefined
                });
              }
            }
            setIsLoading(false);
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