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

// Auto-clear on page load if there are issues
if (typeof window !== 'undefined') {
  // Clear storage if the page has been reloaded multiple times (indicating issues)
  const reloadCount = sessionStorage.getItem('reloadCount') || '0';
  const count = parseInt(reloadCount) + 1;
  sessionStorage.setItem('reloadCount', count.toString());

  if (count > 2) {
    console.log('Multiple reloads detected, clearing auth storage');
    clearAuthStorage();
    sessionStorage.setItem('reloadCount', '0');
  }
}