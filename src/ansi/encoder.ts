/**
 * Converts Span[] to ANSI-escaped strings
 */
import type { Span } from '../types.js';
import { ColorLevel } from '../types.js';
import { colorToAnsiCodes } from './colors.js';

/**
 * Converts a single Span to an ANSI-escaped string
 * @param span Styled text fragment
 * @param level Color level
 */
export function encodeSpan(span: Span, level: ColorLevel): string {
  if (level === ColorLevel.None) return span.text;
  if (span.text === '') return '';

  const codes: number[] = [];
  const style = span.style;

  if (style.bold) codes.push(1);
  if (style.dim) codes.push(2);
  if (style.italic) codes.push(3);
  if (style.underline) codes.push(4);
  if (style.blink) codes.push(5);
  if (style.reverse) codes.push(7);
  if (style.strikethrough) codes.push(9);
  if (style.color) codes.push(...colorToAnsiCodes(style.color, level, false));
  if (style.bgColor) codes.push(...colorToAnsiCodes(style.bgColor, level, true));

  if (codes.length === 0 && !style.link) return span.text;

  let result = '';

  if (style.link) {
    result += `\x1b]8;;${style.link}\x1b\\`;
  }

  if (codes.length > 0) {
    result += `\x1b[${codes.join(';')}m${span.text}\x1b[0m`;
  } else {
    result += span.text;
  }

  if (style.link) {
    result += `\x1b]8;;\x1b\\`;
  }

  return result;
}

/**
 * Converts an array of Spans to an ANSI-escaped string
 * @param spans Array of styled text fragments
 * @param level Color level
 */
export function encodeSpans(spans: Span[], level: ColorLevel): string {
  return spans.map((span) => encodeSpan(span, level)).join('');
}
