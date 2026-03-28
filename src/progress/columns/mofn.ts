/**
 * MofNCompleteColumn — Displays progress as "M/N" (completed/total).
 */
import type { Task } from '../task.js';

/**
 * Renders task progress as "completed/total" (e.g. "42/100").
 * Shows "?" for total when it is null (indeterminate).
 */
export class MofNCompleteColumn {
  private readonly separator: string;

  constructor(separator = '/') {
    this.separator = separator;
  }

  render(task: Task): string {
    const total = task.total !== null ? String(task.total) : '?';
    return `${task.completed}${this.separator}${total}`;
  }
}
