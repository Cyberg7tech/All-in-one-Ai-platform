'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSupabaseClient } from '@/components/providers/supabase-provider';
import { Session } from '@supabase/supabase-js';

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
  updateDisplayName: (name: string) => Promise<void>;
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

  const fetchUserData = async (userId: string): Promise<AuthUser | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, role, subscription_plan, created_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }

      return {
        id: userId,
        email: '', // Will be filled from session
        name: data?.name || '',
        role: data?.role || 'user',
        subscription_plan: data?.subscription_plan || 'free',
        created_at: data?.created_at || '',
      };
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      return null;
    }
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
        // Fetch complete user data from database
        const userData = await fetchUserData(session.user.id);
        if (userData) {
          setUser({
            ...userData,
            email: session.user.email ?? '',
          });
        } else {
          setUser(getUserFromSession(session));
        }
      }
    } catch (error) {
      console.error('Error in refreshUser:', error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    if (!mounted) throw new Error('Component not mounted');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          subscription_plan: plan,
        },
      },
    });
    if (error) throw new Error(error?.message || 'Signup failed');

    // User data will be automatically inserted by the auth trigger
    // No need to manually insert into users table
    
    // Session will be handled by the useSession hook
  };

  const updateDisplayName = async (name: string) => {
    if (!mounted || !user) throw new Error('User not authenticated');

    try {
      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { name: name },
      });

      if (metadataError) {
        console.error('Error updating user metadata:', metadataError);
      }

      // Update users table
      const { error: dbError } = await supabase.from('users').update({ name: name }).eq('id', user.id);

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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
