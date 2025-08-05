import { useState, useCallback, useRef } from 'react';

interface UseTogetherAIOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export function useTogetherAI(options: UseTogetherAIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { maxRetries = 3, retryDelay = 1000, timeout = 30000 } = options;

  const callTogetherAI = useCallback(async (
    prompt: string,
    model: string = 'togethercomputer/llama-2-70b-chat',
    temperature: number = 0.7
  ) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setIsLoading(true);
    setError(null);

    let retryCount = 0;

    while (retryCount <= maxRetries) {
      try {
        const response = await fetch('/api/together-ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            model,
            temperature,
          }),
          signal,
        });

        if (signal.aborted) {
          throw new Error('Request was aborted');
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setIsLoading(false);
        return data;

      } catch (err) {
        retryCount++;
        
        if (signal.aborted) {
          setIsLoading(false);
          throw new Error('Request was aborted');
        }

        if (retryCount > maxRetries) {
          setError(err instanceof Error ? err.message : 'Unknown error occurred');
          setIsLoading(false);
          throw err;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
      }
    }
  }, [maxRetries, retryDelay]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setError(null);
    }
  }, []);

  return {
    callTogetherAI,
    cancelRequest,
    isLoading,
    error,
  };
} 