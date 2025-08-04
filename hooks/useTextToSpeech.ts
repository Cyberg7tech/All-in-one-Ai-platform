import { useState, useCallback, useRef } from 'react';

interface UseTextToSpeechOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { maxRetries = 3, retryDelay = 1000, timeout = 30000 } = options;

  const generateSpeech = useCallback(async (
    text: string,
    voiceId: string = '21m00Tcm4TlvDq8ikWAM', // Default voice
    modelId: string = 'eleven_monolingual_v1'
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
    setAudioUrl(null);

    let retryCount = 0;

    while (retryCount <= maxRetries) {
      try {
        const response = await fetch('/api/elevenlabs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            voice_id: voiceId,
            model_id: modelId,
          }),
          signal,
        });

        if (signal.aborted) {
          throw new Error('Request was aborted');
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        
        setAudioUrl(url);
        setIsLoading(false);
        
        return url;

      } catch (err) {
        retryCount++;
        
        if (signal.aborted) {
          setIsLoading(false);
          throw new Error('Request was aborted');
        }

        if (retryCount > maxRetries) {
          setError(err instanceof Error ? err.message : 'Failed to generate speech');
          setIsLoading(false);
          throw err;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
      }
    }
  }, [maxRetries, retryDelay, timeout]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setError(null);
    }
  }, []);

  const clearAudio = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }, [audioUrl]);

  return {
    generateSpeech,
    cancelRequest,
    clearAudio,
    isLoading,
    error,
    audioUrl,
  };
} 