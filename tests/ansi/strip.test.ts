import { describe, it, expect } from 'vitest';
import { stripAnsi } from '../../src/ansi/strip.js';

describe('stripAnsi', () => {
  it('returns plain text as-is', () => {
    expect(stripAnsi('hello world')).toBe('hello world');
  });

  it('returns empty string for empty input', () => {
    expect(stripAnsi('')).toBe('');
  });

  it('strips SGR sequences', () => {
    expect(stripAnsi('\x1b[1mhello\x1b[0m')).toBe('hello');
  });

  it('strips all multiple SGR sequences', () => {
    expect(stripAnsi('\x1b[1m\x1b[31mtext\x1b[0m')).toBe('text');
  });

  it('strips OSC8 hyperlink sequences', () => {
    expect(stripAnsi('\x1b]8;;https://example.com\x1b\\click\x1b]8;;\x1b\\')).toBe('click');
  });

  it('returns CJK text as-is', () => {
    expect(stripAnsi('\u4F60\u597D')).toBe('\u4F60\u597D');
  });

  it('strips ANSI from CJK text', () => {
    expect(stripAnsi('\x1b[31m\u7D05\x1b[0m')).toBe('\u7D05');
  });

  it('correctly strips mixed SGR and OSC8 sequences', () => {
    const input = '\x1b[1mbold\x1b[0m \x1b]8;;https://example.com\x1b\\link\x1b]8;;\x1b\\';
    expect(stripAnsi(input)).toBe('bold link');
  });
});
