/**
 * Status / Spinner -- spinner display for indeterminate waiting states
 */
import type { RenderOptions, Renderable } from '../types.js';
import { ColorLevel } from '../types.js';
import { detectColorLevel, detectWidth } from '../output/detector.js';
import { spinners, DEFAULT_SPINNER } from './spinners.js';
import { parse } from '../markup/parser.js';
import { encodeSpans } from '../ansi/encoder.js';
import { Live } from '../live/live.js';

/** Status options */
export type StatusOptions = {
  spinner?: string | undefined;
  spinnerStyle?: string | undefined;
  speed?: number | undefined;
  stdout?: NodeJS.WriteStream | undefined;
  colorLevel?: ColorLevel | undefined;
};

/**
 * Status display with spinner (Renderable)
 */
class StatusRenderable implements Renderable {
  message: string;
  private readonly spinnerName: string;
  private readonly spinnerStyle: string;
  private readonly speed: number;

  constructor(message: string, options?: StatusOptions) {
    this.message = message;
    this.spinnerName = options?.spinner ?? DEFAULT_SPINNER;
    this.spinnerStyle = options?.spinnerStyle ?? 'green';
    this.speed = options?.speed ?? 1.0;
  }

  render(options: RenderOptions): string[] {
    const spinner = spinners[this.spinnerName];
    if (!spinner) return [this.message];

    const interval = spinner.interval / this.speed;
    const frameIdx = Math.floor(Date.now() / interval) % spinner.frames.length;
    const frame = spinner.frames[frameIdx] ?? '';

    const styledFrame =
      options.colorLevel > ColorLevel.None
        ? encodeSpans(parse(`[${this.spinnerStyle}]${frame}[/]`), options.colorLevel)
        : frame;

    return [`${styledFrame} ${this.message}`];
  }
}

/**
 * Status class -- for manual control
 */
export class Status {
  private readonly renderable: StatusRenderable;
  private readonly live: Live;

  constructor(message: string, options?: StatusOptions) {
    this.renderable = new StatusRenderable(message, options);
    this.live = new Live(this.renderable, {
      refreshRate: 16,
      transient: true,
      stdout: options?.stdout,
      colorLevel: options?.colorLevel,
    });
  }

  /** Starts the display */
  start(): void {
    this.live.start();
  }

  /** Stops the display */
  stop(): void {
    this.live.stop();
  }

  /** Updates the message */
  update(message: string): void {
    this.renderable.message = message;
  }
}

/**
 * Function-style status -- shows a spinner during callback execution
 * @param message Display message
 * @param fn Async function to execute
 * @param options Options
 */
export async function status<T>(
  message: string,
  fn: () => Promise<T>,
  options?: StatusOptions,
): Promise<T> {
  const statusInstance = new Status(message, options);
  statusInstance.start();
  try {
    return await fn();
  } finally {
    statusInstance.stop();
  }
}
