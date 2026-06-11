// Unified Health Check Endpoint — full system status for UnionBolts platform
// Combines DB test, Pinecone test, and Tavus config check in one endpoint

import { NextResponse } from 'next/server';
import { systemHealthCheck } from '@/lib/chat-service';

export async function GET() {
  try {
    const health = await systemHealthCheck();
    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
        services: {
          deepseek: { connected: false },
          pinecone: { connected: false },
          tavus: { configured: false },
        },
        environment: process.env.NODE_ENV || 'development',
        version: '2.0.0',
      },
      { status: 503 },
    );
  }
}
