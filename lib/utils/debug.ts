// Debug utility for tracking authentication flow
export const authDebug = {
  log: (message: string, data?: any) => {
    if (typeof window !== 'undefined' && (window.location.search.includes('debug=true') || process.env.NODE_ENV === 'development')) {
      console.log(`[Auth Debug] ${new Date().toISOString()} - ${message}`, data || '');
    }
  },
  
  error: (message: string, error?: any) => {
    console.error(`[Auth Error] ${new Date().toISOString()} - ${message}`, error || '');
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[Auth Warning] ${new Date().toISOString()} - ${message}`, data || '');
  }
};

// Track navigation events
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    authDebug.log('Browser navigation detected (popstate)');
  });
  
  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    authDebug.log(`Page visibility changed: ${document.hidden ? 'hidden' : 'visible'}`);
  });
}