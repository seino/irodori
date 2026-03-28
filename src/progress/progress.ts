/**
 * Progress -- displays progress for multiple tasks simultaneously
 */
import type { Renderable, RenderOptions, TaskID } from '../types.js';
import { ColorLevel } from '../types.js';
import type { Task, TaskOptions } from './task.js';
import { createTask, isTaskFinished } from './task.js';
import { detectColorLevel, detectWidth } from '../output/detector.js';
import { Live } from '../live/live.js';
import { SpinnerColumn } from './columns/spinner.js';
import { TextColumn } from './columns/text.js';
import { BarColumn } from './columns/bar.js';
import { TimeRemainingColumn } from './columns/time.js';

/** Progress column interface */
export type ProgressColumn = {
  render(task: Task, options: RenderOptions): string;
  maxWidth?: number | undefined;
  noWrap?: boolean | undefined;
};

/** Progress options */
export type ProgressOptions = {
  columns?: ProgressColumn[] | undefined;
  refreshRate?: number | undefined;
  transient?: boolean | undefined;
  stdout?: NodeJS.WriteStream | undefined;
  colorLevel?: ColorLevel | undefined;
};

/**
 * Multi-task progress display class
 */
export class Progress implements Renderable {
  private readonly progressColumns: ProgressColumn[];
  private readonly tasks: Map<TaskID, Task> = new Map();
  private live: Live | null = null;
  private readonly refreshRate: number;
  private readonly transient: boolean;
  private readonly stream: NodeJS.WriteStream;
  private readonly colorLevel: ColorLevel;

  constructor(columns?: ProgressColumn[], options?: ProgressOptions) {
    this.progressColumns = columns ?? options?.columns ?? Progress.getDefaultColumns();
    this.refreshRate = options?.refreshRate ?? 16;
    this.transient = options?.transient ?? false;
    this.stream = options?.stdout ?? process.stdout;
    this.colorLevel = options?.colorLevel ?? detectColorLevel(this.stream);
  }

  /** Returns the default column configuration */
  static getDefaultColumns(): ProgressColumn[] {
    return [new SpinnerColumn(), new TextColumn(), new BarColumn(), new TimeRemainingColumn()];
  }

  /** Adds a task */
  addTask(description: string, options?: TaskOptions): TaskID {
    const task = createTask(description, options);
    this.tasks.set(task.id, task);
    return task.id;
  }

  /** Removes a task */
  removeTask(id: TaskID): void {
    this.tasks.delete(id);
  }

  /** Updates a task */
  updateTask(id: TaskID, options: Partial<TaskOptions>): void {
    const task = this.tasks.get(id);
    if (!task) {
      process.stderr.write(`[Progress] Task not found: id=${String(id)}\n`);
      return;
    }
    if (options.description !== undefined) task.description = options.description;
    if (options.total !== undefined) task.total = options.total;
    if (options.completed !== undefined) task.completed = options.completed;
    if (options.visible !== undefined) task.visible = options.visible;
    if (options.fields !== undefined) Object.assign(task.fields, options.fields);
  }

  /** Advances task progress */
  advance(id: TaskID, advance = 1): void {
    const task = this.tasks.get(id);
    if (!task) {
      process.stderr.write(`[Progress] Task not found: id=${String(id)}\n`);
      return;
    }
    task.completed += advance;
  }

  /** Starts the live display */
  start(): void {
    if (this.live) return;
    this.live = new Live(this, {
      refreshRate: this.refreshRate,
      transient: this.transient,
      stdout: this.stream,
      colorLevel: this.colorLevel,
    });
    this.live.start();
  }

  /** Stops the live display */
  stop(): void {
    if (!this.live) return;
    this.live.stop();
    this.live = null;
  }

  /** Manually triggers a redraw */
  refresh(): void {
    this.live?.refresh();
  }

  /** Whether all tasks are finished */
  get finished(): boolean {
    for (const task of this.tasks.values()) {
      if (!isTaskFinished(task)) return false;
    }
    return this.tasks.size > 0;
  }

  render(options: RenderOptions): string[] {
    const lines: string[] = [];

    for (const task of this.tasks.values()) {
      if (!task.visible) continue;

      const parts = this.progressColumns.map((col) => col.render(task, options));
      lines.push(parts.join(' '));
    }

    return lines;
  }

  /**
   * Static factory -- uses Progress within a callback
   * @param fn Function to execute during progress display
   * @param options Options
   */
  static async run<T>(fn: (p: Progress) => Promise<T>, options?: ProgressOptions): Promise<T> {
    const progress = new Progress(undefined, options);
    progress.start();
    try {
      return await fn(progress);
    } finally {
      progress.stop();
    }
  }

  /**
   * Wraps an iterator with progress tracking
   * @param iterable Source iterator
   * @param options Options
   */
  static async *track<T>(
    iterable: Iterable<T> | AsyncIterable<T>,
    options?: { description?: string; total?: number } & ProgressOptions,
  ): AsyncGenerator<T> {
    const progress = new Progress(undefined, options);
    const taskId = progress.addTask(options?.description ?? 'Processing...', {
      total: options?.total,
    });
    progress.start();

    try {
      if (Symbol.asyncIterator in iterable) {
        for await (const item of iterable as AsyncIterable<T>) {
          yield item;
          progress.advance(taskId);
        }
      } else {
        for (const item of iterable as Iterable<T>) {
          yield item;
          progress.advance(taskId);
        }
      }
    } finally {
      progress.stop();
    }
  }
}
