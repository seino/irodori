/**
 * Text wrapping logic
 */
import { charWidth } from './measure.js';
import { stripAnsi } from '../ansi/strip.js';

/**
 * Wraps text at the specified width (for plain text without ANSI)
 * @param text String to wrap (assumed to be stripped of ANSI escapes)
 * @param maxWidth Maximum width
 */
export function wrapText(text: string, maxWidth: number): string[] {
  if (maxWidth <= 0) return [text];

  const lines: string[] = [];

  for (const rawLine of text.split('\n')) {
    const stripped = stripAnsi(rawLine);
    if (stripped === '') {
      lines.push('');
      continue;
    }

    let currentLine = '';
    let currentWidth = 0;

    for (const char of stripped) {
      const code = char.codePointAt(0);
      const w = code !== undefined ? charWidth(code) : 1;

      if (currentWidth + w > maxWidth) {
        lines.push(currentLine);
        currentLine = char;
        currentWidth = w;
      } else {
        currentLine += char;
        currentWidth += w;
      }
    }

    if (currentLine !== '') {
      lines.push(currentLine);
    }
  }

  return lines;
}

/**
 * Truncates text to the specified width
 * @param text String to truncate
 * @param maxWidth Maximum width
 * @param suffix String to append when truncated
 */
export function truncateText(text: string, maxWidth: number, suffix = '...'): string {
  const stripped = stripAnsi(text);
  let width = 0;
  let result = '';

  const suffixWidth = [...suffix].reduce((sum, c) => {
    const code = c.codePointAt(0);
    return sum + (code !== undefined ? charWidth(code) : 1);
  }, 0);

  for (const char of stripped) {
    const code = char.codePointAt(0);
    const w = code !== undefined ? charWidth(code) : 1;

    if (width + w > maxWidth - suffixWidth) {
      return result + suffix;
    }
    result += char;
    width += w;
  }

  return result;
}
