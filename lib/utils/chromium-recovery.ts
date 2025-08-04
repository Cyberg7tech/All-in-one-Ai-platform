// NUCLEAR RECOVERY SYSTEM for Chromium browsers
// Specifically designed to handle Chrome/Edge/Brave infinite loading loops

export function initChromiumRecovery() {
  if (typeof window === 'undefined') return;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isChromium = userAgent.includes('chrome') || 
                    userAgent.includes('chromium') || 
                    userAgent.includes('edge') || 
                    userAgent.includes('brave') ||
                    (userAgent.includes('webkit') && !userAgent.includes('firefox'));
  
  if (!isChromium) {
    console.log('NON-CHROMIUM: Standard recovery mode');
    return;
  }
  
  console.log('CHROMIUM DETECTED: Initializing nuclear recovery system');
  
  // Track page load time
  const pageLoadStart = Date.now();
  let isPageFullyLoaded = false;
  
  // Mark page as fully loaded
  const markPageLoaded = () => {
    isPageFullyLoaded = true;
    console.log('CHROMIUM: Page fully loaded successfully');
  };
  
  // Multiple ways to detect successful load
  if (document.readyState === 'complete') {
    markPageLoaded();
  } else {
    document.addEventListener('DOMContentLoaded', markPageLoaded);
    window.addEventListener('load', markPageLoaded);
  }
  
  // NUCLEAR RECOVERY: Force reload if stuck
  const nuclearRecoveryTimer = setTimeout(() => {
    if (!isPageFullyLoaded) {
      console.warn('NUCLEAR RECOVERY: Chromium page stuck loading - forcing reload');
      
      // Clear any stuck auth states
      try {
        localStorage.removeItem('nuclear-oneai-auth');
        localStorage.removeItem('oneai-auth-permanent');
        sessionStorage.clear();
      } catch (e) {
        console.warn('Could not clear storage:', e);
      }
      
      // Force reload
      window.location.reload();
    }
  }, 45000); // 45 second nuclear timeout
  
  // Cancel recovery if page loads successfully
  const cancelRecovery = () => {
    clearTimeout(nuclearRecoveryTimer);
  };
  
  document.addEventListener('DOMContentLoaded', cancelRecovery);
  window.addEventListener('load', cancelRecovery);
  
  // Store recovery functions globally
  (window as any).__chromiumRecovery = {
    cancel: cancelRecovery,
    forceReload: () => {
      console.log('CHROMIUM: Manual force reload triggered');
      clearTimeout(nuclearRecoveryTimer);
      window.location.reload();
    }
  };
  
  // Detect stuck auth states
  let authCheckCount = 0;
  const authStuckTimer = setInterval(() => {
    authCheckCount++;
    
    // If auth is checking for more than 10 times (50 seconds), force reload
    if (authCheckCount > 10 && !isPageFullyLoaded) {
      console.warn('CHROMIUM: Auth stuck in loop - forcing recovery');
      clearInterval(authStuckTimer);
      (window as any).__chromiumRecovery.forceReload();
    }
  }, 5000);
  
  // Clear interval when page loads
  const clearAuthTimer = () => {
    clearInterval(authStuckTimer);
  };
  
  document.addEventListener('DOMContentLoaded', clearAuthTimer);
  window.addEventListener('load', clearAuthTimer);
}

// Auto-initialize for Chromium browsers - DISABLED TO PREVENT LOOPS
// if (typeof window !== 'undefined') {
//   // Initialize recovery system immediately
//   initChromiumRecovery();
// }