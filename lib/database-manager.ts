// Database Manager for UnionBolt AI — refactored to use shared chat-service
// Previously duplicated RAG + DeepSeek logic from chat route.
// Now delegates to lib/chat-service.ts for all AI operations.

import { searchByText } from './pinecone';
import type { QueryResponse } from './chat-service';

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

interface DatabaseStatus {
  connected: boolean;
  lastChecked: Date | null;
  error: string | null;
  assistantId: string;
}

class DatabaseManager {
  private connectionStatus: DatabaseStatus = {
    connected: false,
    lastChecked: null,
    error: null,
    assistantId: 'unionbolt-ai-agent',
  };

  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private log(context: string, data: Record<string, unknown>) {
    console.log(`[DatabaseManager] ${context}:`, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  private async initialize() {
    try {
      this.log('Initializing DatabaseManager', {
        hasDeepSeekKey: !!process.env.DEEPSEEK_API_KEY,
        hasPineconeKey: !!process.env.PINECONE_API_KEY,
        environment: process.env.NODE_ENV,
      });

      await this.testConnection();
      this.isInitialized = true;

      this.log('DatabaseManager initialized', {
        assistantId: this.connectionStatus.assistantId,
      });
    } catch (error) {
      this.log('Initialization failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      this.connectionStatus.error =
        error instanceof Error ? error.message : 'Unknown error';
    }
  }

  /**
   * Test connectivity to DeepSeek API.
   */
  async testConnection(): Promise<{
    connected: boolean;
    assistantId: string;
    error?: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();

    try {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        throw new Error('DEEPSEEK_API_KEY environment variable is not set');
      }

      const response = await fetch(`${DEEPSEEK_BASE_URL}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`DeepSeek API error (${response.status}): ${body}`);
      }

      const responseTime = Date.now() - startTime;

      this.connectionStatus = {
        connected: true,
        lastChecked: new Date(),
        error: null,
        assistantId: this.connectionStatus.assistantId,
      };

      this.log('Connection test successful', { responseTime });

      return {
        connected: true,
        assistantId: this.connectionStatus.assistantId,
        responseTime,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.connectionStatus = {
        connected: false,
        lastChecked: new Date(),
        error: errorMessage,
        assistantId: this.connectionStatus.assistantId,
      };

      this.log('Connection test failed', { error: errorMessage });

      return {
        connected: false,
        assistantId: this.connectionStatus.assistantId,
        error: errorMessage,
      };
    }
  }

  getStatus(): DatabaseStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Query the AI assistant with RAG.
   * Delegates to the shared chat-service for actual AI logic.
   *
   * @deprecated Prefer using `processChat` from `@/lib/chat-service` directly
   *   for new code. This method is kept for backward compatibility with
   *   existing consumers (test-connection route, DatabaseStatus component).
   */
  async queryAssistant(
    query: string,
    context: string[] = [],
  ): Promise<QueryResponse> {
    // Lazy-import to avoid circular deps during build
    const { processChat } = await import('./chat-service');

    const conversationMessages = context.map(content => ({
      role: 'user' as const,
      content,
    }));

    // Build messages array matching the ChatRequest format
    const messages = [
      ...conversationMessages.slice(-5),
      { role: 'user' as const, content: query },
    ];

    try {
      const result = await processChat({ messages });

      return {
        response: result.message,
        tokenUsage: result.tokenUsage,
      };
    } catch (error) {
      this.log('Query failed', { error, query: query.substring(0, 100) });
      throw error;
    }
  }

  /**
   * Health check for the entire system.
   * Delegates to chat-service for comprehensive checking.
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: {
      deepseek: boolean;
      pinecone: boolean;
      ragPipeline: boolean;
      tavus: boolean;
    };
  }> {
    try {
      const { systemHealthCheck } = await import('./chat-service');
      const health = await systemHealthCheck();

      return {
        status: health.status,
        details: {
          deepseek: health.services.deepseek.connected,
          pinecone: health.services.pinecone.connected,
          ragPipeline:
            health.services.deepseek.connected &&
            health.services.pinecone.connected,
          tavus: health.services.tavus.configured,
        },
      };
    } catch (error) {
      this.log('Health check failed', { error });
      return {
        status: 'unhealthy',
        details: {
          deepseek: false,
          pinecone: false,
          ragPipeline: false,
          tavus: false,
        },
      };
    }
  }
}

// Export singleton instance
export const databaseManager = new DatabaseManager();
export default databaseManager;

// Re-export types for backward compatibility
export type { DatabaseStatus };
export type { QueryResponse };
