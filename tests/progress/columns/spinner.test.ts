import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SpinnerColumn } from '../../../src/progress/columns/spinner.js';
import type { Task } from '../../../src/progress/task.js';

describe('SpinnerColumn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns default finishedText for completed task', () => {
    const col = new SpinnerColumn();
    const task = { total: 100, completed: 100 } as Task;
    expect(col.render(task)).toBe('✔');
  });

  it('supports custom finishedText', () => {
    const col = new SpinnerColumn(undefined, 'done');
    const task = { total: 100, completed: 100 } as Task;
    expect(col.render(task)).toBe('done');
  });

  it('returns spinner frame for incomplete task', () => {
    const col = new SpinnerColumn();
    const task = { total: 100, completed: 0 } as Task;
    const result = col.render(task);
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns ? for non-existent spinner name', () => {
    const col = new SpinnerColumn('nonexistent_spinner');
    const task = { total: 100, completed: 0 } as Task;
    expect(col.render(task)).toBe('?');
  });

  it('supports specifying a different spinner name', () => {
    const col = new SpinnerColumn('line');
    const task = { total: 100, completed: 0 } as Task;
    const result = col.render(task);
    expect(['-', '\\', '|', '/']).toContain(result);
  });
});
