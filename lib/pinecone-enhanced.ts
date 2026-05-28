import { Pinecone } from '@pinecone-database/pinecone';
import { embedText, searchByText, upsertVectors, deleteVectors, getIndex, verifyPineconeConnection } from './pinecone';

/**
 * PineconeManager – real vector-database operations against a Pinecone index.
 * Replaces the old version that returned hardcoded union template responses.
 */
class PineconeManager {
  private client: Pinecone | null = null;
  private isInitialized = false;
  private connectionStatus = {
    connected: false,
    lastChecked: null as Date | null,
    error: null as string | null,
    indexName: 'union-documents',
  };

  constructor() {
    this.initialize();
  }

  private log(context: string, data: any) {
    console.log(`[PineconeManager] ${context}:`, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  private async initialize() {
    try {
      const apiKey = process.env.PINECONE_API_KEY;
      if (!apiKey) throw new Error('PINECONE_API_KEY is not set');
      if (!apiKey.startsWith('pcsk_')) throw new Error('PINECONE_API_KEY must start with "pcsk_"');

      this.client = new Pinecone({ apiKey });
      this.connectionStatus.indexName = process.env.PINECONE_INDEX_NAME || 'union-documents';
      this.isInitialized = true;

      this.log('Initialized Pinecone client', {
        indexName: this.connectionStatus.indexName,
        apiKeyPrefix: apiKey.substring(0, 8) + '...',
      });

      // Verify connection immediately
      await this.testConnection();
    } catch (error) {
      this.log('Initialization failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      this.connectionStatus.error = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  /**
   * Test the Pinecone connection by listing indexes.
   */
  async testConnection(): Promise<{
    connected: boolean;
    indexName: string;
    error?: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();
    try {
      const result = await verifyPineconeConnection();
      const responseTime = Date.now() - startTime;

      this.connectionStatus = {
        connected: result.connected,
        lastChecked: new Date(),
        error: result.error || null,
        indexName: result.indexName,
      };

      this.log('Connection test', {
        connected: result.connected,
        responseTime,
      });

      return {
        connected: result.connected,
        indexName: result.indexName,
        error: result.error,
        responseTime,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.connectionStatus = {
        connected: false,
        lastChecked: new Date(),
        error: msg,
        indexName: this.connectionStatus.indexName,
      };
      this.log('Connection test failed', { error: msg });
      return { connected: false, indexName: this.connectionStatus.indexName, error: msg };
    }
  }

  /**
   * Search the Pinecone index for documents matching the query.
   * Returns the raw vector-search matches.
   */
  async searchDocuments(
    query: string,
    topK: number = 5
  ): Promise<{
    matches: { id: string; score: number; metadata?: Record<string, any> }[];
  }> {
    try {
      if (!this.connectionStatus.connected) {
        throw new Error('Pinecone connection not available');
      }
      this.log('Searching documents', { query: query.substring(0, 100), topK });
      const results = await searchByText(query, topK);
      this.log('Search completed', { matchCount: results.matches.length });
      return results;
    } catch (error) {
      this.log('Search failed', { error, query: query.substring(0, 100) });
      throw error;
    }
  }

  /**
   * Upsert documents (text + metadata) into the index.
   * Each document is automatically embedded before storage.
   */
  async upsertDocuments(
    documents: { id: string; text: string; metadata?: Record<string, any> }[]
  ): Promise<void> {
    if (documents.length === 0) return;
    try {
      this.log('Upserting documents', { count: documents.length });
      const vectors = await Promise.all(
        documents.map(async (doc) => {
          const values = await embedText(doc.text, 'passage');
          return {
            id: doc.id,
            values,
            metadata: { ...doc.metadata, text: doc.text.substring(0, 5000) },
          };
        })
      );
      await upsertVectors(vectors);
      this.log('Documents upserted successfully', { count: documents.length });
    } catch (error) {
      this.log('Upsert failed', { error });
      throw error;
    }
  }

  /**
   * Delete documents from the index by their IDs.
   */
  async deleteDocuments(ids: string[]): Promise<void> {
    await deleteVectors(ids);
    this.log('Documents deleted', { count: ids.length });
  }

  /**
   * Get connection status.
   */
  getStatus() {
    return { ...this.connectionStatus };
  }

  /**
   * Run a health check against Pinecone.
   */
  async healthCheck() {
    const connectionResult = await this.testConnection();
    return {
      status: connectionResult.connected ? 'healthy' : 'unhealthy',
      details: connectionResult,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const pineconeManager = new PineconeManager();
export default pineconeManager;
