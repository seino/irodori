import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TimeElapsedColumn, TimeRemainingColumn } from '../../../src/progress/columns/time.js';
import type { Task } from '../../../src/progress/task.js';

describe('TimeElapsedColumn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 0:00 for 0 seconds', () => {
    const now = Date.now();
    vi.setSystemTime(now);
    const col = new TimeElapsedColumn();
    const task = { startTime: now } as Task;
    expect(col.render(task)).toBe('0:00');
  });

  it('returns 1:05 for 65 seconds', () => {
    const start = new Date('2026-01-01T00:00:00Z').getTime();
    vi.setSystemTime(new Date('2026-01-01T00:01:05Z'));
    const col = new TimeElapsedColumn();
    const task = { startTime: start } as Task;
    expect(col.render(task)).toBe('1:05');
  });

  it('returns 1:01:01 for 3661 seconds', () => {
    const start = new Date('2026-01-01T00:00:00Z').getTime();
    vi.setSystemTime(new Date('2026-01-01T01:01:01Z'));
    const col = new TimeElapsedColumn();
    const task = { startTime: start } as Task;
    expect(col.render(task)).toBe('1:01:01');
  });
});

describe('TimeRemainingColumn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns -:-- when estimation is not possible', () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const col = new TimeRemainingColumn();
    const task = { total: null, completed: 0, startTime: Date.now() } as Task;
    expect(col.render(task)).toBe('-:--');
  });

  it('returns -:-- when progress=0', () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:10Z'));
    const col = new TimeRemainingColumn();
    const task = { total: 100, completed: 0, startTime: Date.now() - 10000 } as Task;
    expect(col.render(task)).toBe('-:--');
  });

  it('estimates and displays remaining time', () => {
    const start = new Date('2026-01-01T00:00:00Z').getTime();
    vi.setSystemTime(new Date('2026-01-01T00:00:50Z'));
    const col = new TimeRemainingColumn();
    const task = { total: 100, completed: 50, startTime: start } as Task;
    expect(col.render(task)).toBe('-0:50');
  });
});
