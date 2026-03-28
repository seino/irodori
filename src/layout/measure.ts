/**
 * Display width calculation (full-width character and emoji support)
 */
import { stripAnsi } from '../ansi/strip.js';

/**
 * Returns the terminal display width of a character (0, 1, or 2)
 * Full-width detection based on East Asian Width
 */
export function charWidth(code: number): number {
  if (code === 0) return 0;
  // Control characters
  if (code < 32 || (code >= 0x7f && code < 0xa0)) return 0;

  // Full-width character ranges
  if (
    (code >= 0x1100 && code <= 0x115f) || // Hangul Jamo
    code === 0x2329 ||
    code === 0x232a ||
    (code >= 0x2e80 && code <= 0x303e) || // CJK Radicals
    (code >= 0x3040 && code <= 0x33bf) || // Hiragana, Katakana, etc.
    (code >= 0x3400 && code <= 0x4dbf) || // CJK Unified Ideographs Extension A
    (code >= 0x4e00 && code <= 0xa4cf) || // CJK Unified Ideographs
    (code >= 0xa960 && code <= 0xa97c) || // Hangul Jamo Extended-B
    (code >= 0xac00 && code <= 0xd7a3) || // Hangul Syllables
    (code >= 0xf900 && code <= 0xfaff) || // CJK Compatibility Ideographs
    (code >= 0xfe10 && code <= 0xfe6b) || // CJK Compatibility Forms
    (code >= 0xff01 && code <= 0xff60) || // Fullwidth Forms
    (code >= 0xffe0 && code <= 0xffe6) || // Fullwidth Signs
    (code >= 0x1f000 && code <= 0x1fbff) || // Emoji and other symbols
    (code >= 0x20000 && code <= 0x2fffd) || // CJK Unified Ideographs Extension B+
    (code >= 0x30000 && code <= 0x3fffd)
  ) {
    return 2;
  }

  return 1;
}

/**
 * Calculates the terminal display width of a string
 * ANSI escapes are stripped before calculation
 * @param text String to measure
 */
export function stringWidth(text: string): number {
  const stripped = stripAnsi(text);
  let width = 0;
  for (const char of stripped) {
    const code = char.codePointAt(0);
    if (code !== undefined) {
      width += charWidth(code);
    }
  }
  return width;
}
