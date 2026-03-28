import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileSizeColumn, TransferSpeedColumn } from '../../../src/progress/columns/transfer.js';
import type { Task } from '../../../src/progress/task.js';

describe('FileSizeColumn', () => {
  it('displays 0 bytes as 0 B', () => {
    const col = new FileSizeColumn();
    const task = { completed: 0 } as Task;
    expect(col.render(task)).toBe('0 B');
  });

  it('displays in bytes', () => {
    const col = new FileSizeColumn();
    const task = { completed: 500 } as Task;
    expect(col.render(task)).toBe('500.0 B');
  });

  it('displays in KB', () => {
    const col = new FileSizeColumn();
    const task = { completed: 1024 } as Task;
    expect(col.render(task)).toBe('1.0 KB');
  });

  it('displays in MB', () => {
    const col = new FileSizeColumn();
    const task = { completed: 1024 * 1024 } as Task;
    expect(col.render(task)).toBe('1.0 MB');
  });

  it('displays in GB', () => {
    const col = new FileSizeColumn();
    const task = { completed: 1024 * 1024 * 1024 } as Task;
    expect(col.render(task)).toBe('1.0 GB');
  });
});

describe('TransferSpeedColumn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns ? B/s when elapsed is 0', () => {
    const now = Date.now();
    vi.setSystemTime(now);
    const col = new TransferSpeedColumn();
    const task = { completed: 1024, startTime: now } as Task;
    expect(col.render(task)).toBe('? B/s');
  });

  it('displays transfer speed', () => {
    const start = new Date('2026-01-01T00:00:00Z').getTime();
    vi.setSystemTime(new Date('2026-01-01T00:00:10Z'));
    const col = new TransferSpeedColumn();
    // 10240 bytes in 10 seconds = 1024 B/s = 1.0 KB/s
    const task = { completed: 10240, startTime: start } as Task;
    expect(col.render(task)).toBe('1.0 KB/s');
  });
});
