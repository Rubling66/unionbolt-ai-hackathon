// Database Manager for UnionBolt AI
// Real RAG pipeline: Pinecone vector search → DeepSeek chat completion

import { searchByText } from './pinecone';

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

interface DatabaseStatus {
  connected: boolean;
  lastChecked: Date | null;
  error: string | null;
  assistantId: string;
}

interface QueryResponse {
  response: string;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
}

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
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

  private log(context: string, data: any) {
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
      this.connectionStatus.error = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  /**
   * Test connectivity to DeepSeek API.
   * This sends a minimal request to verify the key is valid.
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
          'Authorization': `Bearer ${apiKey}`,
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

      this.log('Connection test successful', {
        responseTime,
      });

      return {
        connected: true,
        assistantId: this.connectionStatus.assistantId,
        responseTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

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
   * 1. Search Pinecone for relevant documents
   * 2. Build an augmented prompt with the search results
   * 3. Send to DeepSeek for completion
   */
  async queryAssistant(query: string, context: string[] = []): Promise<QueryResponse> {
    try {
      if (!this.connectionStatus.connected) {
        // Try to connect if not already connected
        await this.testConnection();
        if (!this.connectionStatus.connected) {
          throw new Error('DeepSeek API connection not available');
        }
      }

      this.log('Processing query with RAG pipeline', {
        queryLength: query.length,
        contextItems: context.length,
      });

      // Step 1: Search Pinecone for relevant documents
      let ragContext = '';
      try {
        const searchResults = await searchByText(query, 5);
        if (searchResults.matches.length > 0) {
          ragContext = searchResults.matches
            .filter(m => m.metadata?.text)
            .map((m, i) => `[Document ${i + 1}] (relevance: ${(m.score * 100).toFixed(0)}%)\n${m.metadata!.text}`)
            .join('\n\n');
          this.log('RAG context found', { matchCount: searchResults.matches.length });
        } else {
          this.log('No RAG documents found', {});
        }
      } catch (searchError) {
        this.log('Pinecone search failed, proceeding without RAG context', {
          error: searchError instanceof Error ? searchError.message : 'Unknown error',
        });
      }

      // Step 2: Build messages array
      const systemPrompt = `You are an expert union advisor and workplace advocate. Your role is to help union members with questions about workplace safety, grievance procedures, contracts, benefits, training, and workers' rights.

You provide accurate, practical, and empathetic advice based on labor law, collective bargaining practices, and union principles. When you have relevant document context, use it to ground your answers. If you don't know something, say so honestly.

Keep responses clear, structured, and actionable. Use markdown formatting for readability.`;

      const messages: DeepSeekMessage[] = [
        { role: 'system', content: systemPrompt },
      ];

      // Add previous conversation context (last 5 messages)
      for (const ctx of context.slice(-5)) {
        messages.push({ role: 'user' as const, content: ctx });
        // Approximate: we don't have assistant responses in context array,
        // but the UI sends alternation properly via the chat route.
      }

      // Add RAG context if available
      let userContent = query;
      if (ragContext) {
        userContent = `Here are relevant documents from our knowledge base:\n\n${ragContext}\n\nBased on the above, please answer the following question:\n\n${query}`;
      }

      messages.push({ role: 'user', content: userContent });

      // Step 3: Call DeepSeek API
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        throw new Error('DEEPSEEK_API_KEY environment variable is not set');
      }

      const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          max_tokens: 1024,
          temperature: 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`DeepSeek API error (${response.status}): ${body}`);
      }

      const data = await response.json();

      const completionContent = data.choices?.[0]?.message?.content || '';
      if (!completionContent) {
        throw new Error('DeepSeek returned empty response');
      }

      const usage = data.usage || {};
      const tokenUsage = {
        prompt: usage.prompt_tokens || Math.ceil(messages.reduce((s, m) => s + m.content.length, 0) / 4),
        completion: usage.completion_tokens || Math.ceil(completionContent.length / 4),
        total: (usage.prompt_tokens || 0) + (usage.completion_tokens || 0) ||
               Math.ceil((messages.reduce((s, m) => s + m.content.length, 0) + completionContent.length) / 4),
      };

      this.log('DeepSeek response received', {
        tokenUsage,
        responseLength: completionContent.length,
      });

      return {
        response: completionContent,
        tokenUsage,
      };
    } catch (error) {
      this.log('Query failed', { error, query: query.substring(0, 100) });
      throw error;
    }
  }

  /**
   * Health check for the entire system.
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: {
      deepseek: boolean;
      pinecone: boolean;
      ragPipeline: boolean;
    };
  }> {
    try {
      const connectionTest = await this.testConnection();

      // Also check if Pinecone is reachable
      let pineconeReachable = false;
      try {
        const { verifyPineconeConnection } = await import('./pinecone');
        const pcResult = await verifyPineconeConnection();
        pineconeReachable = pcResult.connected;
      } catch {
        pineconeReachable = false;
      }

      return {
        status: connectionTest.connected ? 'healthy' : 'unhealthy',
        details: {
          deepseek: connectionTest.connected,
          pinecone: pineconeReachable,
          ragPipeline: connectionTest.connected && pineconeReachable,
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
        },
      };
    }
  }
}

// Export singleton instance
export const databaseManager = new DatabaseManager();
export default databaseManager;

// Export types for use in other files
export type { DatabaseStatus, QueryResponse };
