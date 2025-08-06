// Webpack runtime fix for module loading issues
declare global {
  interface Window {
    __webpack_require__?: any;
    __webpack_modules__?: any;
    __webpack_module_cache__?: any;
  }
}

if (typeof window !== 'undefined') {
  // Patch webpack require to handle undefined modules
  const patchWebpackRequire = () => {
    if (!window.__webpack_require__) return;

    const originalRequire = window.__webpack_require__;
    const moduleCache = window.__webpack_module_cache__ || {};

    // Create a patched require function
    const patchedRequire = function (moduleId: any) {
      // Check module cache first
      if (moduleCache[moduleId]) {
        return moduleCache[moduleId].exports;
      }

      try {
        // Try original require
        return originalRequire.call(originalRequire, moduleId);
      } catch (error: any) {
        console.warn(`Module ${moduleId} failed to load:`, error);

        // Check if it's the specific "Cannot read properties of undefined" error
        if (error.message && error.message.includes('Cannot read properties of undefined')) {
          // Create a stub module
          const stubModule = {
            id: moduleId,
            loaded: true,
            exports: {
              default: {},
              __esModule: true,
            },
          };

          // Cache the stub
          moduleCache[moduleId] = stubModule;

          // Return stub exports
          return stubModule.exports;
        }

        // Re-throw other errors
        throw error;
      }
    };

    // Copy all properties and methods from original require
    Object.setPrototypeOf(patchedRequire, originalRequire);
    Object.keys(originalRequire).forEach((key) => {
      try {
        if (typeof originalRequire[key] === 'function') {
          (patchedRequire as any)[key] = originalRequire[key].bind(originalRequire);
        } else {
          (patchedRequire as any)[key] = originalRequire[key];
        }
      } catch (e) {
        console.warn(`Failed to copy webpack require property: ${key}`);
      }
    });

    // Replace global require
    window.__webpack_require__ = patchedRequire;
  };

  // Apply patch immediately
  patchWebpackRequire();

  // Re-apply patch after any async operations
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => patchWebpackRequire());
  } else {
    setTimeout(() => patchWebpackRequire(), 0);
  }

  // Note: Promise.reject patching removed due to TypeScript compatibility issues
}

export {};
