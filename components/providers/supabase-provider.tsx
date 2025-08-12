'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function useSupabaseClient(): SupabaseClient | null {
  // Return null on the server or before the provider initializes on the client
  // Callers should guard against null and only use the client after mount
  const context = useContext(SupabaseContext);
  return context;
}

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only initialize client on the client side
    if (typeof window !== 'undefined') {
      try {
        const client = getSupabaseClient();
        console.log('Supabase client initialized successfully');
        setSupabaseClient(client);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        setIsInitialized(true); // Set to true even on error to prevent infinite loading
      }
    }
  }, []);

  // During SSR, we provide null
  if (typeof window === 'undefined') {
    return <SupabaseContext.Provider value={null}>{children}</SupabaseContext.Provider>;
  }

  // On the client, wait for initialization
  if (!isInitialized) {
    return <div>Initializing...</div>;
  }

  return <SupabaseContext.Provider value={supabaseClient}>{children}</SupabaseContext.Provider>;
}
