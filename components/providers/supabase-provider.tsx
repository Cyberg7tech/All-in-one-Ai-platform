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

  useEffect(() => {
    // Only initialize client on the client side
    if (typeof window !== 'undefined') {
      try {
        const client = getSupabaseClient();
        setSupabaseClient(client);
      } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
      }
    }
  }, []);

  // During SSR, we provide null; client consumers must guard against null
  // On the client, render a minimal fallback until the client initializes
  if (typeof window !== 'undefined' && !supabaseClient) {
    return <></>;
  }

  return <SupabaseContext.Provider value={supabaseClient}>{children}</SupabaseContext.Provider>;
}
