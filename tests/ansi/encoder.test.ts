import { describe, it, expect } from 'vitest';
import { encodeSpan, encodeSpans } from '../../src/ansi/encoder.js';
import { ColorLevel } from '../../src/types.js';
import type { Span } from '../../src/types.js';

describe('encodeSpan', () => {
  it('does not apply styles with ColorLevel.None', () => {
    const span: Span = { text: 'hello', style: { bold: true, color: 'red' } };
    expect(encodeSpan(span, ColorLevel.None)).toBe('hello');
  });

  it('returns empty string for empty text', () => {
    const span: Span = { text: '', style: { bold: true } };
    expect(encodeSpan(span, ColorLevel.TrueColor)).toBe('');
  });

  it('returns plain text when no styles are set', () => {
    const span: Span = { text: 'hello', style: {} };
    expect(encodeSpan(span, ColorLevel.TrueColor)).toBe('hello');
  });

  it('encodes bold as ANSI', () => {
    const span: Span = { text: 'hello', style: { bold: true } };
    const result = encodeSpan(span, ColorLevel.Basic);
    expect(result).toBe('\x1b[1mhello\x1b[0m');
  });

  it('encodes italic as ANSI', () => {
    const span: Span = { text: 'hello', style: { italic: true } };
    const result = encodeSpan(span, ColorLevel.Basic);
    expect(result).toBe('\x1b[3mhello\x1b[0m');
  });

  it('encodes standard color at Basic level', () => {
    const span: Span = { text: 'hello', style: { color: 'red' } };
    const result = encodeSpan(span, ColorLevel.Basic);
    expect(result).toBe('\x1b[31mhello\x1b[0m');
  });

  it('encodes standard color at TrueColor level', () => {
    const span: Span = { text: 'hello', style: { color: 'red' } };
    const result = encodeSpan(span, ColorLevel.TrueColor);
    expect(result).toContain('\x1b[38;2;');
    expect(result).toContain('hello');
  });

  it('encodes hex color at TrueColor level', () => {
    const span: Span = { text: 'hello', style: { color: '#ff0000' } };
    const result = encodeSpan(span, ColorLevel.TrueColor);
    expect(result).toBe('\x1b[38;2;255;0;0mhello\x1b[0m');
  });

  it('encodes background color', () => {
    const span: Span = { text: 'hello', style: { bgColor: 'blue' } };
    const result = encodeSpan(span, ColorLevel.Basic);
    expect(result).toBe('\x1b[44mhello\x1b[0m');
  });

  it('encodes combined styles', () => {
    const span: Span = { text: 'hello', style: { bold: true, italic: true, color: 'red' } };
    const result = encodeSpan(span, ColorLevel.Basic);
    expect(result).toContain('1;');
    expect(result).toContain('3;');
    expect(result).toContain('hello');
  });

  it('encodes link', () => {
    const span: Span = { text: 'click', style: { link: 'https://example.com' } };
    const result = encodeSpan(span, ColorLevel.Basic);
    expect(result).toContain('\x1b]8;;https://example.com\x1b\\');
    expect(result).toContain('click');
    expect(result).toContain('\x1b]8;;\x1b\\');
  });
});

describe('encodeSpans', () => {
  it('concatenates and encodes multiple Spans', () => {
    const spans: Span[] = [
      { text: 'hello', style: { bold: true } },
      { text: ' ', style: {} },
      { text: 'world', style: { color: 'green' } },
    ];
    const result = encodeSpans(spans, ColorLevel.Basic);
    expect(result).toContain('hello');
    expect(result).toContain(' ');
    expect(result).toContain('world');
  });

  it('returns all plain text with ColorLevel.None', () => {
    const spans: Span[] = [
      { text: 'hello', style: { bold: true } },
      { text: ' world', style: { color: 'red' } },
    ];
    expect(encodeSpans(spans, ColorLevel.None)).toBe('hello world');
  });
});
