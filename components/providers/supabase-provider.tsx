'use client';
import { createContext, useContext } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function useSupabaseClient() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabaseClient must be used within a SupabaseProvider');
  }
  return context;
}

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  // Use singleton client instead of creating a new one
  const supabaseClient = getSupabaseClient();

  return <SupabaseContext.Provider value={supabaseClient}>{children}</SupabaseContext.Provider>;
}
