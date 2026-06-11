// Tests for token-optimizer.ts — token estimation, context trimming
// Ensures removed functions (getFallbackResponse, formatUnionQuery) are truly gone.

import {
  estimateTokens,
  compressMessage,
  trimContext,
} from '@/lib/token-optimizer';

// ── estimateTokens ──────────────────────────────────────────────────────
describe('estimateTokens', () => {
  it('returns 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0);
  });

  it('estimates ~1 token per 4 characters', () => {
    expect(estimateTokens('abcd')).toBe(1);
    expect(estimateTokens('abcdefgh')).toBe(2);
    expect(estimateTokens('hello world, this is a test')).toBe(7); // 'hello world, this is a test' = 28 chars, 28/4=7
  });

  it('rounds up for partial tokens', () => {
    expect(estimateTokens('abc')).toBe(1); // 3/4=0.75 → ceil=1
    expect(estimateTokens('abcde')).toBe(2); // 5/4=1.25 → ceil=2
  });
});

// ── compressMessage ─────────────────────────────────────────────────────
describe('compressMessage', () => {
  it('collapses whitespace', () => {
    const result = compressMessage('hello    world\n\ttest');
    expect(result).toBe('hello world test');
  });

  it('trims leading/trailing whitespace', () => {
    expect(compressMessage('  hello  ')).toBe('hello');
  });

  it('does not lose meaningful content', () => {
    const original = 'Please help me understand the grievance procedure. Thank you.';
    // The old version stripped "please" and "thank you" — new version keeps them
    const result = compressMessage(original);
    expect(result).toContain('help');
    expect(result).toContain('grievance');
  });
});

// ── trimContext ─────────────────────────────────────────────────────────
describe('trimContext', () => {
  it('returns empty array for empty input', () => {
    expect(trimContext([])).toEqual([]);
  });

  it('returns all messages when under token limit', () => {
    const messages = [
      { role: 'user' as const, content: 'Short' },
      { role: 'assistant' as const, content: 'Reply' },
    ];
    expect(trimContext(messages, 100)).toHaveLength(2);
  });

  it('trims oldest messages when over token limit', () => {
    const messages = Array.from({ length: 20 }, (_, i) => ({
      role: 'user' as const,
      content: `Message number ${i} with some extra text for tokens`,
    }));
    const result = trimContext(messages, 50);
    expect(result.length).toBeLessThan(20);
    // Most recent messages should be preserved
    expect(result[result.length - 1].content).toContain('19');
  });

  it('prioritizes most recent messages', () => {
    const messages = [
      { role: 'user' as const, content: 'Old' },
      { role: 'user' as const, content: 'Recent' },
    ];
    const result = trimContext(messages, 2); // 'Recent' = 6 chars, ceil(6/4)=2 tokens → fits; 'Old'+'Recent' = 3 tokens → doesn't fit
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('Recent');
  });
});

// ── Ensure removed functions are not exported ───────────────────────────
describe('removed functions', () => {
  it('getFallbackResponse is not exported', async () => {
    const mod = await import('@/lib/token-optimizer');
    expect((mod as Record<string, unknown>).getFallbackResponse).toBeUndefined();
  });

  it('formatUnionQuery is not exported', async () => {
    const mod = await import('@/lib/token-optimizer');
    expect((mod as Record<string, unknown>).formatUnionQuery).toBeUndefined();
  });
});
