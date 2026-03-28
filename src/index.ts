/**
 * irodori — Beautiful terminal UI for Node.js
 *
 * A unified terminal UI library inspired by Python rich
 *
 * @example
 * ```ts
 * import { console, Table, Panel, status } from 'irodori';
 *
 * console.print('[bold green]Hello[/] [italic]World[/]!');
 * ```
 */

// Type definitions
export type {
  Style,
  Color,
  StandardColor,
  RenderOptions,
  Renderable,
  BorderStyle,
  BoxChars,
  Padding,
  Token,
  Span,
  SpinnerDef,
  TaskID,
} from './types.js';

export { ColorLevel } from './types.js';

// Console
export { Console } from './console.js';
export type { ConsoleOptions, RuleOptions, ExceptionOptions } from './console.js';

// Default Console instance
import { Console } from './console.js';

/** Default Console instance */
export const console = new Console();

// Markup
export { parse, tokenize } from './markup/parser.js';
export { replaceEmoji } from './markup/emoji.js';

// ANSI
export { encodeSpan, encodeSpans } from './ansi/encoder.js';
export { stripAnsi } from './ansi/strip.js';
export { colorToAnsiCodes, hexToRgb, isStandardColor } from './ansi/colors.js';

// Layout
export { stringWidth, charWidth } from './layout/measure.js';
export { wrapText, truncateText } from './layout/wrap.js';

// Output
export { detectColorLevel, detectWidth } from './output/detector.js';

// Widgets
export { Rule } from './widgets/rule.js';
export type { RuleOptions as RuleWidgetOptions } from './widgets/rule.js';

export { Panel } from './widgets/panel.js';
export type { PanelOptions } from './widgets/panel.js';

export { Table } from './widgets/table.js';
export type { TableOptions, ColumnOptions } from './widgets/table.js';

export { BORDER_CHARS } from './widgets/borders.js';

// Live
export { Live } from './live/live.js';
export type { LiveOptions } from './live/live.js';

// Progress
export { Progress } from './progress/progress.js';
export type { ProgressColumn, ProgressOptions } from './progress/progress.js';

export { Status, status } from './progress/status.js';
export type { StatusOptions } from './progress/status.js';

export { spinners } from './progress/spinners.js';

// Progress Columns
export { BarColumn } from './progress/columns/bar.js';
export { SpinnerColumn } from './progress/columns/spinner.js';
export { TextColumn } from './progress/columns/text.js';
export { TimeElapsedColumn, TimeRemainingColumn } from './progress/columns/time.js';
export { FileSizeColumn, TransferSpeedColumn } from './progress/columns/transfer.js';
export { PercentageColumn } from './progress/columns/percentage.js';
export { MofNCompleteColumn } from './progress/columns/mofn.js';
