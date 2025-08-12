'use client';
import { createContext, useContext, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function useSupabaseClient() {
  const context = useContext(SupabaseContext);
  if (!context) {
    // During SSR/prerendering, return null instead of throwing
    if (typeof window === 'undefined') {
      return null;
    }
    throw new Error('useSupabaseClient must be used within SupabaseProvider');
  }
  return context;
}

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export default function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [supabaseClient] = useState(() => {
    if (typeof window !== 'undefined') {
      return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookieOptions: {
            name: 'sb-one-ai-auth',
            domain: undefined,
            path: '/',
            sameSite: 'lax',
          },
        }
      );
    }
    return null;
  });

  return <SupabaseContext.Provider value={supabaseClient}>{children}</SupabaseContext.Provider>;
}
