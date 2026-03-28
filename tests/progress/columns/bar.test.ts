import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BarColumn } from '../../../src/progress/columns/bar.js';
import type { Task } from '../../../src/progress/task.js';

describe('BarColumn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('default maxWidth is 40', () => {
    const col = new BarColumn();
    expect(col.maxWidth).toBe(40);
  });

  it('supports custom maxWidth', () => {
    const col = new BarColumn(20);
    expect(col.maxWidth).toBe(20);
  });

  it('returns all empty characters for progress=0', () => {
    const col = new BarColumn(10);
    const task = { total: 100, completed: 0 } as Task;
    const result = col.render(task);
    expect(result).toBe('╺'.repeat(10));
  });

  it('fills completely for progress=1', () => {
    const col = new BarColumn(10);
    const task = { total: 100, completed: 100 } as Task;
    const result = col.render(task);
    expect(result).toBe('━'.repeat(10));
  });

  it('fills halfway for progress=0.5', () => {
    const col = new BarColumn(10);
    const task = { total: 100, completed: 50 } as Task;
    const result = col.render(task);
    expect(result).toBe('━'.repeat(5) + '╺'.repeat(5));
  });

  it('shows pulse animation when total=null', () => {
    const col = new BarColumn(10);
    const task = { total: null, completed: 0 } as Task;
    const result = col.render(task);
    expect(result.length).toBe(10);
  });
});
