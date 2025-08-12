'use client';

import { createContext, useContext, useMemo } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';

const SupabaseCtx = createContext<SupabaseClient | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  return <SupabaseCtx.Provider value={supabase}>{children}</SupabaseCtx.Provider>;
}

export function useSupabase(): SupabaseClient {
  const client = useContext(SupabaseCtx);
  if (!client) throw new Error('SupabaseProvider missing');
  return client;
}


