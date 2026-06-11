// Token optimization utilities for efficient AI conversations
// Refactored: removed hardcoded keyword-based fallback responses (C3 from audit).
// Error handling is now the responsibility of chat-service.ts — this module
// focuses purely on token estimation and context management.

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface OptimizedMessage {
  role: 'user' | 'assistant';
  content: string;
  compressed?: boolean;
}

// Estimate token count (rough approximation: 1 token ≈ 4 characters)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Compress message content while preserving meaning
export function compressMessage(content: string): string {
  return content
    .replace(/\s+/g, ' ')
    .trim();
}

// Smart context trimming — keep most recent messages within token budget
export function trimContext(
  messages: OptimizedMessage[],
  maxTokens: number = 1000,
): OptimizedMessage[] {
  let totalTokens = 0;
  const trimmedMessages: OptimizedMessage[] = [];

  // Start from the most recent message and work backwards
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageTokens = estimateTokens(message.content);

    if (totalTokens + messageTokens <= maxTokens) {
      trimmedMessages.unshift(message);
      totalTokens += messageTokens;
    } else {
      break;
    }
  }

  return trimmedMessages;
}

// Monitor and log token usage for optimization
export function logTokenUsage(usage: TokenUsage, conversationId: string): void {
  if (typeof window !== 'undefined') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      conversationId,
      usage,
      efficiency: usage.total > 0 ? usage.prompt / usage.total : 0,
    };

    console.log('Token Usage:', logEntry);

    const existingLogs = JSON.parse(
      localStorage.getItem('tokenUsageLogs') || '[]',
    );
    existingLogs.push(logEntry);

    // Keep only last 100 entries
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100);
    }

    localStorage.setItem('tokenUsageLogs', JSON.stringify(existingLogs));
  }
}

// ── REMOVED FUNCTIONS (refactored out) ──────────────────────────────────
// getFallbackResponse() — keyword-matched hardcoded templates. Replaced by
//   chat-service.ts buildErrorResponse() which returns honest error messages.
// formatUnionQuery() — keyword-based context prepending. Replaced by
//   chat-service.ts retrieveContext() which uses real semantic search via
//   Pinecone embeddings (multilingual-e5-large).
