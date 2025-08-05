// Webpack runtime fix for module loading issues
declare global {
  interface Window {
    __webpack_require__?: any;
  }
}

if (typeof window !== 'undefined' && window.__webpack_require__) {
  const originalRequire = window.__webpack_require__;
  
  window.__webpack_require__ = function(moduleId: any) {
    try {
      return originalRequire(moduleId);
    } catch (error: any) {
      if (error.message && error.message.includes("Cannot read properties of undefined")) {
        console.warn(`Module ${moduleId} failed to load, attempting recovery...`);
        // Return a dummy module to prevent complete failure
        return {
          default: {},
          __esModule: true
        };
      }
      throw error;
    }
  };
  
  // Copy all properties from original require
  Object.keys(originalRequire).forEach(key => {
    (window.__webpack_require__ as any)[key] = (originalRequire as any)[key];
  });
}

export {};