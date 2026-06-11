// Tests for types.ts — constant values and type exports

import {
  PLATFORM_VERSION,
  ASSISTANT_NAME,
  DEEPSEEK_BASE_URL,
  DEFAULT_MODEL,
  MAX_CONTEXT_MESSAGES,
  MAX_REQUEST_SIZE_BYTES,
  MAX_MESSAGE_LENGTH_CHARS,
} from '@/lib/types';

describe('Platform Constants', () => {
  it('PLATFORM_VERSION is semver', () => {
    expect(PLATFORM_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('ASSISTANT_NAME is set', () => {
    expect(ASSISTANT_NAME).toBe('unionbolt-ai-agent');
  });

  it('DEEPSEEK_BASE_URL is correct', () => {
    expect(DEEPSEEK_BASE_URL).toBe('https://api.deepseek.com/v1');
  });

  it('DEFAULT_MODEL is set', () => {
    expect(DEFAULT_MODEL).toBeTruthy();
  });

  it('MAX_CONTEXT_MESSAGES is reasonable', () => {
    expect(MAX_CONTEXT_MESSAGES).toBeGreaterThan(0);
    expect(MAX_CONTEXT_MESSAGES).toBeLessThanOrEqual(50);
  });

  it('MAX_REQUEST_SIZE_BYTES is 100KB', () => {
    expect(MAX_REQUEST_SIZE_BYTES).toBe(100 * 1024);
  });

  it('MAX_MESSAGE_LENGTH_CHARS is 8000', () => {
    expect(MAX_MESSAGE_LENGTH_CHARS).toBe(8000);
  });
});
