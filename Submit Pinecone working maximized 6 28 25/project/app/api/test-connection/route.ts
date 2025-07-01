import { NextResponse } from 'next/server';
import { pineconeManager } from '@/lib/pinecone-enhanced';

// Enhanced logging function
function logConnectionTest(context: string, data: any) {
  console.log(`[Connection Test] ${context}:`, {
    ...data,
    timestamp: new Date().toISOString()
  });
}

export async function GET() {
  logConnectionTest('Starting connection test', {
    nodeEnv: process.env.NODE_ENV,
    hasApiKey: !!process.env.PINECONE_API_KEY,
    hasAssistantId: !!process.env.PINECONE_ASSISTANT_ID
  });

  try {
    // Validate environment variables first
    if (!process.env.PINECONE_API_KEY) {
      logConnectionTest('Environment validation failed', { 
        error: 'PINECONE_API_KEY not configured' 
      });
      
      return NextResponse.json({
        status: 'error',
        error: 'PINECONE_API_KEY environment variable is not configured',
        timestamp: new Date().toISOString(),
        environment: {
          apiKeyConfigured: false,
          apiKeyValid: false,
          assistantId: process.env.PINECONE_ASSISTANT_ID || 'business-agent-bot',
        },
      }, { status: 500 });
    }

    if (!process.env.PINECONE_API_KEY.startsWith('pcsk_')) {
      logConnectionTest('API key validation failed', { 
        apiKeyPrefix: process.env.PINECONE_API_KEY.substring(0, 5),
        expectedPrefix: 'pcsk_'
      });
      
      return NextResponse.json({
        status: 'error',
        error: 'Invalid PINECONE_API_KEY format. Must start with "pcsk_"',
        timestamp: new Date().toISOString(),
        environment: {
          apiKeyConfigured: true,
          apiKeyValid: false,
          assistantId: process.env.PINECONE_ASSISTANT_ID || 'business-agent-bot',
        },
      }, { status: 500 });
    }

    // Test Pinecone connection with timeout
    logConnectionTest('Testing Pinecone connection', {
      apiKeyPrefix: process.env.PINECONE_API_KEY.substring(0, 8) + '...',
      assistantId: process.env.PINECONE_ASSISTANT_ID
    });

    const connectionPromise = pineconeManager.testConnection();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
    );

    const connectionStatus = await Promise.race([connectionPromise, timeoutPromise]) as any;
    
    logConnectionTest('Connection test completed', {
      connected: connectionStatus.connected,
      error: connectionStatus.error,
      assistantId: connectionStatus.assistantId,
      responseTime: connectionStatus.responseTime
    });

    return NextResponse.json({
      status: 'success',
      data: connectionStatus,
      timestamp: new Date().toISOString(),
      environment: {
        apiKeyConfigured: !!process.env.PINECONE_API_KEY,
        apiKeyValid: process.env.PINECONE_API_KEY?.startsWith('pcsk_'),
        assistantId: process.env.PINECONE_ASSISTANT_ID || 'business-agent-bot',
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    logConnectionTest('Connection test failed with error', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      environment: {
        apiKeyConfigured: !!process.env.PINECONE_API_KEY,
        apiKeyValid: process.env.PINECONE_API_KEY?.startsWith('pcsk_'),
        assistantId: process.env.PINECONE_ASSISTANT_ID || 'business-agent-bot',
        nodeEnv: process.env.NODE_ENV,
      },
    }, { status: 500 });
  }
}