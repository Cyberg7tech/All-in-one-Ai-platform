// Utility to clean up problematic auth state without losing everything

export function cleanupAuthState() {
  if (typeof window === 'undefined') return;
  
  try {
    // Remove all possible Supabase auth keys that might be causing conflicts
    const keysToRemove = [
      'sb-ttnkomdxbkmfmkaycjao-auth-token',
      'supabase.auth.token',
      'oneai-auth-v2',
      'oneai-auth-stable',
      'oneai-auth-ultra-stable',
      // Legacy keys
      'supabase.session',
      'supabase.auth.session',
      // GoTrue client keys
      'gotrue.session',
      'gotrue.user'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Also clear any remaining Supabase client instances
    if ((window as any).ONEAI_SUPABASE_CLIENT_INSTANCE) {
      delete (window as any).ONEAI_SUPABASE_CLIENT_INSTANCE;
    }
    
    // Clear global instances  
    if ((globalThis as any).__oneai_supabase) {
      delete (globalThis as any).__oneai_supabase;
    }
    
    console.log('Auth state cleanup completed - removed all potential conflicts');
  } catch (error) {
    console.error('Error cleaning auth state:', error);
  }
}

export function forceAuthRefresh() {
  if (typeof window === 'undefined') return;
  
  try {
    // Clean problematic auth state
    cleanupAuthState();
    
    // Wait a moment then reload
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (error) {
    console.error('Error forcing auth refresh:', error);
    // Fallback to normal reload
    window.location.reload();
  }
}