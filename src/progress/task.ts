/**
 * Progress task type definitions
 */
import type { TaskID } from '../types.js';

/** Task options */
export type TaskOptions = {
  total?: number | undefined;
  completed?: number | undefined;
  visible?: boolean | undefined;
  description?: string | undefined;
  fields?: Record<string, unknown> | undefined;
};

/** Task state */
export type Task = {
  id: TaskID;
  description: string;
  total: number | null;
  completed: number;
  visible: boolean;
  startTime: number;
  fields: Record<string, unknown>;
};

let nextTaskId = 0;

/** Generates a new task ID */
export function createTaskId(): TaskID {
  return nextTaskId++ as TaskID;
}

/** Resets the task ID counter (for testing) */
export function resetTaskIdCounter(): void {
  nextTaskId = 0;
}

/** Creates a task */
export function createTask(description: string, options?: TaskOptions): Task {
  return {
    id: createTaskId(),
    description: options?.description ?? description,
    total: options?.total ?? null,
    completed: options?.completed ?? 0,
    visible: options?.visible ?? true,
    startTime: Date.now(),
    fields: options?.fields ?? {},
  };
}

/** Returns the task progress ratio (0-1). Returns null if total is null */
export function getTaskProgress(task: Task): number | null {
  if (task.total === null || task.total === 0) return null;
  return Math.min(1, task.completed / task.total);
}

/** Returns the elapsed time in seconds for a task */
export function getElapsedSeconds(task: Task): number {
  return (Date.now() - task.startTime) / 1000;
}

/** Estimates the remaining time in seconds. Returns null if not estimable */
export function getTimeRemaining(task: Task): number | null {
  const progress = getTaskProgress(task);
  if (progress === null || progress === 0) return null;
  const elapsed = getElapsedSeconds(task);
  return (elapsed / progress) * (1 - progress);
}

/** Whether the task is finished */
export function isTaskFinished(task: Task): boolean {
  if (task.total === null) return false;
  return task.completed >= task.total;
}
