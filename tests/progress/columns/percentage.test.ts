import { describe, it, expect } from 'vitest';
import { PercentageColumn } from '../../../src/progress/columns/percentage.js';
import type { Task } from '../../../src/progress/task.js';

describe('PercentageColumn', () => {
  it('returns ?% when total is null', () => {
    const col = new PercentageColumn();
    const task = { total: null, completed: 0 } as Task;
    expect(col.render(task)).toBe('  ?%');
  });

  it('displays 0%', () => {
    const col = new PercentageColumn();
    const task = { total: 100, completed: 0 } as Task;
    expect(col.render(task)).toBe('  0%');
  });

  it('displays 50%', () => {
    const col = new PercentageColumn();
    const task = { total: 100, completed: 50 } as Task;
    expect(col.render(task)).toBe(' 50%');
  });

  it('displays 100%', () => {
    const col = new PercentageColumn();
    const task = { total: 100, completed: 100 } as Task;
    expect(col.render(task)).toBe('100%');
  });

  it('output is always 4 characters', () => {
    const col = new PercentageColumn();
    const task0 = { total: 100, completed: 0 } as Task;
    const task50 = { total: 100, completed: 50 } as Task;
    const task100 = { total: 100, completed: 100 } as Task;
    const taskNull = { total: null, completed: 0 } as Task;
    expect(col.render(task0).length).toBe(4);
    expect(col.render(task50).length).toBe(4);
    expect(col.render(task100).length).toBe(4);
    expect(col.render(taskNull).length).toBe(4);
  });
});
