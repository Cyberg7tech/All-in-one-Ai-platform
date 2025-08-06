// Simple performance monitoring utility

export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Monitor page load performance
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);

    // Log any performance issues
    if (loadTime > 5000) {
      console.warn('Slow page load detected:', loadTime);
    }
  });

  // Monitor for stuck loading states
  let loadingCheckCount = 0;
  const loadingCheckInterval = setInterval(() => {
    loadingCheckCount++;

    // Check if page is stuck loading for too long
    if (loadingCheckCount > 30 && document.readyState !== 'complete') {
      console.warn('Page appears to be stuck loading');
      clearInterval(loadingCheckInterval);
    }
  }, 1000);

  // Clear interval when page loads
  window.addEventListener('load', () => {
    clearInterval(loadingCheckInterval);
  });

  // Monitor for memory leaks
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize > 100 * 1024 * 1024) {
        // 100MB
        console.warn('High memory usage detected:', memory.usedJSHeapSize / 1024 / 1024, 'MB');
      }
    }, 30000); // Check every 30 seconds
  }
}

// Auto-initialize performance monitoring - DISABLED TO PREVENT LOOPS
// if (typeof window !== 'undefined') {
//   initPerformanceMonitoring();
// }
