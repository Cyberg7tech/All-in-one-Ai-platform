import { useState, useCallback, useRef, useEffect } from 'react';
import { useTogetherAI } from './useTogetherAI';

interface Agent {
  id: string;
  name: string;
  description: string;
  tools: string[];
  personality: string;
}

interface UseAgentOptions {
  maxRetries?: number;
  retryDelay?: number;
}

export function useAgent(options: UseAgentOptions = {}) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { callTogetherAI, cancelRequest, isLoading: aiLoading } = useTogetherAI(options);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const createAgent = useCallback(
    async (agentData: Omit<Agent, 'id'>) => {
      setIsLoading(true);
      setError(null);

      try {
        const prompt = `Create an AI agent with the following specifications:
        Name: ${agentData.name}
        Description: ${agentData.description}
        Tools: ${agentData.tools.join(', ')}
        Personality: ${agentData.personality}
        
        Please provide a detailed response about this agent's capabilities and how it should behave.`;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const response = await callTogetherAI(prompt);

        const newAgent: Agent = {
          ...agentData,
          id: Date.now().toString(),
        };

        setAgents((prev) => [...prev, newAgent]);
        setCurrentAgent(newAgent);

        return newAgent;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create agent');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [callTogetherAI]
  );

  const updateAgent = useCallback(
    async (id: string, updates: Partial<Agent>) => {
      setAgents((prev) => prev.map((agent) => (agent.id === id ? { ...agent, ...updates } : agent)));

      if (currentAgent?.id === id) {
        setCurrentAgent((prev) => (prev ? { ...prev, ...updates } : null));
      }
    },
    [currentAgent]
  );

  const deleteAgent = useCallback(
    (id: string) => {
      setAgents((prev) => prev.filter((agent) => agent.id !== id));

      if (currentAgent?.id === id) {
        setCurrentAgent(null);
      }
    },
    [currentAgent]
  );

  const selectAgent = useCallback(
    (id: string) => {
      const agent = agents.find((a) => a.id === id);
      setCurrentAgent(agent || null);
    },
    [agents]
  );

  const startAgentMonitoring = useCallback(
    (agentId: string, intervalMs: number = 5000) => {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(async () => {
        try {
          // Monitor agent health/status
          const agent = agents.find((a) => a.id === agentId);
          if (agent) {
            // Perform health check or status update
            console.log(`Monitoring agent: ${agent.name}`);
          }
        } catch (err) {
          console.error('Agent monitoring error:', err);
        }
      }, intervalMs);
    },
    [agents]
  );

  const stopAgentMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return {
    agents,
    currentAgent,
    isLoading: isLoading || aiLoading,
    error,
    createAgent,
    updateAgent,
    deleteAgent,
    selectAgent,
    startAgentMonitoring,
    stopAgentMonitoring,
    cancelRequest,
  };
}
