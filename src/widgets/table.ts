/**
 * Table — bordered table widget
 */
import type { Renderable, RenderOptions, BorderStyle, ColorLevel } from '../types.js';
import { stringWidth } from '../layout/measure.js';
import { wrapText } from '../layout/wrap.js';
import { parse } from '../markup/parser.js';
import { encodeSpans } from '../ansi/encoder.js';
import { BORDER_CHARS } from './borders.js';

/** Column options */
export type ColumnOptions = {
  style?: string | undefined;
  headerStyle?: string | undefined;
  justify?: 'left' | 'center' | 'right' | undefined;
  width?: number | undefined;
  minWidth?: number | undefined;
  maxWidth?: number | undefined;
  noWrap?: boolean | undefined;
  ratio?: number | undefined;
  overflow?: 'fold' | 'crop' | 'ellipsis' | 'ignore' | undefined;
};

/** Table options */
export type TableOptions = {
  title?: string | undefined;
  caption?: string | undefined;
  border?: BorderStyle | undefined;
  showHeader?: boolean | undefined;
  showEdge?: boolean | undefined;
  showLines?: boolean | undefined;
  padding?: number | undefined;
  expand?: boolean | undefined;
  style?: string | undefined;
  headerStyle?: string | undefined;
  rowStyles?: string[] | undefined;
};

type ColumnDef = {
  header: string;
  options: ColumnOptions;
};

type Row = (string | Renderable)[];

/**
 * Bordered table widget
 */
export class Table implements Renderable {
  private readonly columns: ColumnDef[] = [];
  private readonly rows: Row[] = [];
  private readonly sections: Set<number> = new Set();
  private readonly border: BorderStyle;
  private readonly showHeader: boolean;
  private readonly showEdge: boolean;
  private readonly showLines: boolean;
  private readonly padding: number;
  private readonly expand: boolean;
  private readonly title: string | undefined;
  private readonly caption: string | undefined;
  private readonly style: string | undefined;
  private readonly headerStyle: string | undefined;
  private readonly rowStyles: string[] | undefined;

  constructor(options?: TableOptions) {
    this.border = options?.border ?? 'rounded';
    this.showHeader = options?.showHeader ?? true;
    this.showEdge = options?.showEdge ?? true;
    this.showLines = options?.showLines ?? false;
    this.padding = options?.padding ?? 1;
    this.expand = options?.expand ?? false;
    this.title = options?.title;
    this.caption = options?.caption;
    this.style = options?.style;
    this.headerStyle = options?.headerStyle;
    this.rowStyles = options?.rowStyles;
  }

  /** Adds a column */
  addColumn(header: string, options?: ColumnOptions): this {
    this.columns.push({ header, options: options ?? {} });
    return this;
  }

  /** Adds a row */
  addRow(...cells: (string | Renderable)[]): this {
    this.rows.push(cells);
    return this;
  }

  /** Adds a section separator */
  addSection(): this {
    this.sections.add(this.rows.length);
    return this;
  }

  render(options: RenderOptions): string[] {
    if (this.columns.length === 0) return [];

    const box = BORDER_CHARS[this.border];
    const { colorLevel } = options;
    const pad = this.padding;

    // Get cell text (parse markup for string cells)
    const headerTexts = this.columns.map((c) => encodeSpans(parse(c.header), colorLevel));
    const rowTexts = this.rows.map((row) =>
      row.map((cell) => {
        if (typeof cell === 'string') return encodeSpans(parse(cell), colorLevel);
        const rendered = cell.render(options);
        return rendered.join('\n');
      }),
    );

    // Calculate each column width
    const colWidths = this.calculateColumnWidths(headerTexts, rowTexts, options);

    const lines: string[] = [];
    const totalWidth = this.calcTotalWidth(colWidths, pad);

    // Title
    if (this.title) {
      const encodedTitle = encodeSpans(parse(this.title), colorLevel);
      const titleWidth = stringWidth(encodedTitle);
      const leftPad = Math.floor((totalWidth - titleWidth) / 2);
      lines.push(' '.repeat(Math.max(0, leftPad)) + encodedTitle);
    }

    // Top border
    if (this.showEdge) {
      lines.push(this.buildBorderLine(box.topLeft, box.horizontal, box.topMid, box.topRight, colWidths, pad));
    }

    // Header
    if (this.showHeader) {
      const headerLine = this.buildDataLine(headerTexts, colWidths, pad, box.vertical, this.headerStyle, colorLevel);
      lines.push(headerLine);

      // Header separator
      lines.push(this.buildBorderLine(box.midLeft, box.mid, box.midMid, box.midRight, colWidths, pad));
    }

    // Data rows
    for (let i = 0; i < rowTexts.length; i++) {
      if (this.sections.has(i) && i > 0) {
        lines.push(this.buildBorderLine(box.midLeft, box.mid, box.midMid, box.midRight, colWidths, pad));
      } else if (this.showLines && i > 0) {
        lines.push(this.buildBorderLine(box.midLeft, box.mid, box.midMid, box.midRight, colWidths, pad));
      }

      const rowStyle = this.rowStyles?.[i % (this.rowStyles?.length ?? 1)];
      const row = rowTexts[i] ?? [];
      const rowLine = this.buildDataLine(
        row.map(String),
        colWidths,
        pad,
        box.vertical,
        rowStyle ?? this.style,
        colorLevel,
      );
      lines.push(rowLine);
    }

    // Bottom border
    if (this.showEdge) {
      lines.push(
        this.buildBorderLine(box.bottomLeft, box.horizontal, box.bottomMid, box.bottomRight, colWidths, pad),
      );
    }

    // Caption
    if (this.caption) {
      const encodedCaption = encodeSpans(parse(this.caption), colorLevel);
      const capWidth = stringWidth(encodedCaption);
      const leftPad = Math.floor((totalWidth - capWidth) / 2);
      lines.push(' '.repeat(Math.max(0, leftPad)) + encodedCaption);
    }

    return lines;
  }

