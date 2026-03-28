/**
 * Rule — horizontal rule widget
 */
import type { Renderable, RenderOptions, ColorLevel } from '../types.js';
import { stringWidth } from '../layout/measure.js';
import { parse } from '../markup/parser.js';
import { encodeSpans } from '../ansi/encoder.js';

/** Rule options */
export type RuleOptions = {
  title?: string | undefined;
  character?: string | undefined;
  style?: string | undefined;
  align?: 'left' | 'center' | 'right' | undefined;
};

/**
 * Horizontal separator line widget
 */
export class Rule implements Renderable {
  private readonly title: string | undefined;
  private readonly character: string;
  private readonly style: string | undefined;
  private readonly align: 'left' | 'center' | 'right';

  constructor(options?: RuleOptions) {
    this.title = options?.title;
    this.character = options?.character ?? '─';
    this.style = options?.style;
    this.align = options?.align ?? 'center';
  }

  render(options: RenderOptions): string[] {
    const { width, colorLevel } = options;
    const char = this.character;

    if (!this.title) {
      const line = char.repeat(width);
      return [this.applyStyle(line, colorLevel)];
    }

    const titleStr = ` ${this.title} `;
    const titleWidth = stringWidth(titleStr);
    const remaining = Math.max(0, width - titleWidth);

    let line: string;
    if (this.align === 'left') {
      line = char.repeat(2) + titleStr + char.repeat(Math.max(0, remaining - 2));
    } else if (this.align === 'right') {
      line = char.repeat(Math.max(0, remaining - 2)) + titleStr + char.repeat(2);
    } else {
      const left = Math.floor(remaining / 2);
      const right = remaining - left;
      line = char.repeat(left) + titleStr + char.repeat(right);
    }

    return [this.applyStyle(line, colorLevel)];
  }

  private applyStyle(line: string, colorLevel: ColorLevel): string {
    if (this.style) {
      const spans = parse(`[${this.style}]${line}[/]`);
      return encodeSpans(spans, colorLevel);
    }
    return line;
  }
}
