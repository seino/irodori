import { describe, it, expect } from 'vitest';
import { wrapText, truncateText } from '../../src/layout/wrap.js';

describe('wrapText', () => {
  it('wraps at specified width', () => {
    expect(wrapText('abcdef', 3)).toEqual(['abc', 'def']);
  });

  it('returns single line for string within width', () => {
    expect(wrapText('hello', 10)).toEqual(['hello']);
  });

  it('returns as-is when maxWidth is 0 or less', () => {
    expect(wrapText('hello', 0)).toEqual(['hello']);
    expect(wrapText('hello', -1)).toEqual(['hello']);
  });

  it('correctly splits on existing newlines', () => {
    expect(wrapText('ab\ncd', 10)).toEqual(['ab', 'cd']);
  });

  it('preserves empty lines', () => {
    expect(wrapText('ab\n\ncd', 10)).toEqual(['ab', '', 'cd']);
  });

  it('wraps full-width strings based on width', () => {
    expect(wrapText('\u4F60\u597D\u5417', 4)).toEqual(['\u4F60\u597D', '\u5417']);
  });

  it('correctly wraps mixed strings (ASCII + full-width)', () => {
    expect(wrapText('a\u4F60b', 3)).toEqual(['a\u4F60', 'b']);
  });

  it('returns a single empty line for empty string', () => {
    expect(wrapText('', 10)).toEqual(['']);
  });
});

describe('truncateText', () => {
  it('returns string as-is when within maxWidth', () => {
    expect(truncateText('hello', 10)).toBe('hello');
  });

  it('truncates with ... when exceeding width', () => {
    const result = truncateText('hello world', 8);
    expect(result).toBe('hello...');
  });

  it('supports custom suffix', () => {
    const result = truncateText('hello world', 8, '…');
    expect(result).toBe('hello w…');
  });

  it('truncates full-width characters based on width', () => {
    const result = truncateText('\u4F60\u597D\u4E16\u754C\u5417', 7);
    expect(result).toBe('\u4F60\u597D...');
  });

  it('returns empty string for empty input', () => {
    expect(truncateText('', 10)).toBe('');
  });

  it('handles empty suffix', () => {
    const result = truncateText('hello world', 5, '');
    expect(result).toBe('hello');
  });
});
