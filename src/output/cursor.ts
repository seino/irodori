/**
 * ANSI cursor control escape sequences
 */

const ESC = '\x1b[';

/** Moves the cursor up n lines */
export function cursorUp(n = 1): string {
  return `${ESC}${n}A`;
}

/** Moves the cursor down n lines */
export function cursorDown(n = 1): string {
  return `${ESC}${n}B`;
}

/** Moves the cursor to a column position (1-based) */
export function cursorToColumn(col = 1): string {
  return `${ESC}${col}G`;
}

/** Saves the cursor position */
export function cursorSave(): string {
  return `${ESC}s`;
}

/** Restores the cursor position */
export function cursorRestore(): string {
  return `${ESC}u`;
}

/** Hides the cursor */
export function cursorHide(): string {
  return `${ESC}?25l`;
}

/** Shows the cursor */
export function cursorShow(): string {
  return `${ESC}?25h`;
}

/** Erases the current line */
export function eraseLine(): string {
  return `${ESC}2K`;
}

/** Erases from cursor to end of line */
export function eraseToEnd(): string {
  return `${ESC}0K`;
}

/** Clears the screen */
export function clearScreen(): string {
  return `${ESC}2J${ESC}H`;
}
