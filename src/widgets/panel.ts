/**
 * Panel — titled box widget
 */
import type { Renderable, RenderOptions, BorderStyle, BoxChars, Padding, ColorLevel } from '../types.js';
import { stringWidth } from '../layout/measure.js';
import { wrapText } from '../layout/wrap.js';
import { parse } from '../markup/parser.js';
import { encodeSpans } from '../ansi/encoder.js';
import { stripAnsi } from '../ansi/strip.js';
import { BORDER_CHARS } from './borders.js';

/** Panel options */
export type PanelOptions = {
  title?: string | undefined;
  subtitle?: string | undefined;
  border?: BorderStyle | undefined;
  style?: string | undefined;
  titleAlign?: 'left' | 'center' | 'right' | undefined;
  padding?: Padding | undefined;
  expand?: boolean | undefined;
  width?: number | undefined;
};

/**
 * Titled box widget
 */
export class Panel implements Renderable {
  private readonly content: string | Renderable;
  private readonly title: string | undefined;
  private readonly subtitle: string | undefined;
  private readonly border: BorderStyle;
  private readonly style: string | undefined;
  private readonly titleAlign: 'left' | 'center' | 'right';
  private readonly padTop: number;
  private readonly padRight: number;
  private readonly padBottom: number;
  private readonly padLeft: number;
  private readonly expand: boolean;
  private readonly fixedWidth: number | undefined;

  constructor(content: string | Renderable, options?: PanelOptions) {
    this.content = content;
    this.title = options?.title;
    this.subtitle = options?.subtitle;
    this.border = options?.border ?? 'rounded';
    this.style = options?.style;
    this.titleAlign = options?.titleAlign ?? 'left';
    this.expand = options?.expand ?? false;
    this.fixedWidth = options?.width;

    const padding = options?.padding;
    if (typeof padding === 'number') {
      this.padTop = padding;
      this.padRight = padding;
      this.padBottom = padding;
      this.padLeft = padding;
    } else if (Array.isArray(padding) && padding.length === 2) {
      this.padTop = padding[0];
      this.padRight = padding[1];
      this.padBottom = padding[0];
      this.padLeft = padding[1];
    } else if (Array.isArray(padding) && padding.length === 4) {
      this.padTop = padding[0];
      this.padRight = padding[1];
      this.padBottom = padding[2];
      this.padLeft = padding[3];
    } else {
      this.padTop = 0;
      this.padRight = 1;
      this.padBottom = 0;
      this.padLeft = 1;
    }
  }

  render(options: RenderOptions): string[] {
    const box = BORDER_CHARS[this.border];
    const maxWidth = this.fixedWidth ?? options.width;

    // Generate content lines
    let contentLines: string[];
    if (typeof this.content === 'string') {
      const innerWidth = maxWidth - 2 - this.padLeft - this.padRight; // 2 = left/right border
      const spans = parse(this.content);
      const encoded = encodeSpans(spans, options.colorLevel);
      contentLines = [];
      for (const rawLine of encoded.split('\n')) {
        const plainWidth = stringWidth(stripAnsi(rawLine));
        if (plainWidth <= innerWidth) {
          contentLines.push(rawLine);
        } else {
          // Fall back to plain text when wrapping is needed
          contentLines.push(...wrapText(stripAnsi(rawLine), innerWidth));
        }
      }
    } else {
      const innerOptions: RenderOptions = {
        ...options,
        width: maxWidth - 2 - this.padLeft - this.padRight,
      };
      contentLines = this.content.render(innerOptions);
    }

    // Encode title/subtitle markup
    const encodedTitle = this.title ? encodeSpans(parse(this.title), options.colorLevel) : undefined;
    const encodedSubtitle = this.subtitle ? encodeSpans(parse(this.subtitle), options.colorLevel) : undefined;

    // Calculate max content width
    const contentMaxWidth = Math.max(
      ...contentLines.map((l) => stringWidth(l)),
      encodedTitle ? stringWidth(encodedTitle) : 0,
    );

    const innerWidth = this.expand
      ? maxWidth - 2 - this.padLeft - this.padRight
      : Math.min(contentMaxWidth, maxWidth - 2 - this.padLeft - this.padRight);

    const totalWidth = innerWidth + 2 + this.padLeft + this.padRight;
    const lines: string[] = [];

    // Top border
    let topLine = box.topLeft + box.horizontal.repeat(totalWidth - 2) + box.topRight;
    if (encodedTitle) {
      const titleStr = ` ${encodedTitle} `;
      topLine = this.insertTitle(box.topLeft, box.topRight, box.horizontal, titleStr, totalWidth);
    }
    lines.push(this.applyStyle(topLine, options.colorLevel));

    // Top padding
    for (let i = 0; i < this.padTop; i++) {
      lines.push(
        this.applyStyle(box.vertical, options.colorLevel) +
          ' '.repeat(totalWidth - 2) +
          this.applyStyle(box.vertical, options.colorLevel),
      );
    }

    // Content lines
    for (const contentLine of contentLines) {
      const stripped = stripAnsi(contentLine);
      const lineWidth = stringWidth(stripped);
      const padRight = Math.max(0, innerWidth - lineWidth);
      lines.push(
        this.applyStyle(box.vertical, options.colorLevel) +
          ' '.repeat(this.padLeft) +
          contentLine +
          ' '.repeat(padRight) +
          ' '.repeat(this.padRight) +
          this.applyStyle(box.vertical, options.colorLevel),
      );
    }

    // Bottom padding
    for (let i = 0; i < this.padBottom; i++) {
      lines.push(
        this.applyStyle(box.vertical, options.colorLevel) +
          ' '.repeat(totalWidth - 2) +
          this.applyStyle(box.vertical, options.colorLevel),
      );
    }

    // Bottom border
    let bottomLine = box.bottomLeft + box.horizontal.repeat(totalWidth - 2) + box.bottomRight;
    if (encodedSubtitle) {
      const subtitleStr = ` ${encodedSubtitle} `;
      bottomLine = this.insertTitle(
        box.bottomLeft,
        box.bottomRight,
        box.horizontal,
        subtitleStr,
        totalWidth,
      );
    }
    lines.push(this.applyStyle(bottomLine, options.colorLevel));

    return lines;
  }

  private insertTitle(
    left: string,
    right: string,
    horizontal: string,
    titleStr: string,
    totalWidth: number,
  ): string {
    const titleWidth = stringWidth(titleStr);
    const available = totalWidth - 2 - titleWidth;

    if (this.titleAlign === 'center') {
      const leftPad = Math.floor(available / 2);
      const rightPad = available - leftPad;
      return left + horizontal.repeat(leftPad) + titleStr + horizontal.repeat(rightPad) + right;
    } else if (this.titleAlign === 'right') {
      return left + horizontal.repeat(available) + titleStr + right;
    }
    // left (default)
    return left + titleStr + horizontal.repeat(available) + right;
  }

  private applyStyle(text: string, colorLevel: ColorLevel): string {
    if (this.style) {
      const spans = parse(`[${this.style}]${text}[/]`);
      return encodeSpans(spans, colorLevel);
    }
    return text;
  }
}
