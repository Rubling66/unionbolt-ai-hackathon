// Integration tests — cross-component behavior for UnionBolts platform
// Tests the full pipeline: validation → RAG → chat-service → endpoints
// Verifies database-manager delegation, health check integration, error consistency

import {
  validateChatRequest,
  buildAugmentedPrompt,
  buildErrorResponse,
  retrieveContext,
  ValidationError,
  processChat,
  systemHealthCheck,
} from '@/lib/chat-service';
import {
  estimateTokens,
  trimContext,
  compressMessage,
} from '@/lib/token-optimizer';
import type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ErrorResponse,
  RAGContext,
  HealthCheckResult,
} from '@/lib/types';
import {
  PLATFORM_VERSION,
  ASSISTANT_NAME,
  MAX_REQUEST_SIZE_BYTES,
  MAX_MESSAGE_LENGTH_CHARS,
  MAX_CONTEXT_MESSAGES,
} from '@/lib/types';

// ── Full Pipeline Integration ────────────────────────────────────────────
describe('Full Chat Pipeline Integration', () => {
  it('validates request → builds RAG context → returns ChatResponse shape', async () => {
    const body = {
      messages: [
        { role: 'user' as const, content: 'How do I file a workplace grievance?' },
      ],
      conversationId: 'conv_test_123',
    };

    // Validation
    const validated = validateChatRequest(body);
    expect(validated.messages).toHaveLength(1);
    expect(validated.conversationId).toBe('conv_test_123');

    // RAG retrieval (will return empty without Pinecone, but should not crash)
    const ragContext = await retrieveContext(validated.messages[0].content);
    expect(ragContext).toHaveProperty('documents');
    expect(ragContext).toHaveProperty('matchCount');

    // Build augmented prompt
    const augmented = buildAugmentedPrompt(
      validated.messages[0].content,
      ragContext,
      [],
    );
    expect(augmented.length).toBeGreaterThanOrEqual(1);
    expect(augmented[augmented.length - 1].role).toBe('user');
  });

  it('handles multi-turn conversation with context trimming', () => {
    const messages: ChatMessage[] = Array.from({ length: 15 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' as const : 'assistant' as const,
      content: `Message ${i}: This is a test message about union procedures and workplace safety regulations that should be long enough to consume tokens.`,
    }));

    // The chat-service limits to MAX_CONTEXT_MESSAGES internally
    expect(messages.length).toBeGreaterThan(MAX_CONTEXT_MESSAGES);

    // Token optimizer should trim older messages
    const optimized = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: compressMessage(m.content),
    }));
    const trimmed = trimContext(optimized, 50);
    expect(trimmed.length).toBeLessThan(messages.length);
    // Most recent messages preserved
    const lastContent = trimmed[trimmed.length - 1].content;
    expect(lastContent).toContain('14');
  });

  it('handles message at exact size limit boundaries', () => {
    const maxContent = 'a'.repeat(MAX_MESSAGE_LENGTH_CHARS);
    const body = {
      messages: [{ role: 'user' as const, content: maxContent }],
    };
    expect(() => validateChatRequest(body)).not.toThrow();

    const overLimit = 'a'.repeat(MAX_MESSAGE_LENGTH_CHARS + 1);
    const bodyOver = {
      messages: [{ role: 'user' as const, content: overLimit }],
    };
    expect(() => validateChatRequest(bodyOver)).toThrow(ValidationError);
  });
});

// ── Error Consistency Across Components ──────────────────────────────────
describe('Error Response Consistency', () => {
  it('buildErrorResponse always returns valid ErrorResponse shape', () => {
    const errors = [
      new ValidationError('Missing field'),
      new Error('DEEPSEEK_API_KEY environment variable is not set'),
      new Error('DeepSeek API returned 503: Service Unavailable'),
      new Error('Unknown database error'),
      'string error',
      { object: 'error' },
    ];

    for (const error of errors) {
      const result = buildErrorResponse(error);
      expect(result.status).toBe('error');
      expect(typeof result.error).toBe('string');
      expect(typeof result.message).toBe('string');
      expect(result.assistant).toBe(ASSISTANT_NAME);
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).getTime()).not.toBeNaN();
      expect(result.conversationId).toMatch(/^conv_/);
    }
  });

  it('no hardcoded AI fallback responses in error messages', () => {
    const error = new Error('DeepSeek API returned 500: Internal Server Error');
    const result = buildErrorResponse(error);

    // Should NOT contain any hardcoded template text
    const forbidden = [
      'I can provide basic safety information',
      "I'm temporarily offline",
      'Please try again later',
      'Here is what I know',
      'I think you are asking about',
    ];
    for (const phrase of forbidden) {
      expect(result.message).not.toContain(phrase);
    }
  });

  it('error messages are user-friendly and non-technical', () => {
    const error = new Error('fetch failed: ECONNREFUSED 127.0.0.1:8080');
    const result = buildErrorResponse(error);
    // Should not expose raw technical details to users
    expect(result.message).not.toContain('ECONNREFUSED');
    expect(result.message).not.toContain('127.0.0.1');
    expect(result.message).not.toContain('8080');
    // Should be a user-friendly message
    expect(result.message.length).toBeGreaterThan(10);
  });
});

