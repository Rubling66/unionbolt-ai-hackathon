import { NextResponse } from 'next/server';
import { databaseManager } from '@/lib/database-manager';

// Enhanced logging function
function logConnectionTest(context: string, data: any) {
  console.log(`[Database Connection Test] ${context}:`, {
    ...data,
    timestamp: new Date().toISOString()
  });
}

export async function GET() {
  logConnectionTest('Starting database connection test', {
    nodeEnv: process.env.NODE_ENV,
    databaseType: 'internal',
    assistantType: 'deepseek-r1'
  });

  try {
    // Test internal database connection
    logConnectionTest('Testing internal database and DeepSeek R1 connection', {
      databaseType: 'internal',
      assistantType: 'deepseek-r1',
      environment: process.env.NODE_ENV
    });

    const connectionPromise = databaseManager.testConnection();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout after 10 seconds')), 10000)
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
        databaseType: 'internal',
        assistantType: 'deepseek-r1',
        assistantId: 'deepseek-r1-agent',
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
        databaseType: 'internal',
        assistantType: 'deepseek-r1',
        assistantId: 'deepseek-r1-agent',
        nodeEnv: process.env.NODE_ENV,
      },
    }, { status: 500 });
  }
}