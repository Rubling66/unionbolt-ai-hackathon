// Tests for chat-service.ts — validation, RAG pipeline, error handling

import {
  validateChatRequest,
  ValidationError,
  buildAugmentedPrompt,
  buildErrorResponse,
  retrieveContext,
} from '@/lib/chat-service';
import type { ChatMessage, RAGContext } from '@/lib/types';

// ── validateChatRequest ─────────────────────────────────────────────────
describe('validateChatRequest', () => {
  it('accepts a valid request', () => {
    const body = {
      messages: [{ role: 'user', content: 'Hello' }],
    };
    const result = validateChatRequest(body);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content).toBe('Hello');
  });

  it('accepts request with conversationId', () => {
    const body = {
      messages: [{ role: 'user', content: 'Hello' }],
      conversationId: 'conv_123',
    };
    const result = validateChatRequest(body);
    expect(result.conversationId).toBe('conv_123');
  });

  it('rejects null body', () => {
    expect(() => validateChatRequest(null)).toThrow(ValidationError);
  });

  it('rejects non-object body', () => {
    expect(() => validateChatRequest('string')).toThrow(ValidationError);
    expect(() => validateChatRequest(42)).toThrow(ValidationError);
  });

  it('rejects empty messages array', () => {
    expect(() => validateChatRequest({ messages: [] })).toThrow(ValidationError);
  });

  it('rejects missing messages field', () => {
    expect(() => validateChatRequest({})).toThrow(ValidationError);
  });

  it('rejects too many messages (>50)', () => {
    const messages = Array.from({ length: 51 }, (_, i) => ({
      role: 'user' as const,
      content: `Message ${i}`,
    }));
    expect(() => validateChatRequest({ messages })).toThrow(ValidationError);
  });

  it('rejects message with missing role', () => {
    const body = {
      messages: [{ content: 'Hello' }],
    };
    expect(() => validateChatRequest(body)).toThrow(ValidationError);
  });

  it('rejects message with missing content', () => {
    const body = {
      messages: [{ role: 'user' }],
    };
    expect(() => validateChatRequest(body)).toThrow(ValidationError);
  });

  it('rejects message with non-string content', () => {
    const body = {
      messages: [{ role: 'user', content: 123 }],
    };
    expect(() => validateChatRequest(body)).toThrow(ValidationError);
  });

  it('rejects invalid role', () => {
    const body = {
      messages: [{ role: 'admin', content: 'Hello' }],
    };
    expect(() => validateChatRequest(body)).toThrow(ValidationError);
  });

  it('rejects messages exceeding character limit', () => {
    const longContent = 'a'.repeat(8001);
    const body = {
      messages: [{ role: 'user', content: longContent }],
    };
    expect(() => validateChatRequest(body)).toThrow(ValidationError);
    expect(() => validateChatRequest(body)).toThrow(/character limit/);
  });

  it('accepts message at character limit boundary', () => {
    const maxContent = 'a'.repeat(8000);
    const body = {
      messages: [{ role: 'user', content: maxContent }],
    };
    const result = validateChatRequest(body);
    expect(result.messages[0].content.length).toBe(8000);
  });
});

// ── buildAugmentedPrompt ────────────────────────────────────────────────
describe('buildAugmentedPrompt', () => {
  it('builds prompt without RAG context', () => {
    const ragContext: RAGContext = { documents: [], matchCount: 0 };
    const history: ChatMessage[] = [];
    const result = buildAugmentedPrompt('How do I file a grievance?', ragContext, history);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('How do I file a grievance?');
  });

  it('builds prompt with RAG documents', () => {
    const ragContext: RAGContext = {
      documents: [
        { id: 'doc1', score: 0.95, text: 'Grievance procedure step 1: Contact steward.' },
      ],
      matchCount: 1,
    };
    const history: ChatMessage[] = [];
    const result = buildAugmentedPrompt('How do I file a grievance?', ragContext, history);
    expect(result).toHaveLength(1);
    expect(result[0].content).toContain('Grievance procedure step 1');
    expect(result[0].content).toContain('How do I file a grievance?');
    expect(result[0].content).toContain('relevance: 95%');
  });

  it('includes conversation history', () => {
    const ragContext: RAGContext = { documents: [], matchCount: 0 };
    const history: ChatMessage[] = [
      { role: 'user', content: 'Previous question' },
      { role: 'assistant', content: 'Previous answer' },
    ];
    const result = buildAugmentedPrompt('New question', ragContext, history);
    expect(result).toHaveLength(3);
    expect(result[0].content).toBe('Previous question');
    expect(result[1].content).toBe('Previous answer');
    expect(result[2].content).toBe('New question');
  });

  it('filters out system messages from history', () => {
    const ragContext: RAGContext = { documents: [], matchCount: 0 };
    const history: ChatMessage[] = [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Hello' },
    ];
    const result = buildAugmentedPrompt('Hi', ragContext, history);
    expect(result).toHaveLength(2);
    expect(result[0].content).toBe('Hello');
  });
});

// ── buildErrorResponse ──────────────────────────────────────────────────
describe('buildErrorResponse', () => {
  it('returns user-friendly message for ValidationError', () => {
    const error = new ValidationError('Missing field');
    const result = buildErrorResponse(error);
    expect(result.status).toBe('error');
    expect(result.message).toContain('Invalid request');
    expect(result.message).toContain('Missing field');
    expect(result.assistant).toBe('unionbolt-ai-agent');
    expect(result.timestamp).toBeDefined();
  });

  it('returns API key error message', () => {
    const error = new Error('DEEPSEEK_API_KEY environment variable is not set');
    const result = buildErrorResponse(error);
    expect(result.message).toContain('not fully configured');
    // Should NOT contain hardcoded template text
    expect(result.message).not.toContain('I can provide basic safety information');
    expect(result.message).not.toContain("I'm temporarily offline");
  });

  it('returns service unavailable for DeepSeek errors', () => {
    const error = new Error('DeepSeek API returned 503: Service Unavailable');
    const result = buildErrorResponse(error);
    expect(result.message).toContain('temporarily unavailable');
  });

  it('returns generic error for unknown errors', () => {
    const error = new Error('Something went wrong');
    const result = buildErrorResponse(error);
    expect(result.message).toContain('unexpected error');
  });

  it('handles non-Error objects', () => {
    const result = buildErrorResponse('string error');
    expect(result.message).toContain('unexpected error');
  });

  it('generates conversationId when not provided', () => {
    const error = new Error('test');
    const result = buildErrorResponse(error);
    expect(result.conversationId).toMatch(/^conv_\d+_[a-z0-9]+$/);
  });

  it('uses provided conversationId', () => {
    const error = new Error('test');
    const result = buildErrorResponse(error, 'conv_existing');
    expect(result.conversationId).toBe('conv_existing');
  });
});

// ── retrieveContext (unit — mocked Pinecone) ────────────────────────────
describe('retrieveContext', () => {
  it('returns empty context when Pinecone is unreachable', async () => {
    // Without Pinecone credentials, this should return empty context gracefully
    const result = await retrieveContext('test query');
    expect(result.documents).toEqual([]);
    expect(result.matchCount).toBe(0);
  });
});
