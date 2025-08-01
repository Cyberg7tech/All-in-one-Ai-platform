// Utility to clean up problematic auth state without losing everything

export function cleanupAuthState() {
  if (typeof window === 'undefined') return;
  
  try {
    // Only remove Supabase auth keys that might be causing conflicts
    const keysToRemove = [
      'sb-ttnkomdxbkmfmkaycjao-auth-token',
      'supabase.auth.token',
      'oneai-auth-v2',
      'oneai-auth-stable'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    console.log('Auth state cleanup completed');
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