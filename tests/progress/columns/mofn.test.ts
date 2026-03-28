import { describe, it, expect } from 'vitest';
import { MofNCompleteColumn } from '../../../src/progress/columns/mofn.js';
import type { Task } from '../../../src/progress/task.js';

describe('MofNCompleteColumn', () => {
  it('displays with default separator', () => {
    const col = new MofNCompleteColumn();
    const task = { completed: 3, total: 10 } as Task;
    expect(col.render(task)).toBe('3/10');
  });

  it('supports custom separator', () => {
    const col = new MofNCompleteColumn(' of ');
    const task = { completed: 3, total: 10 } as Task;
    expect(col.render(task)).toBe('3 of 10');
  });

  it('displays ? when total is null', () => {
    const col = new MofNCompleteColumn();
    const task = { completed: 3, total: null } as Task;
    expect(col.render(task)).toBe('3/?');
  });

  it('correctly displays completed state', () => {
    const col = new MofNCompleteColumn();
    const task = { completed: 10, total: 10 } as Task;
    expect(col.render(task)).toBe('10/10');
  });
});
