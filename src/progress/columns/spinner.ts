/**
 * SpinnerColumn — Animated spinner column for progress display.
 * Shows an animated spinner while in progress, and a configurable text on completion.
 */
import type { Task } from '../task.js';
import { isTaskFinished } from '../task.js';
import { spinners, DEFAULT_SPINNER } from '../spinners.js';

/**
 * Renders an animated spinner for in-progress tasks.
 * Displays `finishedText` (default: "✔") when the task is complete.
 */
export class SpinnerColumn {
  private readonly spinnerName: string;
  private readonly finishedText: string;

  constructor(spinnerName?: string, finishedText?: string) {
    this.spinnerName = spinnerName ?? DEFAULT_SPINNER;
    this.finishedText = finishedText ?? '✔';
  }

  render(task: Task): string {
    if (isTaskFinished(task)) return this.finishedText;

    const spinner = spinners[this.spinnerName];
    if (!spinner) return '?';

    const frameIdx = Math.floor(Date.now() / spinner.interval) % spinner.frames.length;
    return spinner.frames[frameIdx] ?? '?';
  }
}
