/**
 * BarColumn — Progress bar visualization column.
 * Renders a filled/empty bar for determinate tasks, or a pulse animation for indeterminate tasks.
 */
import type { Task } from '../task.js';
import { getTaskProgress } from '../task.js';

const FILLED_CHAR = '━';
const EMPTY_CHAR = '╺';
const PULSE_CHARS = ['╸', '━', '━', '╺'];
/** Pulse animation cycle duration in milliseconds */
const PULSE_CYCLE_MS = 2000;

/**
 * Renders a progress bar for a task.
 * Shows a filled/empty bar when total is known, or a pulse animation when indeterminate.
 */
export class BarColumn {
  readonly maxWidth: number;

  constructor(maxWidth = 40) {
    this.maxWidth = maxWidth;
  }

  render(task: Task): string {
    const progress = getTaskProgress(task);
    const width = this.maxWidth;

    if (progress === null) {
      // Indeterminate: pulse animation sweeps across the bar
      const elapsed = Date.now() % PULSE_CYCLE_MS;
      const pos = Math.floor((elapsed / PULSE_CYCLE_MS) * width);
      const chars: string[] = [];
      for (let i = 0; i < width; i++) {
        const dist = Math.abs(i - pos);
        if (dist === 0) chars.push(PULSE_CHARS[1]!);
        else if (dist === 1) chars.push(PULSE_CHARS[0]!);
        else chars.push(' ');
      }
      return chars.join('');
    }

    const filled = Math.round(progress * width);
    const empty = width - filled;
    return FILLED_CHAR.repeat(filled) + EMPTY_CHAR.repeat(empty);
  }
}
