'use client';

import { useEffect } from 'react';

export function WebpackInitializer() {
  useEffect(() => {
    // This runs only on the client
    if (typeof window !== 'undefined' && window.__webpack_require__) {
      console.log('Webpack runtime detected, applying patches...');
      
      // Store reference to original require
      const originalRequire = window.__webpack_require__;
      const moduleCache: Record<string, any> = {};
      
      // Create patched require
      const patchedRequire = function(moduleId: any) {
        // Check cache first
        if (moduleCache[moduleId]) {
          return moduleCache[moduleId].exports;
        }
        
        try {
          return originalRequire.call(originalRequire, moduleId);
        } catch (error: any) {
          if (error?.message?.includes('Cannot read properties of undefined')) {
            console.warn(`Module ${moduleId} failed to load, creating stub`);
            
            // Create and cache stub module
            const stub = {
              id: moduleId,
              loaded: true,
              exports: {
                default: {},
                __esModule: true
              }
            };
            
            moduleCache[moduleId] = stub;
            return stub.exports;
          }
          
          throw error;
        }
      };
      
      // Copy all properties
      Object.setPrototypeOf(patchedRequire, Object.getPrototypeOf(originalRequire));
      for (const key in originalRequire) {
        try {
          (patchedRequire as any)[key] = (originalRequire as any)[key];
        } catch (e) {
          // Ignore errors when copying properties
        }
      }
      
      // Replace webpack require
      (window as any).__webpack_require__ = patchedRequire;
    }
  }, []);
  
  return null;
}