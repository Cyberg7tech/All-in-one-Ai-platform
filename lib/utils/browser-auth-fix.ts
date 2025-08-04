// Browser-specific authentication fixes
export class BrowserAuthFix {
  private static instance: BrowserAuthFix;
  private browserType: 'firefox' | 'chromium' | 'safari' | 'other';
  private isInitialized = false;
  
  static getInstance() {
    if (!BrowserAuthFix.instance) {
      BrowserAuthFix.instance = new BrowserAuthFix();
    }
    return BrowserAuthFix.instance;
  }
  
  private constructor() {
    this.browserType = this.detectBrowserType();
    this.applyBrowserSpecificFixes();
  }
  
  private detectBrowserType(): 'firefox' | 'chromium' | 'safari' | 'other' {
    if (typeof window === 'undefined') return 'other';
    
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('firefox')) {
      return 'firefox';
    } else if (userAgent.includes('chrome') || userAgent.includes('chromium') || userAgent.includes('edg') || userAgent.includes('brave')) {
      return 'chromium';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return 'safari';
    }
    
    return 'other';
  }
  
  private applyBrowserSpecificFixes() {
    if (typeof window === 'undefined' || this.isInitialized) return;
    
    this.isInitialized = true;
    console.log(`🔧 Browser detected: ${this.browserType}`);
    
    // Apply browser-specific fixes
    switch (this.browserType) {
      case 'firefox':
        this.applyFirefoxFixes();
        break;
      case 'chromium':
        this.applyChromiumFixes();
        break;
      case 'safari':
        this.applySafariFixes();
        break;
    }
    
    // Apply universal fixes
    this.applyUniversalFixes();
  }
  
  private applyFirefoxFixes() {
    console.log('🦊 Applying Firefox-specific fixes...');
    
    // Firefox-specific: Force refresh on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Check if auth token exists but session might be stale
        const authToken = localStorage.getItem('sb-ttnkomdxbkmfmkaycjao-auth-token');
        if (authToken) {
          try {
            const tokenData = JSON.parse(authToken);
            const expiresAt = tokenData.expires_at || tokenData.expiresAt;
            if (expiresAt && new Date(expiresAt * 1000) < new Date()) {
              // Token expired, trigger refresh
              window.location.reload();
            }
          } catch (e) {
            // Invalid token format
          }
        }
      }
    });
    
    // Firefox-specific: Handle beforeunload differently
    window.addEventListener('beforeunload', () => {
      // Ensure session is properly saved
      const authToken = localStorage.getItem('sb-ttnkomdxbkmfmkaycjao-auth-token');
      if (authToken) {
        sessionStorage.setItem('firefox-auth-backup', authToken);
      }
    });
    
    // Restore from backup if needed
    window.addEventListener('load', () => {
      const backup = sessionStorage.getItem('firefox-auth-backup');
      if (backup && !localStorage.getItem('sb-ttnkomdxbkmfmkaycjao-auth-token')) {
        localStorage.setItem('sb-ttnkomdxbkmfmkaycjao-auth-token', backup);
      }
      sessionStorage.removeItem('firefox-auth-backup');
    });
    
    console.log('✅ Firefox fixes applied');
  }
  
  private applyChromiumFixes() {
    console.log('🔧 Applying Chromium-specific fixes...');
    
    // Fix 1: Clear problematic storage conflicts immediately
    this.clearChromiumStorageConflicts();
    
    // Fix 2: Handle Chromium's aggressive caching
    this.clearProblematicCaches();
    
    // Fix 3: Unregister problematic service workers
    this.unregisterServiceWorkers();
    
    // Fix 4: Handle multiple tab sync issues
    window.addEventListener('storage', (e) => {
      if (e.key === 'sb-ttnkomdxbkmfmkaycjao-auth-token') {
        if (e.newValue === null && e.oldValue !== null) {
          // Auth was cleared in another tab, reload
          setTimeout(() => window.location.reload(), 100);
        }
      }
    });
    
    // Fix 5: Prevent duplicate storage writes
    this.preventDuplicateStorageWrites();
    
    // Fix 6: Handle Chromium's focus/blur events
    this.handleChromiumFocusEvents();
    
    // Fix 7: Monitor memory usage
    this.monitorMemoryUsage();
    
    // Fix 8: Detect and recover from stuck loading states (disabled for now)
    // this.detectStuckLoadingStates();
    
    // Fix 9: Handle beforeunload to prevent stuck states
    window.addEventListener('beforeunload', () => {
      // Clear any pending operations
      this.cleanupOnUnload();
    });
    
    console.log('✅ Chromium fixes applied');
  }
  
  private clearChromiumStorageConflicts() {
    try {
      const problematicKeys = [
        'nuclear-oneai-auth',
        'oneai-auth-permanent', 
        'oneai-auth',
        'supabase.auth.token.old',
        'supabase.auth.refreshToken.old',
        'sb-ttnkomdxbkmfmkaycjao-auth-token.old'
      ];
      
      problematicKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // Clear any other Supabase-related storage except the main token
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') && key !== 'sb-ttnkomdxbkmfmkaycjao-auth-token') {
          localStorage.removeItem(key);
        }
      });
      
      console.log('🧹 Cleared Chromium storage conflicts');
    } catch (error) {
      console.warn('Error clearing storage conflicts:', error);
    }
  }
  
  private clearProblematicCaches() {
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('supabase') || cacheName.includes('oneai') || cacheName.includes('auth')) {
            caches.delete(cacheName).then(() => {
              console.log(`🗑️ Cleared problematic cache: ${cacheName}`);
            });
          }
        });
      });
    }
  }
  
  private unregisterServiceWorkers() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister().then(() => {
            console.log('🗑️ Unregistered problematic service worker');
          });
        });
      });
    }
  }
  
  private preventDuplicateStorageWrites() {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key: string, value: string) {
      if (key.includes('auth') || key.includes('supabase')) {
        const currentValue = this.getItem(key);
        if (currentValue === value) {
          return; // Skip duplicate writes
        }
      }
      originalSetItem.call(this, key, value);
    };
  }
  
  private handleChromiumFocusEvents() {
    let focusTimeout: NodeJS.Timeout;
    window.addEventListener('focus', () => {
      clearTimeout(focusTimeout);
      focusTimeout = setTimeout(() => {
        // Check auth state when window regains focus
        const authToken = localStorage.getItem('sb-ttnkomdxbkmfmkaycjao-auth-token');
        if (authToken) {
          try {
            const tokenData = JSON.parse(authToken);
            const expiresAt = tokenData.expires_at || tokenData.expiresAt;
            if (expiresAt && new Date(expiresAt * 1000) < new Date()) {
              // Token expired, clear it
              localStorage.removeItem('sb-ttnkomdxbkmfmkaycjao-auth-token');
              console.log('🗑️ Cleared expired auth token on focus');
            }
          } catch (e) {
            // Invalid token, clear it
            localStorage.removeItem('sb-ttnkomdxbkmfmkaycjao-auth-token');
            console.log('🗑️ Cleared invalid auth token on focus');
          }
        }
      }, 500);
    });
  }
  
  private monitorMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        
        if (usedMB > 200) { // If using more than 200MB
          console.warn(`⚠️ High memory usage: ${Math.round(usedMB)}MB`);
          
          // Clear some caches to free memory
          if ('caches' in window) {
            caches.keys().then(cacheNames => {
              cacheNames.slice(0, 2).forEach(cacheName => {
                caches.delete(cacheName);
              });
            });
          }
        }
      }, 30000); // Check every 30 seconds
    }
  }
  
  private detectStuckLoadingStates() {
    let loadingCheckCount = 0;
    const maxLoadingChecks = 3; // Reduced from 10 to 3
    let lastRecoveryTime = 0;
    const recoveryCooldown = 30000; // 30 seconds cooldown between recoveries
    
    const checkForStuckLoading = () => {
      // Don't check if we've done too many recoveries
      if (loadingCheckCount >= maxLoadingChecks) {
        console.warn('⚠️ Too many loading checks, stopping recovery attempts...');
        return;
      }
      
      // Don't check if we're in cooldown period
      const now = Date.now();
      if (now - lastRecoveryTime < recoveryCooldown) {
        return;
      }
      
      // Check for stuck loading indicators - be more specific
      const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="animate-spin"]');
      const isStuck = loadingElements.length > 0 && 
                     document.readyState === 'complete' && 
                     !document.hidden; // Only check when page is visible
      
      if (isStuck) {
        console.warn('⚠️ Detected stuck loading state, attempting recovery...');
        loadingCheckCount++;
        lastRecoveryTime = now;
        
        // Try to recover by clearing problematic storage
        this.cleanupAuth();
        
        // If still stuck after 10 seconds, reload (increased from 5)
        setTimeout(() => {
          const stillStuck = document.querySelectorAll('[class*="loading"], [class*="spinner"]').length > 0;
          if (stillStuck && !document.hidden) {
            console.warn('🔄 Still stuck, forcing reload...');
            window.location.reload();
          }
        }, 10000);
      }
    };
    
    // Check for stuck loading every 30 seconds (increased from 10)
    setInterval(checkForStuckLoading, 30000);
  }
  
  private cleanupOnUnload() {
    // Clear any pending operations
    console.log('🧹 Cleaning up on unload...');
  }
  
  private applySafariFixes() {
    console.log('🍎 Applying Safari-specific fixes...');
    
    // Safari-specific: Handle ITP (Intelligent Tracking Prevention)
    // Periodically touch the auth token to prevent expiration
    setInterval(() => {
      const authToken = localStorage.getItem('sb-ttnkomdxbkmfmkaycjao-auth-token');
      if (authToken) {
        // Touch the token to keep it fresh
        localStorage.setItem('sb-ttnkomdxbkmfmkaycjao-auth-token', authToken);
      }
    }, 30000); // Every 30 seconds
    
    console.log('✅ Safari fixes applied');
  }
  
  private applyUniversalFixes() {
    console.log('🌐 Applying universal fixes...');
    
    // Clean up orphaned auth tokens
    const authKeys = Object.keys(localStorage).filter(key => 
      (key.includes('auth') || key.includes('supabase')) && 
      key !== 'sb-ttnkomdxbkmfmkaycjao-auth-token'
    );
    
    // Remove old/duplicate auth tokens
    authKeys.forEach(key => {
      // Skip the current valid token
      if (key === 'sb-ttnkomdxbkmfmkaycjao-auth-token') return;
      
      // Remove legacy tokens
      if (key.includes('nuclear') || key.includes('permanent') || key.includes('oneai-auth')) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      }
    });
    
    // Monitor for stuck states
    let lastActivityTime = Date.now();
    
    document.addEventListener('click', () => {
      lastActivityTime = Date.now();
    });
    
    document.addEventListener('keypress', () => {
      lastActivityTime = Date.now();
    });
    
    // Check for inactivity and potential stuck state
    setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivityTime;
      if (timeSinceActivity > 300000) { // 5 minutes
        // Check if we're stuck on a loading screen
        const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
        if (loadingElements.length > 0) {
          // Likely stuck, trigger a refresh
          window.location.reload();
        }
      }
    }, 60000); // Check every minute
    
    console.log('✅ Universal fixes applied');
  }
  
  // Public method to manually trigger auth cleanup
  public cleanupAuth() {
    console.log('🧹 Manual auth cleanup triggered');
    
    const validTokenKey = 'sb-ttnkomdxbkmfmkaycjao-auth-token';
    const validToken = localStorage.getItem(validTokenKey);
    
    // Clear all auth-related storage except the valid token
    Object.keys(localStorage).forEach(key => {
      if ((key.includes('auth') || key.includes('supabase')) && key !== validTokenKey) {
        localStorage.removeItem(key);
      }
    });
    
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('auth') || key.includes('supabase')) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Restore valid token if it was accidentally removed
    if (validToken && !localStorage.getItem(validTokenKey)) {
      localStorage.setItem(validTokenKey, validToken);
    }
    
    console.log('✅ Auth cleanup completed');
  }
  
  // Public method to get browser type
  public getBrowserType() {
    return this.browserType;
  }
  
  // Public method to check if fixes are applied
  public isFixesApplied() {
    return this.isInitialized;
  }
}

// Auto-initialize on import - DISABLED TO PREVENT LOOPS
// if (typeof window !== 'undefined') {
//   BrowserAuthFix.getInstance();
// }

export default BrowserAuthFix;