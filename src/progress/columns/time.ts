/**
 * TimeElapsedColumn / TimeRemainingColumn — Time display columns for progress tracking.
 */
import type { Task } from '../task.js';
import { getElapsedSeconds, getTimeRemaining } from '../task.js';

const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;

/** Formats a duration in seconds to h:mm:ss or m:ss format */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const secs = Math.floor(seconds % SECONDS_PER_MINUTE);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Renders the elapsed time since the task started.
 * Format: "m:ss" or "h:mm:ss" for durations over an hour.
 */
export class TimeElapsedColumn {
  render(task: Task): string {
    const elapsed = getElapsedSeconds(task);
    return formatDuration(elapsed);
  }
}

/**
 * Renders the estimated remaining time for a task.
 * Shows "-:--" when remaining time cannot be estimated.
 */
export class TimeRemainingColumn {
  render(task: Task): string {
    const remaining = getTimeRemaining(task);
    if (remaining === null) return '-:--';
    return `-${formatDuration(remaining)}`;
  }
}
