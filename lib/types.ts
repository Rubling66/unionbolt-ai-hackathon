// Shared type definitions for UnionBolts platform
// Centralizes types that were scattered across chat route, database-manager, and token-optimizer

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  conversationId?: string;
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface ChatResponse {
  message: string;
  tokenUsage: TokenUsage;
  conversationId: string;
  timestamp: string;
  messagesInContext: number;
  assistant: string;
  status: 'success' | 'error';
}

export interface ErrorResponse {
  status: 'error';
  error: string;
  message: string;
  conversationId?: string;
  timestamp: string;
  assistant: string;
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    deepseek: { connected: boolean; latency?: number; error?: string };
    pinecone: { connected: boolean; indexExists?: boolean; error?: string };
    tavus: { configured: boolean; error?: string };
  };
  environment: string;
  version: string;
}

export interface RAGContext {
  documents: Array<{ id: string; score: number; text: string }>;
  matchCount: number;
}

export interface AgentConfig {
  name: string;
  systemPrompt: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

// Constants
export const PLATFORM_VERSION = '2.0.0';
export const ASSISTANT_NAME = 'unionbolt-ai-agent';
export const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';
export const DEFAULT_MODEL = 'deepseek-chat';
export const MAX_CONTEXT_MESSAGES = 10;
export const MAX_REQUEST_SIZE_BYTES = 100 * 1024; // 100KB
export const MAX_MESSAGE_LENGTH_CHARS = 8000;
