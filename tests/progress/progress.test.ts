import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Progress } from '../../src/progress/progress.js';
import { TextColumn } from '../../src/progress/columns/text.js';
import { ColorLevel } from '../../src/types.js';
import type { RenderOptions } from '../../src/types.js';
import { resetTaskIdCounter } from '../../src/progress/task.js';

const defaultOptions: RenderOptions = {
  width: 80,
  colorLevel: ColorLevel.None,
};

describe('Progress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    resetTaskIdCounter();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a task via addTask and returns TaskID', () => {
    const progress = new Progress([new TextColumn()], { colorLevel: ColorLevel.None });
    const id = progress.addTask('Download');
    expect(id).toBeDefined();
  });

  it('removes a task via removeTask', () => {
    const progress = new Progress([new TextColumn()], { colorLevel: ColorLevel.None });
    const id = progress.addTask('Download');
    progress.removeTask(id);
    const lines = progress.render(defaultOptions);
    expect(lines).toEqual([]);
  });

  it('updates description via updateTask', () => {
    const progress = new Progress([new TextColumn()], { colorLevel: ColorLevel.None });
    const id = progress.addTask('Original');
    progress.updateTask(id, { description: 'Updated' });
    const lines = progress.render(defaultOptions);
    expect(lines[0]).toBe('Updated');
  });

  it('updates completed via updateTask', () => {
    const progress = new Progress([new TextColumn('{task.completed}')], { colorLevel: ColorLevel.None });
    const id = progress.addTask('Download', { total: 100 });
    progress.updateTask(id, { completed: 42 });
    const lines = progress.render(defaultOptions);
    expect(lines[0]).toBe('42');
  });

  it('advances task completed via advance', () => {
    const progress = new Progress([new TextColumn('{task.completed}')], { colorLevel: ColorLevel.None });
    const id = progress.addTask('Download', { total: 100 });
    progress.advance(id);
    progress.advance(id, 4);
    const lines = progress.render(defaultOptions);
    expect(lines[0]).toBe('5');
  });

  it('excludes tasks with visible=false from render', () => {
    const progress = new Progress([new TextColumn()], { colorLevel: ColorLevel.None });
    progress.addTask('Visible', { visible: true });
    progress.addTask('Hidden', { visible: false });
    const lines = progress.render(defaultOptions);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe('Visible');
  });

  it('returns multiple lines for multiple tasks', () => {
    const progress = new Progress([new TextColumn()], { colorLevel: ColorLevel.None });
    progress.addTask('Task 1');
    progress.addTask('Task 2');
    const lines = progress.render(defaultOptions);
    expect(lines).toHaveLength(2);
  });

  it('returns false for finished when there are no tasks', () => {
    const progress = new Progress([], { colorLevel: ColorLevel.None });
    expect(progress.finished).toBe(false);
  });

  it('returns true for finished when all tasks are complete', () => {
    const progress = new Progress([], { colorLevel: ColorLevel.None });
    progress.addTask('Download', { total: 10, completed: 10 });
    expect(progress.finished).toBe(true);
  });

  it('returns false for finished when some tasks are incomplete', () => {
    const progress = new Progress([], { colorLevel: ColorLevel.None });
    progress.addTask('Done', { total: 10, completed: 10 });
    progress.addTask('Pending', { total: 10, completed: 5 });
    expect(progress.finished).toBe(false);
  });

  it('logs when updateTask is called with non-existent TaskID', () => {
    const spy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const progress = new Progress([], { colorLevel: ColorLevel.None });
    progress.updateTask(999 as never, { description: 'test' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('logs when advance is called with non-existent TaskID', () => {
    const spy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const progress = new Progress([], { colorLevel: ColorLevel.None });
    progress.advance(999 as never);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
