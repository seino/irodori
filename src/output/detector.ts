/**
 * TTY / ColorLevel / terminal width auto-detection
 */
import { ColorLevel } from '../types.js';

/**
 * Auto-detects the color level for a stream
 * @param stream Target output stream
 */
export function detectColorLevel(stream: NodeJS.WriteStream): ColorLevel {
  if (process.env['FORCE_COLOR'] === '0') return ColorLevel.None;
  if (process.env['FORCE_COLOR']) return ColorLevel.TrueColor;

  if (!stream.isTTY) return ColorLevel.None;

  if (process.env['CI']) return ColorLevel.Basic;
  if (process.env['GITHUB_ACTIONS']) return ColorLevel.Basic;
  if (process.env['TERM'] === 'dumb') return ColorLevel.None;

  const colorterm = process.env['COLORTERM']?.toLowerCase();
  if (colorterm === 'truecolor' || colorterm === '24bit') return ColorLevel.TrueColor;

  const term = process.env['TERM'] ?? '';
  if (term.includes('256color')) return ColorLevel.Color256;

  return ColorLevel.Basic;
}

/**
 * Gets the terminal width
 * @param stream Target output stream
 * @param fallback Fallback width when not a TTY
 */
export function detectWidth(stream: NodeJS.WriteStream, fallback = 80): number {
  return stream.columns ?? fallback;
}
