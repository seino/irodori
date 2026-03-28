/**
 * Utility for stripping ANSI escape sequences
 */

const ANSI_REGEX = /\x1b\[[0-9;]*m|\x1b\]8;;[^\x1b]*\x1b\\/g;

/**
 * Strips ANSI escape sequences from a string
 * @param text String that may contain ANSI escapes
 */
export function stripAnsi(text: string): string {
  return text.replace(ANSI_REGEX, '');
}