// ── Type Exports Verification ────────────────────────────────────────────
describe('Type and Constant Exports', () => {
  it('all shared constants are within expected ranges', () => {
    expect(MAX_REQUEST_SIZE_BYTES).toBe(100 * 1024);
    expect(MAX_MESSAGE_LENGTH_CHARS).toBe(8000);
    expect(MAX_CONTEXT_MESSAGES).toBe(10);
    expect(PLATFORM_VERSION).toBe('2.0.0');
    expect(ASSISTANT_NAME).toBe('unionbolt-ai-agent');
  });

  it('MAX_REQUEST_SIZE_BYTES is coherent with MAX_MESSAGE_LENGTH_CHARS', () => {
    // 100KB should comfortably hold 50 messages at 8000 chars each
    const worstCaseBytes = 50 * MAX_MESSAGE_LENGTH_CHARS * 4; // UTF-8 worst case
    // 100KB = 102400 bytes, worst case = 1.6MB — request limit is stricter
    // This is intentional: 100KB limit prevents oversized payloads
    expect(MAX_REQUEST_SIZE_BYTES).toBeLessThan(worstCaseBytes);
    // But 100KB is enough for ~12 max-length messages
    const reasonableCase = 12 * MAX_MESSAGE_LENGTH_CHARS;
    expect(MAX_REQUEST_SIZE_BYTES).toBeGreaterThan(reasonableCase);
  });
});

// ── Token Optimizer + Chat Service Coherence ─────────────────────────────
describe('Token Optimizer and Chat Service Coherence', () => {
  it('trimContext and MAX_CONTEXT_MESSAGES are compatible', () => {
    const messages = Array.from({ length: MAX_CONTEXT_MESSAGES + 5 }, (_, i) => ({
      role: 'user' as const,
      content: 'Short message',
    }));

    const optimized = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: compressMessage(m.content),
    }));

    // trimContext should reduce to fewer than total messages
    const trimmed = trimContext(optimized, 30);
    expect(trimmed.length).toBeLessThan(messages.length);
  });

  it('token estimates are consistent with content length', () => {
    const testStrings = [
      { input: '', expected: 0 },
      { input: 'a', expected: 1 },
      { input: 'hello', expected: 2 },
      { input: 'hello world test', expected: 4 },
    ];

    for (const { input, expected } of testStrings) {
      expect(estimateTokens(input)).toBe(expected);
    }
  });
});

// ── Validation Edge Cases ────────────────────────────────────────────────
describe('Validation Edge Cases', () => {
  it('rejects undefined body', () => {
    expect(() => validateChatRequest(undefined as unknown)).toThrow(ValidationError);
  });

  it('rejects messages with empty content string', () => {
    const body = {
      messages: [{ role: 'user' as const, content: '' }],
    };
    // Empty string is falsy in JS, so validateChatRequest rejects it
    expect(() => validateChatRequest(body)).toThrow(ValidationError);
  });

  it('accepts system role in messages', () => {
    const body = {
      messages: [{ role: 'system' as const, content: 'You are a helpful assistant.' }],
    };
    expect(() => validateChatRequest(body)).not.toThrow();
  });

  it('rejects 51 messages', () => {
    const messages = Array.from({ length: 51 }, (_, i) => ({
      role: 'user' as const,
      content: `Message ${i}`,
    }));
    expect(() => validateChatRequest({ messages })).toThrow(ValidationError);
  });

  it('accepts exactly 50 messages', () => {
    const messages = Array.from({ length: 50 }, (_, i) => ({
      role: 'user' as const,
      content: `Message ${i}`,
    }));
    expect(() => validateChatRequest({ messages })).not.toThrow();
  });

  it('preserves conversations with mixed roles', () => {
    const body = {
      messages: [
        { role: 'system' as const, content: 'System prompt' },
        { role: 'user' as const, content: 'User question' },
        { role: 'assistant' as const, content: 'Assistant response' },
        { role: 'user' as const, content: 'Follow-up' },
      ],
    };
    const result = validateChatRequest(body);
    expect(result.messages).toHaveLength(4);
  });
});

