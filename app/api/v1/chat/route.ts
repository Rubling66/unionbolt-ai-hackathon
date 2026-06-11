// API v1 Chat Endpoint — canonical versioned endpoint for UnionBolts platform
// Implements the modular monolith architecture recommended by the audit.
// /api/chat remains as a backward-compatible wrapper.

import { NextRequest, NextResponse } from 'next/server';
import {
  processChat,
  buildErrorResponse,
  validateChatRequest,
  ValidationError,
} from '@/lib/chat-service';
import { MAX_REQUEST_SIZE_BYTES } from '@/lib/types';

export async function POST(request: NextRequest) {
  // ── Input size limit ──────────────────────────────────────────────────
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > MAX_REQUEST_SIZE_BYTES) {
    return NextResponse.json(
      {
        status: 'error',
        error: 'Request too large',
        message: `Request body exceeds ${MAX_REQUEST_SIZE_BYTES / 1024}KB limit. Please reduce the conversation length.`,
        timestamp: new Date().toISOString(),
        assistant: 'unionbolt-ai-agent',
        apiVersion: 'v1',
      },
      { status: 413 },
    );
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Invalid JSON in request body',
          message: 'The request body could not be parsed as JSON. Please check your input.',
          timestamp: new Date().toISOString(),
          assistant: 'unionbolt-ai-agent',
          apiVersion: 'v1',
        },
        { status: 400 },
      );
    }

    const validatedRequest = validateChatRequest(body);
    const response = await processChat(validatedRequest);
    
    // Add API version metadata to response
    return NextResponse.json(
      { ...response, apiVersion: 'v1' },
      { status: 200 },
    );

  } catch (error) {
    console.error('[Chat API v1] Unhandled error:', error);
    const statusCode = error instanceof ValidationError ? 400 : 500;
    const errorResponse = buildErrorResponse(error);
    return NextResponse.json(
      { ...errorResponse, apiVersion: 'v1' },
      { status: statusCode },
    );
  }
}

// API discovery endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/v1/chat',
    version: '2.0.0',
    apiVersion: 'v1',
    capabilities: [
      'rag-chat',
      'pinecone-semantic-search',
      'deepseek-completion',
      'multi-turn-conversation',
    ],
    limits: {
      maxMessagesPerRequest: 50,
      maxContextMessages: 10,
      maxMessageLength: 8000,
      maxRequestSize: '100KB',
    },
    models: ['deepseek-chat'],
    timestamp: new Date().toISOString(),
  });
}
