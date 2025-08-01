// Browser debugging utility to help identify and fix loading issues

export class BrowserDebugger {
  private static instance: BrowserDebugger;
  private logs: Array<{ timestamp: number; message: string; level: string }> = [];
  
  static getInstance() {
    if (!BrowserDebugger.instance) {
      BrowserDebugger.instance = new BrowserDebugger();
    }
    return BrowserDebugger.instance;
  }

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeDebugger();
    }
  }

  private initializeDebugger() {
    // Log browser information
    this.log('Browser Debug Session Started', 'info');
    this.log(`User Agent: ${navigator.userAgent}`, 'info');
    this.log(`Viewport: ${window.innerWidth}x${window.innerHeight}`, 'info');
    
    // Monitor page load events
    window.addEventListener('load', () => {
      this.log('Page Load Complete', 'success');
    });

    window.addEventListener('beforeunload', () => {
      this.log('Page Unloading', 'info');
    });

    // Monitor visibility changes
    document.addEventListener('visibilitychange', () => {
      this.log(`Page visibility: ${document.visibilityState}`, 'info');
    });

    // Monitor focus/blur events
    window.addEventListener('focus', () => {
      this.log('Window gained focus', 'info');
    });

    window.addEventListener('blur', () => {
      this.log('Window lost focus', 'info');
    });

    // Check for stuck loading states every 5 seconds
    setInterval(() => {
      this.checkForStuckStates();
    }, 5000);
  }

  public log(message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info') {
    const timestamp = Date.now();
    this.logs.push({ timestamp, message, level });
    
    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }

    // Console output with styling
    const style = this.getLogStyle(level);
    console.log(`%c[OneAI Debug] ${message}`, style);
  }

  private getLogStyle(level: string): string {
    switch (level) {
      case 'error': return 'color: #ff4444; font-weight: bold;';
      case 'warn': return 'color: #ff8800; font-weight: bold;';
      case 'success': return 'color: #00aa00; font-weight: bold;';
      default: return 'color: #0088cc;';
    }
  }

  private checkForStuckStates() {
    // Check for elements that might indicate stuck loading
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
    if (loadingElements.length > 0) {
      this.log(`Found ${loadingElements.length} loading elements on page`, 'warn');
    }

    // Check for auth states
    const authTokens = Object.keys(localStorage).filter(key => 
      key.includes('auth') || key.includes('supabase')
    );
    if (authTokens.length > 3) {
      this.log(`Multiple auth tokens found: ${authTokens.length}`, 'warn');
    }
  }

  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  public clearLogs() {
    this.logs = [];
    this.log('Debug logs cleared', 'info');
  }

  public getStatus(): any {
    return {
      browser: this.getBrowserInfo(),
      storage: this.getStorageInfo(),
      performance: this.getPerformanceInfo(),
      lastLogs: this.logs.slice(-10)
    };
  }

  private getBrowserInfo() {
    if (typeof window === 'undefined') return null;
    
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    };
  }

  private getStorageInfo() {
    if (typeof window === 'undefined') return null;

    try {
      const localStorage_keys = Object.keys(localStorage);
      const sessionStorage_keys = Object.keys(sessionStorage);
      
      return {
        localStorage: {
          keys: localStorage_keys.length,
          authKeys: localStorage_keys.filter(k => k.includes('auth') || k.includes('supabase'))
        },
        sessionStorage: {
          keys: sessionStorage_keys.length,
          authKeys: sessionStorage_keys.filter(k => k.includes('auth') || k.includes('supabase'))
        }
      };
    } catch (e) {
      return { error: 'Storage access denied' };
    }
  }

  private getPerformanceInfo() {
    if (typeof window === 'undefined' || !window.performance) return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      memoryUsage: (performance as any).memory ? {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
      } : null
    };
  }
}

// Initialize debugger and expose globally for easy access
if (typeof window !== 'undefined') {
  const debug = BrowserDebugger.getInstance();
  (window as any).__oneaiDebugger = debug;
  
  // Add some helpful global functions
  (window as any).oneaiStatus = () => debug.getStatus();
  (window as any).oneaiLogs = () => console.table(debug.exportLogs());
  (window as any).oneaiClear = () => debug.clearLogs();
  
  console.log('%c🔧 OneAI Browser Debugger Ready', 'color: #00aa00; font-size: 14px; font-weight: bold;');
  console.log('Use oneaiStatus(), oneaiLogs(), or oneaiClear() in console for debugging');
}

export default BrowserDebugger;