  private calculateColumnWidths(
    headers: string[],
    rows: string[][],
    options: RenderOptions,
  ): number[] {
    const numCols = this.columns.length;
    const widths = new Array<number>(numCols).fill(0);

    // Header widths
    for (let i = 0; i < numCols; i++) {
      const header = headers[i];
      if (header !== undefined) {
        widths[i] = Math.max(widths[i] ?? 0, stringWidth(header));
      }
    }

    // Max width of data rows
    for (const row of rows) {
      for (let i = 0; i < numCols; i++) {
        const cell = row[i];
        if (cell !== undefined) {
          for (const line of cell.split('\n')) {
            widths[i] = Math.max(widths[i] ?? 0, stringWidth(line));
          }
        }
      }
    }

    // Apply column option constraints
    for (let i = 0; i < numCols; i++) {
      const col = this.columns[i];
      if (!col) continue;
      const opts = col.options;
      if (opts.width !== undefined) widths[i] = opts.width;
      if (opts.minWidth !== undefined) widths[i] = Math.max(widths[i] ?? 0, opts.minWidth);
      if (opts.maxWidth !== undefined) widths[i] = Math.min(widths[i] ?? 0, opts.maxWidth);
    }

    // In expand mode, stretch to terminal width
    if (this.expand) {
      const currentTotal = this.calcTotalWidth(widths, this.padding);
      const diff = options.width - currentTotal;
      if (diff > 0) {
        const extra = Math.floor(diff / numCols);
        for (let i = 0; i < numCols; i++) {
          widths[i] = (widths[i] ?? 0) + extra;
        }
      }
    }

    return widths;
  }

  private calcTotalWidth(colWidths: number[], pad: number): number {
    const inner = colWidths.reduce((sum, w) => sum + w + pad * 2, 0);
    const borders = this.showEdge ? 2 : 0;
    const separators = colWidths.length - 1;
    return inner + borders + separators;
  }

  private buildBorderLine(
    left: string,
    horizontal: string,
    mid: string,
    right: string,
    colWidths: number[],
    pad: number,
  ): string {
    const segments = colWidths.map((w) => horizontal.repeat(w + pad * 2));
    const inner = segments.join(mid);
    return this.showEdge ? left + inner + right : inner;
  }

  private buildDataLine(
    cells: string[],
    colWidths: number[],
    pad: number,
    vertical: string,
    rowStyle: string | undefined,
    colorLevel: ColorLevel,
  ): string {
    const padStr = ' '.repeat(pad);
    const parts: string[] = [];

    for (let i = 0; i < this.columns.length; i++) {
      const col = this.columns[i];
      const cell = cells[i] ?? '';
      const colWidth = colWidths[i] ?? 0;
      const justify = col?.options?.justify ?? 'left';

      const cellWidth = stringWidth(cell);
      const remaining = Math.max(0, colWidth - cellWidth);

      let aligned: string;
      if (justify === 'right') {
        aligned = ' '.repeat(remaining) + cell;
      } else if (justify === 'center') {
        const left = Math.floor(remaining / 2);
        const right = remaining - left;
        aligned = ' '.repeat(left) + cell + ' '.repeat(right);
      } else {
        aligned = cell + ' '.repeat(remaining);
      }

      parts.push(padStr + aligned + padStr);
    }

    const inner = parts.join(vertical);
    const line = this.showEdge ? vertical + inner + vertical : inner;

    if (rowStyle) {
      const spans = parse(`[${rowStyle}]${line}[/]`);
      return encodeSpans(spans, colorLevel);
    }
    return line;
  }
}
