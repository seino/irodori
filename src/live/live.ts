/**
 * Live — live display that continuously updates the same region with diffs
 */
import type { Renderable, RenderOptions } from '../types.js';
import { ColorLevel } from '../types.js';
import { detectColorLevel, detectWidth } from '../output/detector.js';
import { cursorHide, cursorShow, cursorUp, eraseLine } from '../output/cursor.js';
import { DiffRenderer } from './diff.js';

/** Live options */
export type LiveOptions = {
  refreshRate?: number | undefined;
  transient?: boolean | undefined;
  screen?: boolean | undefined;
  autoRefresh?: boolean | undefined;
  stdout?: NodeJS.WriteStream | undefined;
  colorLevel?: ColorLevel | undefined;
};

/**
 * Live display class
 * Continuously rewrites the same region using diff updates
 */
export class Live {
  private renderable: Renderable | null;
  private readonly refreshRate: number;
  private readonly transient: boolean;
  private readonly autoRefresh: boolean;
  private readonly stream: NodeJS.WriteStream;
  private readonly colorLevel: ColorLevel;
  private readonly diffRenderer: DiffRenderer;
  private timer: ReturnType<typeof setInterval> | null = null;
  private started = false;

  constructor(renderable?: Renderable, options?: LiveOptions) {
    this.renderable = renderable ?? null;
    // Default ~60fps refresh rate (16ms ≈ 1000ms / 60)
    this.refreshRate = options?.refreshRate ?? 16;
    this.transient = options?.transient ?? false;
    this.autoRefresh = options?.autoRefresh ?? true;
    this.stream = options?.stdout ?? process.stdout;
    this.colorLevel = options?.colorLevel ?? detectColorLevel(this.stream);
    this.diffRenderer = new DiffRenderer();
  }

  /** Updates the renderable */
  update(renderable: Renderable | string): void {
    if (typeof renderable === 'string') {
      this.renderable = {
        render: () => [renderable],
      };
    } else {
      this.renderable = renderable;
    }
    if (this.started && !this.autoRefresh) {
      this.refresh();
    }
  }

  /** Manually triggers a redraw */
  refresh(): void {
    if (!this.renderable) return;

    const options: RenderOptions = {
      width: detectWidth(this.stream),
      colorLevel: this.colorLevel,
    };

    const lines = this.renderable.render(options);
    this.diffRenderer.write(lines, this.stream);
  }

  /** Starts the live display */
  start(): void {
    if (this.started) return;
    this.started = true;
    this.stream.write(cursorHide());

    if (this.autoRefresh) {
      this.timer = setInterval(() => this.refresh(), this.refreshRate);
    }

    this.refresh();
  }

  /** Stops the live display */
  stop(clear?: boolean): void {
    if (!this.started) return;
    this.started = false;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (clear ?? this.transient) {
      // Clear the display
      const lineCount = this.diffRenderer.lineCount;
      if (lineCount > 0) {
        this.stream.write(cursorUp(lineCount));
        for (let i = 0; i < lineCount; i++) {
          this.stream.write(eraseLine() + '\n');
        }
        this.stream.write(cursorUp(lineCount));
      }
    }

    this.stream.write(cursorShow());
    this.diffRenderer.reset();
  }

  /**
   * Static factory -- uses live display within a callback
   * @param fn Function to execute during live display
   * @param options Options
   */
  static async run<T>(fn: (live: Live) => Promise<T>, options?: LiveOptions): Promise<T> {
    const live = new Live(undefined, options);
    live.start();
    try {
      return await fn(live);
    } finally {
      live.stop();
    }
  }
}
