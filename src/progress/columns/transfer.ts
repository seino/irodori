/**
 * TransferSpeedColumn / FileSizeColumn — File size and transfer speed display columns.
 */
import type { Task } from '../task.js';
import { getElapsedSeconds } from '../task.js';

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

/** Formats a byte count into a human-readable string (e.g. "1.5 MB") */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  let unitIdx = 0;
  let size = bytes;
  while (size >= 1024 && unitIdx < UNITS.length - 1) {
    size /= 1024;
    unitIdx++;
  }
  const unit = UNITS[unitIdx];
  return `${size.toFixed(1)} ${unit}`;
}

/**
 * Renders the current completed byte count as a human-readable file size.
 * Uses `task.completed` as the byte count.
 */
export class FileSizeColumn {
  render(task: Task): string {
    return formatBytes(task.completed);
  }
}

/**
 * Renders the transfer speed (bytes per second) based on elapsed time.
 * Shows "? B/s" when elapsed time is zero.
 */
export class TransferSpeedColumn {
  render(task: Task): string {
    const elapsed = getElapsedSeconds(task);
    if (elapsed === 0) return '? B/s';
    const speed = task.completed / elapsed;
    return `${formatBytes(speed)}/s`;
  }
}
