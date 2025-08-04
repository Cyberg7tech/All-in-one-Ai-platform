import { useState, useEffect, useRef, useCallback } from 'react';

interface UsePageVisibilityOptions {
  onVisible?: () => void;
  onHidden?: () => void;
  throttleMs?: number;
}

export function usePageVisibility(options: UsePageVisibilityOptions = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const lastUpdate = useRef<number>(0);
  const { onVisible, onHidden, throttleMs = 100 } = options;

  const handleVisibilityChange = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdate.current < throttleMs) return;
    
    lastUpdate.current = now;
    const newVisibility = !document.hidden;
    
    if (newVisibility !== isVisible) {
      setIsVisible(newVisibility);
      
      if (newVisibility && onVisible) {
        onVisible();
      } else if (!newVisibility && onHidden) {
        onHidden();
      }
    }
  }, [isVisible, onVisible, onHidden, throttleMs]);

  useEffect(() => {
    // Set initial state
    setIsVisible(!document.hidden);
    
    // Add event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return isVisible;
} 