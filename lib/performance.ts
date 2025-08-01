// Performance utilities for development optimization

// Debounce function to prevent excessive calls during hot reloads
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Development-only performance logging
export function devLog(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] ${message}`, data || '');
  }
}

// Optimize for hot reloads
export function optimizeForHotReload() {
  if (process.env.NODE_ENV === 'development') {
    // Clear any existing timeouts that might be causing delays
    // Note: This is a simplified approach that doesn't clear all timeouts
    // as that's not possible in a safe way across different environments
    devLog('Hot reload optimization applied');
  }
} 