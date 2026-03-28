import { describe, it, expect } from 'vitest';
import { TextColumn } from '../../../src/progress/columns/text.js';
import type { Task } from '../../../src/progress/task.js';

describe('TextColumn', () => {
  it('displays description with default template', () => {
    const col = new TextColumn();
    const task = { description: 'Downloading' } as Task;
    expect(col.render(task)).toBe('Downloading');
  });

  it('displays with custom template', () => {
    const col = new TextColumn('Processing: {task.description}');
    const task = { description: 'test' } as Task;
    expect(col.render(task)).toBe('Processing: test');
  });

  it('replaces {task.completed} placeholder', () => {
    const col = new TextColumn('{task.completed} done');
    const task = { completed: 42 } as Task;
    expect(col.render(task)).toBe('42 done');
  });

  it('replaces {task.total} when it is a number', () => {
    const col = new TextColumn('{task.total} total');
    const task = { total: 100 } as Task;
    expect(col.render(task)).toBe('100 total');
  });

  it('replaces with ? when total is null', () => {
    const col = new TextColumn('{task.completed}/{task.total}');
    const task = { completed: 10, total: null } as Task;
    expect(col.render(task)).toBe('10/?');
  });

  it('replaces multiple placeholders simultaneously', () => {
    const col = new TextColumn('{task.description}: {task.completed}/{task.total}');
    const task = { description: 'DL', completed: 50, total: 100 } as Task;
    expect(col.render(task)).toBe('DL: 50/100');
  });

  it('returns template as-is when there are no placeholders', () => {
    const col = new TextColumn('Static text');
    const task = { description: 'x' } as Task;
    expect(col.render(task)).toBe('Static text');
  });
});
