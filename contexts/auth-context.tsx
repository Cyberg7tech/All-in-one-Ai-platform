"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DemoUser, DemoAuthService } from '@/lib/auth/demo-auth';

interface AuthContextType {
  user: DemoUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const currentUser = DemoAuthService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await DemoAuthService.login(email, password);
      if (result) {
        setUser(result.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    DemoAuthService.logout();
    setUser(null);
  };

  const refreshSession = () => {
    DemoAuthService.refreshSession();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshSession,
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