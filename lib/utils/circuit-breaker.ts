// Circuit breaker to prevent infinite loading and stuck states

class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private readonly failureThreshold: number = 10; // Higher threshold
  private readonly recoveryTimeout: number = 5000; // Faster recovery

  async execute<T>(operation: () => Promise<T>, fallback?: () => T): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.recoveryTimeout) {
        if (fallback) {
          return fallback();
        }
        throw new Error('Circuit breaker is OPEN - operation blocked');
      } else {
        this.state = 'HALF_OPEN';
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      console.warn('Circuit breaker opened due to repeated failures');
    }
  }

  getState() {
    return this.state;
  }

  reset() {
    this.failures = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = 0;
  }
}

// Global circuit breakers for different operations
export const authCircuitBreaker = new CircuitBreaker();
export const chatCircuitBreaker = new CircuitBreaker();
export const apiCircuitBreaker = new CircuitBreaker();

// Loading state manager to prevent infinite loading
class LoadingStateManager {
  private loadingStates: Map<string, { startTime: number; timeout: NodeJS.Timeout }> = new Map();
  private readonly defaultTimeout = 300000; // 5 minutes - very generous

  startLoading(key: string, maxDuration: number = this.defaultTimeout) {
    // Clear any existing timeout for this key
    this.clearLoading(key);

    const timeout = setTimeout(() => {
      console.warn(`Loading timeout for ${key} - forcing stop`);
      this.clearLoading(key);
      // Force reload if stuck for too long
      if (typeof window !== 'undefined' && key === 'auth') {
        window.location.reload();
      }
    }, maxDuration);

    this.loadingStates.set(key, {
      startTime: Date.now(),
      timeout
    });
  }

  clearLoading(key: string) {
    const state = this.loadingStates.get(key);
    if (state) {
      clearTimeout(state.timeout);
      this.loadingStates.delete(key);
    }
  }

  isStuck(key: string): boolean {
    const state = this.loadingStates.get(key);
    if (!state) return false;
    
    return Date.now() - state.startTime > this.defaultTimeout;
  }

  clearAll() {
    this.loadingStates.forEach((state) => {
      clearTimeout(state.timeout);
    });
    this.loadingStates.clear();
  }
}

export const loadingManager = new LoadingStateManager();

// Anti-stuck utility
export function preventStuckState() {
  if (typeof window === 'undefined') return;

  // Clear any stuck loading states on visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      loadingManager.clearAll();
      
      // Reset circuit breakers
      authCircuitBreaker.reset();
      chatCircuitBreaker.reset();
      apiCircuitBreaker.reset();
    }
  });

  // Force cleanup on page unload
  window.addEventListener('beforeunload', () => {
    loadingManager.clearAll();
  });

  // Detect and fix stuck states
  setInterval(() => {
    if (authCircuitBreaker.getState() === 'OPEN') {
      console.warn('Auth circuit breaker is open - forcing reset');
      authCircuitBreaker.reset();
    }
  }, 60000); // Check every minute
}

// Initialize anti-stuck measures
if (typeof window !== 'undefined') {
  preventStuckState();
}