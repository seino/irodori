/**
 * Style merge and parse logic
 */
import type { Style, Color } from '../types.js';
import { isStandardColor } from '../ansi/colors.js';

/**
 * Merges a style stack into a single Style
 * @param stack Style stack (bottom is oldest)
 */
export function mergeStyles(stack: Style[]): Style {
  const result: Style = {};
  for (const s of stack) {
    if (s.bold !== undefined) result.bold = s.bold;
    if (s.dim !== undefined) result.dim = s.dim;
    if (s.italic !== undefined) result.italic = s.italic;
    if (s.underline !== undefined) result.underline = s.underline;
    if (s.strikethrough !== undefined) result.strikethrough = s.strikethrough;
    if (s.reverse !== undefined) result.reverse = s.reverse;
    if (s.blink !== undefined) result.blink = s.blink;
    if (s.color !== undefined) result.color = s.color;
    if (s.bgColor !== undefined) result.bgColor = s.bgColor;
    if (s.link !== undefined) result.link = s.link;
  }
  return result;
}

/** Decoration keywords */
const DECORATIONS = new Set([
  'bold',
  'dim',
  'italic',
  'underline',
  'strikethrough',
  'strike',
  'reverse',
  'blink',
]);

/**
 * Converts an array of tag strings to a Style
 * @param tags Tag strings (e.g. ['bold', 'red'], ['on', 'blue'], ['#ff0000'])
 */
export function parseStyleTags(tags: string[]): Style | null {
  const style: Style = {};
  let hasAnyStyle = false;
  let expectBg = false;
  let expectLink = false;

  for (const tag of tags) {
    if (expectLink) {
      style.link = tag;
      hasAnyStyle = true;
      expectLink = false;
      continue;
    }

    if (tag === 'on') {
      expectBg = true;
      continue;
    }

    if (tag.startsWith('link=')) {
      style.link = tag.slice(5);
      hasAnyStyle = true;
      continue;
    }

    if (DECORATIONS.has(tag)) {
      const key = tag === 'strike' ? 'strikethrough' : tag;
      style[key as keyof Pick<Style, 'bold' | 'dim' | 'italic' | 'underline' | 'strikethrough' | 'reverse' | 'blink'>] =
        true;
      hasAnyStyle = true;
      continue;
    }

    const color = parseColor(tag);
    if (color !== null) {
      if (expectBg) {
        style.bgColor = color;
        expectBg = false;
      } else {
        style.color = color;
      }
      hasAnyStyle = true;
      continue;
    }

    // Unrecognized tag -> return null to treat as text
    return null;
  }

  if (!hasAnyStyle) return null;
  return style;
}

/**
 * Converts a string to a Color
 */
function parseColor(value: string): Color | null {
  if (isStandardColor(value)) return value;
  if (value.startsWith('#') && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) return value as Color;

  const rgbMatch = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/.exec(value);
  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    if (r <= 255 && g <= 255 && b <= 255) {
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      return hex as Color;
    }
  }

  return null;
}
