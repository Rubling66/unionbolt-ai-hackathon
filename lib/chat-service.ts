// Chat Service — shared RAG + DeepSeek logic for UnionBolts platform
// Extracted from app/api/chat/route.ts and lib/database-manager.ts to eliminate duplication.
// Replaces database-manager.ts queryAssistant() pattern with a cleaner, single-responsibility module.

import { searchByText } from './pinecone';
import type {
  ChatMessage, ChatRequest, ChatResponse, ErrorResponse,
  TokenUsage, RAGContext, HealthCheckResult, AgentConfig,
} from './types';

// Re-export for backward compatibility with database-manager.ts
export interface QueryResponse {
  response: string;
  tokenUsage: TokenUsage;
}
import {
  DEEPSEEK_BASE_URL, DEFAULT_MODEL, MAX_CONTEXT_MESSAGES,
  MAX_REQUEST_SIZE_BYTES, MAX_MESSAGE_LENGTH_CHARS,
  PLATFORM_VERSION, ASSISTANT_NAME,
} from './types';

// ── Logging helper ──────────────────────────────────────────────────────
function log(context: string, data: Record<string, unknown>) {
  console.log(`[ChatService] ${context}:`, {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

// ── Validation ──────────────────────────────────────────────────────────
export class ValidationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateChatRequest(body: unknown): ChatRequest {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body must be a JSON object');
  }

  const { messages, conversationId } = body as Record<string, unknown>;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new ValidationError('Messages array is required and cannot be empty');
  }

  if (messages.length > 50) {
    throw new ValidationError('Too many messages. Maximum is 50 per request.');
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i] as Record<string, unknown>;
    if (!msg.role || !msg.content || typeof msg.content !== 'string') {
      throw new ValidationError(`Invalid message structure at index ${i}`);
    }
    if (!['user', 'assistant', 'system'].includes(msg.role as string)) {
      throw new ValidationError(`Invalid role at index ${i}: must be user, assistant, or system`);
    }
    if ((msg.content as string).length > MAX_MESSAGE_LENGTH_CHARS) {
      throw new ValidationError(`Message at index ${i} exceeds ${MAX_MESSAGE_LENGTH_CHARS} character limit`);
    }
  }

  return {
    messages: messages as ChatMessage[],
    conversationId: typeof conversationId === 'string' ? conversationId : undefined,
  };
}

// ── RAG Pipeline ────────────────────────────────────────────────────────
export async function retrieveContext(query: string, topK: number = 5): Promise<RAGContext> {
  try {
    const results = await searchByText(query, topK);
    const documents = results.matches
      .filter(m => m.metadata?.text)
      .map(m => ({
        id: m.id,
        score: m.score,
        text: m.metadata!.text as string,
      }));

    log('RAG context retrieved', { matchCount: documents.length });

    return {
      documents,
      matchCount: documents.length,
    };
  } catch (error) {
    log('RAG retrieval failed (non-fatal)', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return { documents: [], matchCount: 0 };
  }
}

export function buildAugmentedPrompt(
  query: string,
  ragContext: RAGContext,
  history: ChatMessage[],
): ChatMessage[] {
  const messages: ChatMessage[] = [];

  // Add conversation history (user ↔ assistant pairs)
  for (const msg of history) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push(msg);
    }
  }

  // Build the final user message with RAG context
  let userContent = query;
  if (ragContext.documents.length > 0) {
    const docTexts = ragContext.documents
      .map((d, i) => `[Document ${i + 1}] (relevance: ${(d.score * 100).toFixed(0)}%)\n${d.text}`)
      .join('\n\n');
    userContent = `Here are relevant documents from our knowledge base:\n\n${docTexts}\n\nBased on the above, please answer the following question:\n\n${query}`;
  }

  messages.push({ role: 'user', content: userContent });
  return messages;
}

// ── Agent Configuration ─────────────────────────────────────────────────
export const UNION_ADVISOR_AGENT: AgentConfig = {
  name: 'union-advisor',
  systemPrompt: `You are an expert union advisor and workplace advocate. Your role is to help union members with questions about workplace safety, grievance procedures, contracts, benefits, training, and workers' rights.

You provide accurate, practical, and empathetic advice based on labor law, collective bargaining practices, and union principles. When you have relevant document context, use it to ground your answers. If you don't know something, say so honestly — never fabricate information.

Keep responses clear, structured, and actionable. Use markdown formatting for readability.`,
  model: DEFAULT_MODEL,
  maxTokens: 1024,
  temperature: 0.7,
};

