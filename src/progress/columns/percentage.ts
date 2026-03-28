/**
 * PercentageColumn — Displays task progress as a percentage.
 */
import type { Task } from '../task.js';
import { getTaskProgress } from '../task.js';

/**
 * Renders task progress as a right-aligned percentage string (e.g. " 42%").
 * Shows "  ?%" when progress is indeterminate (total is null).
 */
export class PercentageColumn {
  render(task: Task): string {
    const progress = getTaskProgress(task);
    if (progress === null) return '  ?%';
    return `${Math.round(progress * 100).toString().padStart(3)}%`;
  }
}
