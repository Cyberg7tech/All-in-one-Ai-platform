'use client';

import { useState } from 'react';
import { clearSupabaseInstances } from '@/lib/supabase/clear-instances';

export function SupabaseDebugger() {
  const [isVisible, setIsVisible] = useState(false);

  const handleClearInstances = () => {
    clearSupabaseInstances();
    // Force page reload to reinitialize
    window.location.reload();
  };

  const checkInstances = () => {
    if (typeof window === 'undefined') return;

    const hasInstance = !!(window as any).__supabaseInstance;
    const hasAdminInstance = !!(window as any).__supabaseAdminInstance;

    console.log('Supabase instances:', {
      client: hasInstance ? 'Present' : 'Not found',
      admin: hasAdminInstance ? 'Present' : 'Not found',
    });

    alert(
      `Supabase instances:\nClient: ${hasInstance ? 'Present' : 'Not found'}\nAdmin: ${hasAdminInstance ? 'Present' : 'Not found'}`
    );
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      {!isVisible ? (
        <button
          onClick={() => setIsVisible(true)}
          className='bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600'
          title='Supabase Debugger'>
          🔧
        </button>
      ) : (
        <div className='bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[200px]'>
          <div className='flex justify-between items-center mb-3'>
            <h3 className='font-semibold text-sm'>Supabase Debugger</h3>
            <button onClick={() => setIsVisible(false)} className='text-gray-500 hover:text-gray-700'>
              ✕
            </button>
          </div>

          <div className='space-y-2'>
            <button
              onClick={checkInstances}
              className='w-full text-left px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded'>
              Check Instances
            </button>

            <button
              onClick={handleClearInstances}
              className='w-full text-left px-2 py-1 text-xs bg-red-100 hover:bg-red-200 rounded'>
              Clear & Reload
            </button>

            <button
              onClick={() => {
                console.log('Window Supabase instances:', {
                  client: (window as any).__supabaseInstance,
                  admin: (window as any).__supabaseAdminInstance,
                });
              }}
              className='w-full text-left px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded'>
              Log to Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
