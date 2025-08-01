// Simple auth cleanup utility to clear problematic storage

export function clearAuthStorage() {
  if (typeof window === 'undefined') return;

  try {
    // Clear all possible storage keys that might be causing conflicts
    const storageKeys = [
      'nuclear-oneai-auth',
      'oneai-auth-permanent', 
      'oneai-auth',
      'supabase.auth.token',
      'supabase.auth.refreshToken'
    ];

    storageKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Clear any other Supabase-related storage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('oneai')) {
        localStorage.removeItem(key);
      }
    });

    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('oneai')) {
        sessionStorage.removeItem(key);
      }
    });

    console.log('Auth storage cleared successfully');
  } catch (error) {
    console.warn('Error clearing auth storage:', error);
  }
}

// Export the function for manual use only - do not auto-run
// This function should only be called when explicitly needed,
// not automatically on page loads