import { Pinecone } from '@pinecone-database/pinecone';

// Enhanced logging function
function logPinecone(context: string, data: any) {
  console.log(`[Pinecone] ${context}:`, {
    ...data,
    timestamp: new Date().toISOString()
  });
}

// Validate environment variables with detailed logging
function validateEnvironment() {
  logPinecone('Environment validation', {
    hasApiKey: !!process.env.PINECONE_API_KEY,
    apiKeyFormat: process.env.PINECONE_API_KEY?.startsWith('pcsk_') ? 'valid' : 'invalid',
    hasAssistantId: !!process.env.PINECONE_ASSISTANT_ID,
    nodeEnv: process.env.NODE_ENV
  });

  if (!process.env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY environment variable is required');
  }

  if (!process.env.PINECONE_API_KEY.startsWith('pcsk_')) {
    throw new Error('PINECONE_API_KEY must be a valid Pinecone API key starting with "pcsk_"');
  }
}

// Initialize Pinecone client with error handling
let pinecone: Pinecone;

try {
  validateEnvironment();
  
  pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  
  logPinecone('Client initialized successfully', {
    apiKeyPrefix: process.env.PINECONE_API_KEY!.substring(0, 8) + '...'
  });
} catch (error) {
  logPinecone('Client initialization failed', {
    error: error instanceof Error ? error.message : 'Unknown error'
  });
  
  // Create a mock client that will fail gracefully
  pinecone = {} as Pinecone;
}

export { pinecone };

// Connection verification function with comprehensive error handling
export async function verifyPineconeConnection(): Promise<{
  connected: boolean;
  assistantId: string;
  error?: string;
  details?: any;
}> {
  try {
    logPinecone('Starting connection verification', {
      hasClient: !!pinecone,
      hasListIndexes: typeof pinecone.listIndexes === 'function'
    });

    // Validate environment variables before attempting connection
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY environment variable is not set');
    }
    
    if (!process.env.PINECONE_API_KEY.startsWith('pcsk_')) {
      throw new Error('Invalid PINECONE_API_KEY format. Must start with "pcsk_"');
    }

    // Test connection by listing indexes with timeout
    const startTime = Date.now();
    
    if (!pinecone.listIndexes) {
      throw new Error('Pinecone client not properly initialized');
    }

    const indexes = await pinecone.listIndexes();
    const endTime = Date.now();
    
    logPinecone('Connection successful', {
      responseTime: endTime - startTime,
      indexCount: indexes.indexes?.length || 0,
      indexes: indexes.indexes?.map(idx => idx.name) || []
    });
    
    return {
      connected: true,
      assistantId: process.env.PINECONE_ASSISTANT_ID || 'business-agent-bot',
      details: {
        responseTime: endTime - startTime,
        indexCount: indexes.indexes?.length || 0
      }
    };
  } catch (error) {
    logPinecone('Connection failed', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });
    
    return {
      connected: false,
      assistantId: process.env.PINECONE_ASSISTANT_ID || 'business-agent-bot',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Get assistant configuration with validation
export function getAssistantConfig() {
  const config = {
    assistantId: process.env.PINECONE_ASSISTANT_ID || 'business-agent-bot',
    apiKey: process.env.PINECONE_API_KEY ? 
      `***${process.env.PINECONE_API_KEY.slice(-4)}` : 
      'not configured',
    apiKeyValid: process.env.PINECONE_API_KEY?.startsWith('pcsk_') || false,
    environment: process.env.NODE_ENV || 'development'
  };
  
  logPinecone('Assistant configuration', config);
  return config;
}

// Health check function for monitoring
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  checks: Record<string, boolean>;
  timestamp: string;
}> {
  const checks: Record<string, boolean> = {
    environmentVariables: !!(process.env.PINECONE_API_KEY && process.env.PINECONE_ASSISTANT_ID),
    apiKeyFormat: process.env.PINECONE_API_KEY?.startsWith('pcsk_') || false,
    clientInitialized: !!pinecone && typeof pinecone.listIndexes === 'function'
  };
  
  let connectionCheck = false;
  try {
    const result = await verifyPineconeConnection();
    connectionCheck = result.connected;
  } catch (error) {
    logPinecone('Health check connection failed', { error });
  }
  
  checks.connection = connectionCheck;
  
  const allHealthy = Object.values(checks).every(check => check === true);
  
  logPinecone('Health check completed', {
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks
  });
  
  return {
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  };
}