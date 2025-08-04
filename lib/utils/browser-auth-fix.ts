// Browser-specific authentication fixes
export class BrowserAuthFix {
  private static instance: BrowserAuthFix;
  private browserType: 'firefox' | 'chromium' | 'safari' | 'other';
  
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
    } else if (userAgent.includes('chrome') || userAgent.includes('chromium') || userAgent.includes('edg')) {
      return 'chromium';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return 'safari';
    }
    
    return 'other';
  }
  
  private applyBrowserSpecificFixes() {
    if (typeof window === 'undefined') return;
    
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
  }
  
  private applyChromiumFixes() {
    // Chromium-specific: Handle multiple tab sync issues
    window.addEventListener('storage', (e) => {
      if (e.key === 'sb-ttnkomdxbkmfmkaycjao-auth-token') {
        if (e.newValue === null && e.oldValue !== null) {
          // Auth was cleared in another tab, reload
          setTimeout(() => window.location.reload(), 100);
        }
      }
    });
    
    // Chromium-specific: Prevent duplicate storage writes
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
  
  private applySafariFixes() {
    // Safari-specific: Handle ITP (Intelligent Tracking Prevention)
    // Periodically touch the auth token to prevent expiration
    setInterval(() => {
      const authToken = localStorage.getItem('sb-ttnkomdxbkmfmkaycjao-auth-token');
      if (authToken) {
        // Touch the token to keep it fresh
        localStorage.setItem('sb-ttnkomdxbkmfmkaycjao-auth-token', authToken);
      }
    }, 30000); // Every 30 seconds
  }
  
  private applyUniversalFixes() {
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
  }
  
  // Public method to manually trigger auth cleanup
  public cleanupAuth() {
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
  }
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  BrowserAuthFix.getInstance();
}

export default BrowserAuthFix;