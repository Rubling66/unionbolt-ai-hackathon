import { Pinecone, Index } from '@pinecone-database/pinecone';

// Pinecone client singleton with real vector database operations

function logPinecone(context: string, data: any) {
  console.log(`[Pinecone] ${context}:`, {
    ...data,
    timestamp: new Date().toISOString()
  });
}

let pinecone: Pinecone | null = null;
let isInitialized = false;

function getClient(): Pinecone {
  if (!pinecone) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY environment variable is not set');
    }
    pinecone = new Pinecone({ apiKey });
    isInitialized = true;
  }
  return pinecone;
}

/** Get the configured index name from env */
function getIndexName(): string {
  return process.env.PINECONE_INDEX_NAME || 'union-documents';
}

/**
 * Get a handle to the configured Pinecone index.
 * The index must already exist in your Pinecone project.
 */
export function getIndex(): Index {
  const pc = getClient();
  return pc.index(getIndexName());
}

/**
 * List all indexes in the Pinecone project.
 */
export async function listIndexes(): Promise<string[]> {
  const pc = getClient();
  const result = await pc.listIndexes();
  return result.indexes?.map((idx: any) => idx.name) || [];
}

/**
 * Describe a specific index.
 */
export async function describeIndex(indexName?: string) {
  const pc = getClient();
  return pc.describeIndex(indexName || getIndexName());
}

/**
 * Create a new serverless index if it doesn't exist.
 */
export async function ensureIndex(
  name?: string,
  dimension: number = 1024,
  metric: 'cosine' | 'euclidean' | 'dotproduct' = 'cosine'
): Promise<void> {
  const pc = getClient();
  const indexName = name || getIndexName();
  const existing = await listIndexes();
  if (existing.includes(indexName)) {
    logPinecone('Index already exists', { indexName });
    return;
  }
  await pc.createIndex({
    name: indexName,
    dimension,
    metric,
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-east-1'
      }
    }
  });
  logPinecone('Index created', { indexName, dimension, metric });
}

/**
 * Delete an index.
 */
export async function deleteIndex(indexName?: string): Promise<void> {
  const pc = getClient();
  const name = indexName || getIndexName();
  await pc.deleteIndex(name);
  logPinecone('Index deleted', { name });
}

/**
 * Upsert vectors into the index.
 */
export async function upsertVectors(
  vectors: { id: string; values: number[]; metadata?: Record<string, any> }[]
): Promise<void> {
  const index = getIndex();
  await index.upsert(vectors);
  logPinecone('Upserted vectors', { count: vectors.length });
}

/**
 * Query the index with a raw vector.
 */
export async function queryVectors(
  vector: number[],
  topK: number = 10,
  filter?: Record<string, any>
): Promise<{
  matches: { id: string; score: number; metadata?: Record<string, any> }[];
}> {
  const index = getIndex();
  const result = await index.query({
    vector,
    topK,
    ...(filter ? { filter } : {}),
    includeMetadata: true,
  });
  return {
    matches: result.matches?.map(m => ({
      id: m.id,
      score: m.score || 0,
      metadata: m.metadata as Record<string, any> | undefined,
    })) || [],
  };
}

/**
 * Delete vectors by ID.
 */
export async function deleteVectors(ids: string[]): Promise<void> {
  const index = getIndex();
  await index.deleteMany(ids);
  logPinecone('Deleted vectors', { count: ids.length });
}

/**
 * Delete all vectors from the index.
 */
export async function clearIndex(): Promise<void> {
  const index = getIndex();
  await index.deleteAll();
  logPinecone('Cleared all vectors', {});
}

/**
 * Fetch vectors by ID.
 */
export async function fetchVectors(ids: string[]): Promise<Record<string, any>> {
  const index = getIndex();
  const result = await index.fetch(ids);
  return result.records || {};
}

// ---- Embedding helpers via Pinecone inference ----

/**
 * Embed a text string using Pinecone's built-in inference.
 * Uses the multilingual-e5-large model by default.
 */
export async function embedText(
  text: string,
  inputType: 'query' | 'passage' = 'query'
): Promise<number[]> {
  const pc = getClient();
  const result = await pc.inference.embed(
    'multilingual-e5-large',
    [text],
    { inputType, truncate: 'END' }
  );
  const embedding = result.data?.[0]?.values;
  if (!embedding) throw new Error('Embedding failed — no values returned');
  return embedding;
}

/**
 * Embed multiple text passages at once.
 */
export async function embedTexts(
  texts: string[],
  inputType: 'query' | 'passage' = 'passage'
): Promise<number[][]> {
  if (texts.length === 0) return [];
  const pc = getClient();
  const result = await pc.inference.embed(
    'multilingual-e5-large',
    texts,
    { inputType, truncate: 'END' }
  );
  return result.data?.map(d => d.values) || [];
}

// ---- Composite helpers ----

/**
 * Search the index by embedding the query text first.
 */
export async function searchByText(
  query: string,
  topK: number = 10,
  filter?: Record<string, any>
): Promise<{
  matches: { id: string; score: number; metadata?: Record<string, any> }[];
}> {
  const vector = await embedText(query, 'query');
  return queryVectors(vector, topK, filter);
}

// ---- Verification & health ----

export async function verifyPineconeConnection(): Promise<{
  connected: boolean;
  indexName: string;
  error?: string;
  details?: any;
}> {
  try {
    const pc = getClient();
    const indexes = await pc.listIndexes();
    const indexName = getIndexName();
    const indexExists = indexes.indexes?.some((i: any) => i.name === indexName);
    return {
      connected: true,
      indexName,
      details: {
        indexes: indexes.indexes?.map((i: any) => i.name) || [],
        indexExists,
        serverless: true,
      }
    };
  } catch (error) {
    return {
      connected: false,
      indexName: getIndexName(),
      error: error instanceof Error ? error.message : 'Unknown error',
      details: { errorType: error instanceof Error ? error.constructor.name : 'Unknown' },
    };
  }
}

export function getAssistantConfig() {
  return {
    indexName: getIndexName(),
    apiKey: process.env.PINECONE_API_KEY
      ? `***${process.env.PINECONE_API_KEY.slice(-4)}`
      : 'not configured',
    apiKeyValid: !!process.env.PINECONE_API_KEY?.startsWith('pcsk_'),
    environment: process.env.NODE_ENV || 'development',
  };
}

export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  checks: Record<string, boolean>;
  timestamp: string;
}> {
  const checks: Record<string, boolean> = {
    apiKeySet: !!process.env.PINECONE_API_KEY,
    apiKeyFormat: process.env.PINECONE_API_KEY?.startsWith('pcsk_') || false,
  };
  try {
    const result = await verifyPineconeConnection();
    checks.connected = result.connected;
  } catch {
    checks.connected = false;
  }
  const allHealthy = Object.values(checks).every(c => c === true);
  return {
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  };
}

export { pinecone, isInitialized };
