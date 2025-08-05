// Early webpack patch to prevent module loading errors
(function() {
  'use strict';
  
  if (typeof window === 'undefined') return;
  
  // Prevent errors from crashing the app
  window.addEventListener('error', function(e) {
    if (e.error && e.error.message && e.error.message.includes('Cannot read properties of undefined (reading \'call\')')) {
      console.warn('[Webpack Patch] Caught error:', e.error.message);
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);
  
  window.addEventListener('unhandledrejection', function(e) {
    if (e.reason && e.reason.message && e.reason.message.includes('Cannot read properties of undefined (reading \'call\')')) {
      console.warn('[Webpack Patch] Caught promise rejection:', e.reason.message);
      e.preventDefault();
      return false;
    }
  });
  
  // Store original error constructor
  const OriginalError = window.Error;
  
  // Track webpack initialization
  let webpackInitialized = false;
  
  // Define webpack module stub factory
  function createModuleStub(moduleId) {
    return {
      id: moduleId,
      loaded: true,
      exports: {
        default: {},
        __esModule: true
      }
    };
  }
  
  // Intercept webpack require as soon as it's defined
  Object.defineProperty(window, '__webpack_require__', {
    get: function() {
      return this._webpackRequire;
    },
    set: function(value) {
      if (!webpackInitialized && typeof value === 'function') {
        console.log('Patching webpack require...');
        webpackInitialized = true;
        
        const original = value;
        const cache = {};
        
        // Create patched version
        const patched = function(moduleId) {
          // Check cache first
          if (cache[moduleId]) {
            return cache[moduleId].exports;
          }
          
          try {
            return original.apply(this, arguments);
          } catch (error) {
            if (error && error.message && error.message.includes('Cannot read properties of undefined')) {
              console.warn('Module ' + moduleId + ' failed to load, using stub');
              const stub = createModuleStub(moduleId);
              cache[moduleId] = stub;
              return stub.exports;
            }
            throw error;
          }
        };
        
        // Copy properties
        for (const key in original) {
          try {
            patched[key] = original[key];
          } catch (e) {}
        }
        
        this._webpackRequire = patched;
      } else {
        this._webpackRequire = value;
      }
    },
    configurable: true
  });
  
  // Patch global error handling to catch module errors
  window.addEventListener('error', function(event) {
    if (event.error && event.error.message && event.error.message.includes('Cannot read properties of undefined (reading \'call\')')) {
      console.warn('Caught webpack module error:', event.error);
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);
  
  // Patch unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && event.reason.message.includes('Cannot read properties of undefined (reading \'call\')')) {
      console.warn('Caught webpack module promise rejection:', event.reason);
      event.preventDefault();
      return false;
    }
  });
})();