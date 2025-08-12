'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useSupabaseClient } from '@/components/providers/supabase-provider';
import { User } from '@supabase/supabase-js';

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
  signup: (email: string, password: string, name: string, plan?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useSupabaseClient();

  const updateUserFromSession = useCallback(
    async (sessionUser: User) => {
      try {
        console.log('Updating user from session:', sessionUser.email);

        // Skip database calls during SSR
        if (!supabase) {
          const userData = {
            id: sessionUser.id,
            email: sessionUser.email ?? '',
            name: sessionUser.user_metadata?.name || '',
            role: 'user',
            subscription_plan: 'free',
            created_at: sessionUser.created_at,
          };
          setUser(userData);
          console.log('Set user data (SSR):', userData);
          return;
        }

        // First try to get user data from database
        const { data: userData, error } = await supabase
          .from('users')
          .select('name, role, subscription_plan, created_at')
          .eq('id', sessionUser.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user data:', error);
        }

        const finalUserData = {
          id: sessionUser.id,
          email: sessionUser.email ?? '',
          name: userData?.name || sessionUser.user_metadata?.name || '',
          role: userData?.role || 'user',
          subscription_plan: userData?.subscription_plan || 'free',
          created_at: userData?.created_at || sessionUser.created_at,
        };

        setUser(finalUserData);
        console.log('Set user data (with DB):', finalUserData);
      } catch (error) {
        console.error('Error updating user from session:', error);
        // Fallback to basic user data
        const fallbackData = {
          id: sessionUser.id,
          email: sessionUser.email ?? '',
          name: sessionUser.user_metadata?.name || '',
          role: 'user',
          subscription_plan: 'free',
          created_at: sessionUser.created_at,
        };
        setUser(fallbackData);
        console.log('Set user data (fallback):', fallbackData);
      }
    },
    [supabase]
  );

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    console.log('Setting up auth listener...');

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log('Initial session:', session?.user?.email || 'No session');

        if (session?.user) {
          await updateUserFromSession(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
        console.log('Auth initialization complete');
      }
    };

    // Initialize auth state
    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email || 'No user');

      try {
        if (event === 'SIGNED_IN' && session?.user) {
          await updateUserFromSession(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          await updateUserFromSession(session.user);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
      } finally {
        setIsLoading(false);
        console.log('Auth state change complete, isLoading set to false');
      }
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [supabase, updateUserFromSession]);

  const refreshUser = async () => {
    if (!supabase) return;

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error refreshing session:', error);
        setUser(null);
        return;
      }

      if (session?.user) {
        await updateUserFromSession(session.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error in refreshUser:', error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase client not available');

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    if (!supabase) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signup = async (email: string, password: string, name: string, plan: string = 'free') => {
    if (!supabase) throw new Error('Supabase client not available');

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            subscription_plan: plan,
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const updateDisplayName = async (name: string) => {
    if (!supabase || !user) throw new Error('User not authenticated');

    try {
      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { name },
      });

      if (metadataError) {
        console.error('Error updating user metadata:', metadataError);
      }

      // Update users table
      const { error: dbError } = await supabase.from('users').update({ name }).eq('id', user.id);

      if (dbError) {
        console.error('Error updating user in database:', dbError);
        throw new Error('Failed to update display name');
      }

      // Update local state
      setUser((prev) => (prev ? { ...prev, name } : null));
    } catch (error) {
      console.error('Error in updateDisplayName:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signup,
        refreshUser,
        updateDisplayName,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
