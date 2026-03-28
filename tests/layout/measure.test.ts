import { describe, it, expect } from 'vitest';
import { charWidth, stringWidth } from '../../src/layout/measure.js';

describe('charWidth', () => {
  it('ASCII characters have width 1', () => {
    expect(charWidth('a'.codePointAt(0)!)).toBe(1);
    expect(charWidth('Z'.codePointAt(0)!)).toBe(1);
    expect(charWidth('0'.codePointAt(0)!)).toBe(1);
  });

  it('full-width characters have width 2', () => {
    expect(charWidth('\u4F60'.codePointAt(0)!)).toBe(2);
    expect(charWidth('\u6F22'.codePointAt(0)!)).toBe(2);
    expect(charWidth('\uFF21'.codePointAt(0)!)).toBe(2);
  });

  it('full-width symbols have width 2', () => {
    expect(charWidth('\uFF01'.codePointAt(0)!)).toBe(2);
    expect(charWidth('\uFF1F'.codePointAt(0)!)).toBe(2);
  });

  it('control characters have width 0', () => {
    expect(charWidth(0)).toBe(0);
    expect(charWidth(0x1b)).toBe(0);
  });
});

describe('stringWidth', () => {
  it('calculates width of ASCII strings', () => {
    expect(stringWidth('hello')).toBe(5);
    expect(stringWidth('')).toBe(0);
  });

  it('calculates width of full-width strings', () => {
    expect(stringWidth('\u4F60\u597D\u5417')).toBe(6);
    expect(stringWidth('\u4E16\u754C\u597D')).toBe(6);
  });

  it('calculates width of mixed-width strings', () => {
    expect(stringWidth('hello\u4E16\u754C')).toBe(9);
  });

  it('calculates width after stripping ANSI escapes', () => {
    expect(stringWidth('\x1b[1mhello\x1b[0m')).toBe(5);
    expect(stringWidth('\x1b[31m\u7D05\x1b[0m')).toBe(2);
  });
});
