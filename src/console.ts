/**
 * Console class — irodori's main entry point
 */
import type { Renderable, RenderOptions, Style } from './types.js';
import { ColorLevel } from './types.js';
import { detectColorLevel, detectWidth } from './output/detector.js';
import { writeLines } from './output/writer.js';
import { parse } from './markup/parser.js';
import { replaceEmoji } from './markup/emoji.js';
import { encodeSpans } from './ansi/encoder.js';
import { stringWidth } from './layout/measure.js';

/** Console constructor options */
export type ConsoleOptions = {
  stdout?: NodeJS.WriteStream | undefined;
  stderr?: NodeJS.WriteStream | undefined;
  forceTerminal?: boolean | undefined;
  colorLevel?: ColorLevel | undefined;
  width?: number | undefined;
};

/** Rule options */
export type RuleOptions = {
  style?: string | undefined;
  character?: string | undefined;
  align?: 'left' | 'center' | 'right' | undefined;
};

/** print_exception options */
export type ExceptionOptions = {
  width?: number | undefined;
  extraLines?: number | undefined;
};

/**
 * Main console output class
 * Equivalent to Python rich's Console
 */
export class Console {
  private readonly _stdout: NodeJS.WriteStream;
  private readonly _stderr: NodeJS.WriteStream;
  private readonly _colorLevel: ColorLevel;
  private _width: number | undefined;
  private _capturedLines: string[] | null = null;

  constructor(options?: ConsoleOptions) {
    this._stdout = options?.stdout ?? process.stdout;
    this._stderr = options?.stderr ?? process.stderr;
    // forceTerminal bypasses TTY detection and defaults to TrueColor
    this._colorLevel =
      options?.colorLevel ?? (options?.forceTerminal ? ColorLevel.TrueColor : detectColorLevel(this._stdout));
    this._width = options?.width;
  }

  /** Current terminal width */
  get width(): number {
    return this._width ?? detectWidth(this._stdout);
  }

  /** Current color level */
  get colorLevel(): ColorLevel {
    return this._colorLevel;
  }

  /**
   * Prints a Renderable or markup string
   * @param renderables Content to print (string or Renderable)
   */
  print(...renderables: (string | Renderable)[]): void {
    const options = this.getRenderOptions();

    for (const renderable of renderables) {
      if (typeof renderable === 'string') {
        const processed = replaceEmoji(renderable);
        const spans = parse(processed);
        const encoded = encodeSpans(spans, this._colorLevel);
        this.writeLine(encoded);
      } else {
        const lines = renderable.render(options);
        for (const line of lines) {
          this.writeLine(line);
        }
      }
    }
  }

  /**
   * Prints a message with a timestamp
   * @param message Message string
   * @param args Additional arguments
   */
  log(message: string, ...args: unknown[]): void {
    const now = new Date();
    const timestamp = now.toLocaleTimeString();
    const argsStr = args.length > 0 ? ' ' + args.map(String).join(' ') : '';
    this.print(`[bright_black][${timestamp}][/] ${message}${argsStr}`);
  }

  /**
   * Prints a horizontal rule
   * @param title Optional title
   * @param options Options
   */
  rule(title?: string, options?: RuleOptions): void {
    const width = this.width;
    const char = options?.character ?? '─';

    if (!title) {
      this.writeLine(char.repeat(width));
      return;
    }

    const encodedTitle = encodeSpans(parse(replaceEmoji(title)), this._colorLevel);
    const titleVisualWidth = stringWidth(encodedTitle);
    const titleStr = ` ${encodedTitle} `;
    const titleWidth = titleVisualWidth + 2;
    const remaining = Math.max(0, width - titleWidth);
    const align = options?.align ?? 'center';

    let line: string;
    if (align === 'left') {
      line = char.repeat(2) + titleStr + char.repeat(Math.max(0, remaining - 2));
    } else if (align === 'right') {
      line = char.repeat(Math.max(0, remaining - 2)) + titleStr + char.repeat(2);
    } else {
      const left = Math.floor(remaining / 2);
      const right = remaining - left;
      line = char.repeat(left) + titleStr + char.repeat(right);
    }

    if (options?.style) {
      const ruleSpans = parse(`[${options.style}]${line}[/]`);
      this.writeLine(encodeSpans(ruleSpans, this._colorLevel));
    } else {
      this.writeLine(line);
    }
  }

  /**
   * Prints blank lines
   * @param count Number of blank lines
   */
  line(count = 1): void {
    for (let i = 0; i < count; i++) {
      this.writeLine('');
    }
  }

  /**
   * Pretty-prints an error
   * @param error Error object
   * @param options Options
   */
  printException(error: Error, options?: ExceptionOptions): void {
    const name = error.name || 'Error';
    const message = error.message || '';

    this.print(`[bold red]${name}:[/] ${message}`);

    if (error.stack) {
      const stackLines = error.stack.split('\n').slice(1);
      const limit = options?.extraLines ?? 5;
      const displayLines = stackLines.slice(0, limit);
      for (const stackLine of displayLines) {
        this.print(`[bright_black]${stackLine.trim()}[/]`);
      }
    }
  }

  /**
   * Captures output (for testing)
   * @param fn Function to execute during capture
   */
  capture(fn: () => void): string {
    this._capturedLines = [];
    try {
      fn();
      return this._capturedLines.join('\n');
    } finally {
      this._capturedLines = null;
    }
  }

  /** Internal: builds RenderOptions */
  getRenderOptions(): RenderOptions {
    return {
      width: this.width,
      colorLevel: this._colorLevel,
    };
  }

  /** Internal: writes a single line */
  private writeLine(line: string): void {
    if (this._capturedLines !== null) {
      this._capturedLines.push(line);
      return;
    }
    writeLines(this._stdout, [line]);
  }
}
