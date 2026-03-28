/**
 * Diff rendering -- cursor rewind and diff update for Live
 */
import { cursorUp, cursorToColumn, eraseLine } from '../output/cursor.js';

/**
 * Diff renderer
 * Computes a diff against the previous output and rewrites only changed lines
 */
export class DiffRenderer {
  private lastLines: string[] = [];

  /**
   * Writes a new array of lines
   * Only rewrites lines that differ from the previous output
   * @param newLines New output lines
   * @param stream Target output stream
   */
  write(newLines: string[], stream: NodeJS.WriteStream): void {
    // Rewind cursor to the start of the previous frame
    if (this.lastLines.length > 0) {
      stream.write(cursorUp(this.lastLines.length));
      stream.write(cursorToColumn(1));
    }

    const maxLines = Math.max(this.lastLines.length, newLines.length);

    for (let i = 0; i < maxLines; i++) {
      const oldLine = this.lastLines[i];
      const newLine = newLines[i];

      if (newLine !== undefined) {
        if (oldLine !== newLine) {
          stream.write(eraseLine());
          stream.write(newLine + '\n');
        } else {
          // No change, move down one line
          stream.write('\n');
        }
      } else {
        // Clear extra lines when the previous frame was longer
        stream.write(eraseLine());
        stream.write('\n');
      }
    }

    // After clearing extra lines, move cursor back to end of new content
    const extraLines = maxLines - newLines.length;
    if (extraLines > 0) {
      stream.write(cursorUp(extraLines));
    }

    this.lastLines = [...newLines];
  }

  /** Resets the render state */
  reset(): void {
    this.lastLines = [];
  }

  /** Returns the previous output line count */
  get lineCount(): number {
    return this.lastLines.length;
  }
}