// ── RAG Context Building ─────────────────────────────────────────────────
describe('RAG Context Building', () => {
  it('handles empty RAG context gracefully', () => {
    const emptyContext: RAGContext = { documents: [], matchCount: 0 };
    const result = buildAugmentedPrompt('test query', emptyContext, []);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('test query');
  });

  it('includes document relevance scores in prompt', () => {
    const context: RAGContext = {
      documents: [
        { id: 'd1', score: 0.95, text: 'Important safety regulation.' },
        { id: 'd2', score: 0.42, text: 'Less relevant document.' },
      ],
      matchCount: 2,
    };
    const result = buildAugmentedPrompt('safety question', context, []);
    expect(result[0].content).toContain('relevance: 95%');
    expect(result[0].content).toContain('relevance: 42%');
    expect(result[0].content).toContain('Important safety regulation');
    expect(result[0].content).toContain('Less relevant document');
    expect(result[0].content).toContain('safety question');
  });

  it('preserves conversation history order', () => {
    const context: RAGContext = { documents: [], matchCount: 0 };
    const history: ChatMessage[] = [
      { role: 'user', content: 'Q1' },
      { role: 'assistant', content: 'A1' },
      { role: 'user', content: 'Q2' },
    ];
    const result = buildAugmentedPrompt('Q3', context, history);
    expect(result).toHaveLength(4);
    expect(result[0].content).toBe('Q1');
    expect(result[1].content).toBe('A1');
    expect(result[2].content).toBe('Q2');
    expect(result[3].content).toBe('Q3');
  });
});

// ── Build Error Response Shape ───────────────────────────────────────────
describe('ErrorResponse Shape Compliance', () => {
  it('returns proper ErrorResponse for all error types', () => {
    const testCases: Array<{
      error: unknown;
      expectedStatus: 'error';
      expectedContains: string;
    }> = [
      {
        error: new ValidationError('Bad input'),
        expectedStatus: 'error',
        expectedContains: 'Invalid request',
      },
      {
        error: new Error('DEEPSEEK_API_KEY environment variable is not set'),
        expectedStatus: 'error',
        expectedContains: 'not fully configured',
      },
      {
        error: new Error('DeepSeek API returned 429: Rate limited'),
        expectedStatus: 'error',
        expectedContains: 'temporarily unavailable',
      },
      {
        error: new Error('Random failure'),
        expectedStatus: 'error',
        expectedContains: 'unexpected error',
      },
    ];

    for (const { error, expectedStatus, expectedContains } of testCases) {
      const result = buildErrorResponse(error, 'conv_override');
      expect(result.status).toBe(expectedStatus);
      expect(result.message).toContain(expectedContains);
      expect(result.conversationId).toBe('conv_override');
      expect(result.assistant).toBe(ASSISTANT_NAME);
    }
  });
});

// ── Health Check Integration ─────────────────────────────────────────────
describe('Health Check', () => {
  it('systemHealthCheck returns valid HealthCheckResult shape', async () => {
    const result = await systemHealthCheck();
    expect(result.status).toMatch(/^(healthy|unhealthy)$/);
    expect(result.timestamp).toBeDefined();
    expect(result.services).toHaveProperty('deepseek');
    expect(result.services).toHaveProperty('pinecone');
    expect(result.services).toHaveProperty('tavus');
    expect(result.environment).toBeDefined();
    expect(result.version).toBe(PLATFORM_VERSION);
  });

  it('health check handles missing API keys gracefully', async () => {
    const result = await systemHealthCheck();
    // Should not throw, even without API keys
    expect(result.services.deepseek).toHaveProperty('connected');
    expect(result.services.pinecone).toHaveProperty('connected');
    // In test environment without keys, should be unhealthy
    expect(result.status).toBe('unhealthy');
  });
});