// ── DeepSeek API Call ───────────────────────────────────────────────────
export async function callDeepSeek(
  systemPrompt: string,
  messages: ChatMessage[],
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  } = {},
): Promise<{ content: string; usage: TokenUsage }> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY environment variable is not set');
  }

  const model = options.model || DEFAULT_MODEL;
  const maxTokens = options.maxTokens || 1024;
  const temperature = options.temperature ?? 0.7;

  const deepseekMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  log('Calling DeepSeek', {
    model,
    messageCount: deepseekMessages.length,
    maxTokens,
  });

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: deepseekMessages,
      max_tokens: maxTokens,
      temperature,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    log('DeepSeek API error', { status: response.status, body: errorBody.substring(0, 200) });
    throw new Error(`DeepSeek API returned ${response.status}: ${errorBody.substring(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  if (!content) {
    throw new Error('DeepSeek returned empty response content');
  }

  const usage: TokenUsage = {
    prompt: data.usage?.prompt_tokens || 0,
    completion: data.usage?.completion_tokens || 0,
    total: (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0),
  };

  log('DeepSeek response received', {
    contentLength: content.length,
    usage,
  });

  return { content, usage };
}

// ── Full Chat Pipeline ──────────────────────────────────────────────────
export async function processChat(request: ChatRequest): Promise<ChatResponse> {
  const { messages, conversationId } = request;

  // Limit context window (keep system prompt manageable)
  const limitedMessages = messages.slice(-MAX_CONTEXT_MESSAGES);
  const userMessage = limitedMessages[limitedMessages.length - 1];
  const previousMessages = limitedMessages.slice(0, -1);

  log('Processing chat', {
    originalCount: messages.length,
    limitedCount: limitedMessages.length,
    conversationId,
  });

  // RAG pipeline
  const ragContext = await retrieveContext(userMessage.content);

  // Build augmented messages
  const augmentedMessages = buildAugmentedPrompt(
    userMessage.content,
    ragContext,
    previousMessages,
  );

  // Call DeepSeek
  const { content, usage } = await callDeepSeek(
    UNION_ADVISOR_AGENT.systemPrompt,
    augmentedMessages,
    {
      model: UNION_ADVISOR_AGENT.model,
      maxTokens: UNION_ADVISOR_AGENT.maxTokens,
      temperature: UNION_ADVISOR_AGENT.temperature,
    },
  );

  const responseConversationId = conversationId ||
    `conv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  return {
    message: content,
    tokenUsage: usage,
    conversationId: responseConversationId,
    timestamp: new Date().toISOString(),
    messagesInContext: limitedMessages.length,
    assistant: ASSISTANT_NAME,
    status: 'success',
  };
}

// ── Error Response Builder ──────────────────────────────────────────────
export function buildErrorResponse(
  error: unknown,
  conversationId?: string,
): ErrorResponse {
  const message = error instanceof ValidationError
    ? error.message
    : error instanceof Error
    ? error.message
    : 'An unexpected error occurred';

  // NEVER return hardcoded templates — return honest error messages
  let userMessage: string;
  if (error instanceof ValidationError) {
    userMessage = `Invalid request: ${message}. Please check your input and try again.`;
  } else if (message.includes('API key') || message.includes('API_KEY')) {
    userMessage = 'The AI service is not fully configured yet. Please contact your administrator.';
  } else if (message.includes('DeepSeek API returned')) {
    userMessage = 'The AI service is temporarily unavailable. Please try again in a moment.';
  } else {
    userMessage = 'I encountered an unexpected error processing your request. Please try again or contact support if the issue persists.';
  }

  return {
    status: 'error',
    error: message,
    message: userMessage,
    conversationId: conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    timestamp: new Date().toISOString(),
    assistant: ASSISTANT_NAME,
  };
}

// ── Health Check ────────────────────────────────────────────────────────
export async function systemHealthCheck(): Promise<HealthCheckResult> {
  const services: HealthCheckResult['services'] = {
    deepseek: { connected: false },
    pinecone: { connected: false },
    tavus: { configured: !!process.env.TAVUS_API_KEY },
  };

  // Check DeepSeek
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      services.deepseek.error = 'DEEPSEEK_API_KEY not set';
    } else {
      const start = Date.now();
      const response = await fetch(`${DEEPSEEK_BASE_URL}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      services.deepseek.connected = response.ok;
      services.deepseek.latency = Date.now() - start;
      if (!response.ok) {
        services.deepseek.error = `HTTP ${response.status}`;
      }
    }
  } catch (error) {
    services.deepseek.error = error instanceof Error ? error.message : 'Connection failed';
  }

  // Check Pinecone
  try {
    const { verifyPineconeConnection } = await import('./pinecone');
    const result = await verifyPineconeConnection();
    services.pinecone.connected = result.connected;
    services.pinecone.indexExists = result.details?.indexExists;
    if (result.error) {
      services.pinecone.error = result.error;
    }
  } catch (error) {
    services.pinecone.error = error instanceof Error ? error.message : 'Connection failed';
  }

  const allHealthy = services.deepseek.connected && services.pinecone.connected;

  return {
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services,
    environment: process.env.NODE_ENV || 'development',
    version: PLATFORM_VERSION,
  };
}
