import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTask,
  getTaskProgress,
  getElapsedSeconds,
  getTimeRemaining,
  isTaskFinished,
  resetTaskIdCounter,
} from '../../src/progress/task.js';
import type { Task } from '../../src/progress/task.js';

describe('createTask', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    resetTaskIdCounter();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates task with default options', () => {
    const task = createTask('Download');
    expect(task.description).toBe('Download');
    expect(task.total).toBeNull();
    expect(task.completed).toBe(0);
    expect(task.visible).toBe(true);
  });

  it('creates task with specified total', () => {
    const task = createTask('DL', { total: 100 });
    expect(task.total).toBe(100);
  });

  it('creates task with specified completed', () => {
    const task = createTask('DL', { completed: 50 });
    expect(task.completed).toBe(50);
  });

  it('supports visible=false', () => {
    const task = createTask('DL', { visible: false });
    expect(task.visible).toBe(false);
  });

  it('overrides with description option', () => {
    const task = createTask('Default', { description: 'Override' });
    expect(task.description).toBe('Override');
  });

  it('supports fields option', () => {
    const task = createTask('DL', { fields: { url: 'https://example.com' } });
    expect(task.fields).toEqual({ url: 'https://example.com' });
  });

  it('sets startTime to Date.now()', () => {
    const task = createTask('DL');
    expect(task.startTime).toBe(Date.now());
  });
});

describe('getTaskProgress', () => {
  it('returns null when total is null', () => {
    const task = { total: null, completed: 0 } as Task;
    expect(getTaskProgress(task)).toBeNull();
  });

  it('returns null when total is 0', () => {
    const task = { total: 0, completed: 0 } as Task;
    expect(getTaskProgress(task)).toBeNull();
  });

  it('returns 0 for 0/100', () => {
    const task = { total: 100, completed: 0 } as Task;
    expect(getTaskProgress(task)).toBe(0);
  });

  it('returns 0.5 for 50/100', () => {
    const task = { total: 100, completed: 50 } as Task;
    expect(getTaskProgress(task)).toBe(0.5);
  });

  it('returns 1 for 100/100', () => {
    const task = { total: 100, completed: 100 } as Task;
    expect(getTaskProgress(task)).toBe(1);
  });

  it('caps at 1 even when exceeded', () => {
    const task = { total: 100, completed: 150 } as Task;
    expect(getTaskProgress(task)).toBe(1);
  });
});

describe('getElapsedSeconds', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:10Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns elapsed seconds', () => {
    const start = new Date('2026-01-01T00:00:00Z').getTime();
    const task = { startTime: start } as Task;
    expect(getElapsedSeconds(task)).toBe(10);
  });
});

describe('getTimeRemaining', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when total is null', () => {
    const task = { total: null, completed: 0, startTime: Date.now() } as Task;
    expect(getTimeRemaining(task)).toBeNull();
  });

  it('returns null when progress is 0', () => {
    const task = { total: 100, completed: 0, startTime: Date.now() } as Task;
    expect(getTimeRemaining(task)).toBeNull();
  });

  it('estimates remaining time from elapsed time and progress', () => {
    const start = new Date('2026-01-01T00:00:00Z').getTime();
    vi.setSystemTime(new Date('2026-01-01T00:00:50Z'));
    const task = { total: 100, completed: 50, startTime: start } as Task;
    expect(getTimeRemaining(task)).toBe(50);
  });
});

describe('isTaskFinished', () => {
  it('returns false when total is null', () => {
    const task = { total: null, completed: 10 } as Task;
    expect(isTaskFinished(task)).toBe(false);
  });

  it('returns false when completed < total', () => {
    const task = { total: 100, completed: 50 } as Task;
    expect(isTaskFinished(task)).toBe(false);
  });

  it('returns true when completed === total', () => {
    const task = { total: 100, completed: 100 } as Task;
    expect(isTaskFinished(task)).toBe(true);
  });

  it('returns true when completed > total', () => {
    const task = { total: 100, completed: 150 } as Task;
    expect(isTaskFinished(task)).toBe(true);
  });
});
