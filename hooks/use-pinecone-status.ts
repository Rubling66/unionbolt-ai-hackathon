import { useState, useEffect } from 'react';

interface PineconeStatus {
  connected: boolean;
  assistantId: string;
  error?: string;
  loading: boolean;
}

export function usePineconeStatus() {
  const [status, setStatus] = useState<PineconeStatus>({
    connected: false,
    assistantId: 'business-agent-bot',
    loading: true,
  });

  const checkConnection = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      const response = await fetch('/api/test-connection');
      const result = await response.json();
      
      if (result.status === 'success') {
        setStatus({
          connected: result.data.connected,
          assistantId: result.data.assistantId,
          error: result.data.error,
          loading: false,
        });
      } else {
        setStatus({
          connected: false,
          assistantId: 'business-agent-bot',
          error: result.error,
          loading: false,
        });
      }
    } catch (error) {
      setStatus({
        connected: false,
        assistantId: 'business-agent-bot',
        error: error instanceof Error ? error.message : 'Connection failed',
        loading: false,
      });
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { status, checkConnection };
}