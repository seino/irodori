# irodori — Design Document

> Bring the Python `rich` experience directly to Node.js / TypeScript as a unified terminal UI library.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Design Philosophy](#2-design-philosophy)
3. [Architecture Overview](#3-architecture-overview)
4. [Directory Structure](#4-directory-structure)
5. [Core Module Specifications](#5-core-module-specifications)
   - 5.1 [Markup Parser](#51-markup-parser)
   - 5.2 [ANSI Encoder](#52-ansi-encoder)
   - 5.3 [Console](#53-console)
   - 5.4 [Table](#54-table)
   - 5.5 [Progress](#55-progress)
   - 5.6 [Status / Spinner](#56-status--spinner)
   - 5.7 [Panel](#57-panel)
   - 5.8 [Tree](#58-tree)
   - 5.9 [Live](#59-live)
   - 5.10 [Syntax Highlight](#510-syntax-highlight)
   - 5.11 [Markdown Renderer](#511-markdown-renderer)
6. [Type Definitions](#6-type-definitions)
7. [Environment Detection & Fallback](#7-environment-detection--fallback)
8. [Error Handling Policy](#8-error-handling-policy)
9. [Testing Strategy](#9-testing-strategy)
10. [Build & Package Configuration](#10-build--package-configuration)
11. [Development Roadmap](#11-development-roadmap)

---

## 1. Project Overview

### Positioning

| Alternative | Issue |
|---|---|
| `chalk` + `ora` + `cli-table3` | No unified API; combining them is cumbersome |
| `ink` | Requires React; a TUI framework (not a drop-in library) |
| `blessed` / `neo-blessed` | Complex widget API; maintenance stalled |
| **irodori** | All-in-one package; just `import` and use |

### Goals

```ts
// Before: combining multiple libraries
import chalk from 'chalk'
import ora from 'ora'
import Table from 'cli-table3'

// After: just this
import { console, Table, Progress, status } from 'irodori'
console.print('[bold green]Hello[/] [italic]World[/]!')
```

### Non-Goals

- Full TUI (interactive widgets, keyboard input handling)
- Browser support (Node.js 18+ only)
- Replacement for `ink` / `blessed` (this is an output library, not a framework)

---

## 2. Design Philosophy

### 2.1 Copy-Paste Ready (Zero Config)

Minimal code, maximum output quality. Works with zero configuration; customize only when needed.

```ts
// Just this to get started
import { console } from 'irodori'
console.print('[bold red]Error:[/] Something went wrong')
```

### 2.2 Renderable Interface

All output objects (Table, Panel, Tree, Syntax...) implement `Renderable`. `console.print()` accepts any Renderable.

```ts
interface Renderable {
  render(options: RenderOptions): string[]  // Returns array of ANSI-encoded lines
}
```

### 2.3 Python rich API Compatibility

Method names and parameter names follow rich as closely as possible, making it easy for Python users to transition.

### 2.4 Zero Dependencies (Core)

Core functionality has zero external dependencies. Optional features (Syntax Highlight, etc.) also use lightweight in-house implementations wherever possible.

### 2.5 Fail Silent

Automatically disables ANSI in CI and non-TTY environments. Never crashes.

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Public API                    │
│  console  Table  Progress  status  Live  Panel  │
│  Tree  Syntax  Markdown  Columns                │
└──────────────────┬──────────────────────────────┘
                   │ implements Renderable
┌──────────────────▼──────────────────────────────┐
│                Renderer Layer                   │
│  MarkupParser  → StyleResolver  → AnsiEncoder   │
│  LayoutEngine (width calculation & wrapping)    │
│  DiffRenderer (diff updates for Live)           │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│               Output Layer                      │
│  TtyDetector  ColorLevel  TerminalSize          │
│  CursorController  StreamWriter                 │
└─────────────────────────────────────────────────┘
```

### Data Flow

```
console.print(renderable)
  → renderable.render(options)    // Generate array of lines
  → MarkupParser.parse(text)      // Decompose markup into Span[]
  → StyleResolver.resolve(spans)  // Flatten styles
  → AnsiEncoder.encode(spans)     // Convert to ANSI escape strings
  → StreamWriter.write(lines)     // Write to process.stdout
```

---

## 4. Directory Structure

```
packages/rich/
├── src/
│   ├── index.ts                 # Public exports
│   ├── console.ts               # Console class
│   │
│   ├── markup/
│   │   ├── parser.ts            # Markup → Token[]
│   │   ├── style.ts             # Style type & merge logic
│   │   └── emoji.ts             # :emoji_name: → Unicode
│   │
│   ├── ansi/
│   │   ├── encoder.ts           # Style → ANSI escape sequences
│   │   ├── colors.ts            # Color name / hex → ANSI code conversion
│   │   └── strip.ts             # ANSI escape stripping utility
│   │
│   ├── layout/
│   │   ├── measure.ts           # Display width calculation (fullwidth & emoji aware)
│   │   └── wrap.ts              # Word wrapping logic
│   │
│   ├── widgets/
│   │   ├── table.ts             # Table class
│   │   ├── panel.ts             # Panel class
│   │   ├── tree.ts              # Tree / TreeNode class
│   │   ├── columns.ts           # Columns class
│   │   └── rule.ts              # Horizontal rule
│   │
│   ├── progress/
│   │   ├── progress.ts          # Progress class
│   │   ├── task.ts              # Task type
│   │   ├── columns/
│   │   │   ├── bar.ts           # BarColumn
│   │   │   ├── spinner.ts       # SpinnerColumn
│   │   │   ├── text.ts          # TextColumn
│   │   │   ├── time.ts          # TimeElapsed / TimeRemaining
│   │   │   └── transfer.ts      # TransferSpeed / FileSize
│   │   └── spinners.ts          # cli-spinners compatible data
│   │
│   ├── live/
│   │   ├── live.ts              # Live class
│   │   └── diff.ts              # Diff calculation & cursor control
│   │
│   ├── syntax/
│   │   ├── syntax.ts            # Syntax class
│   │   ├── lexer/
│   │   │   ├── base.ts          # Lexer base class
│   │   │   ├── javascript.ts    # JS/TS lexer
│   │   │   ├── python.ts        # Python lexer
│   │   │   ├── json.ts          # JSON lexer
│   │   │   └── bash.ts          # Bash lexer
│   │   └── themes/
│   │       ├── monokai.ts
│   │       └── github_dark.ts
│   │
│   ├── markdown/
│   │   └── renderer.ts          # Markdown → Renderable
│   │
│   └── output/
│       ├── detector.ts          # TTY / CI / ColorLevel detection
│       ├── cursor.ts            # Cursor control (ANSI)
│       └── writer.ts            # StreamWriter
│
├── tests/
│   ├── markup/
│   ├── layout/
│   ├── widgets/
│   └── progress/
│
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 5. Core Module Specifications

### 5.1 Markup Parser

**Role**: Converts `[bold red]text[/bold red]` format strings into `Span[]`.

#### Token Structure

```ts
type Token =
  | { type: 'text';  value: string }
  | { type: 'open';  tags: string[] }   // [bold red] → ['bold', 'red']
  | { type: 'close'; tags: string[] }   // [/bold] → ['bold'], [/] → []

interface Span {
  text:  string
  style: Style
}
```

#### Parse Rules

| Input | Interpretation |
|---|---|
| `[bold]` | bold: true |
| `[red]` | color: 'red' |
| `[bold red]` | bold: true, color: 'red' |
| `[#ff0000]` | color: '#ff0000' |
| `[on blue]` | bgColor: 'blue' |
| `[link=https://...]` | link: 'https://...' |
| `[/]` | Close all preceding styles |
| `[/bold]` | Close bold only |
| `\[` | Literal `[` |

#### Implementation Approach

- Hand-written recursive descent parser (not regex-based)
- Styles managed via a stack; close tags pop from the stack
- Invalid tags treated as text; no exceptions thrown

```ts
// src/markup/parser.ts
export function parse(markup: string): Span[] {
  const tokens = tokenize(markup)
  const styleStack: Style[] = [{}]
  const spans: Span[] = []

  for (const token of tokens) {
    if (token.type === 'text') {
      spans.push({ text: token.value, style: mergeStyles(styleStack) })
    } else if (token.type === 'open') {
      styleStack.push(parseStyle(token.tags))
    } else if (token.type === 'close') {
      if (styleStack.length > 1) styleStack.pop()
    }
  }
  return spans
}
```

---

### 5.2 ANSI Encoder

**Role**: Converts `Span[]` to ANSI escape-encoded strings.

#### Color Level Support

```ts
enum ColorLevel {
  None     = 0,  // CI / pipe
  Basic    = 1,  // 16 colors
  Color256 = 2,  // 256 colors
  TrueColor = 3, // 24-bit
}
```

#### Color Conversion Table (excerpt)

| Name | Basic (fg) | 256 code | TrueColor hex |
|---|---|---|---|
| black | 30 | 0 | #000000 |
| red | 31 | 1 | #cc0000 |
| green | 32 | 2 | #00cc00 |
| ... | ... | ... | ... |

#### ANSI Code Generation

```ts
// src/ansi/encoder.ts
export function encodeSpan(span: Span, level: ColorLevel): string {
  if (level === ColorLevel.None) return span.text

  const codes: number[] = []
  const s = span.style

  if (s.bold)          codes.push(1)
  if (s.italic)        codes.push(3)
  if (s.underline)     codes.push(4)
  if (s.strikethrough) codes.push(9)
  if (s.color)         codes.push(...colorCode(s.color, level, false))
  if (s.bgColor)       codes.push(...colorCode(s.bgColor, level, true))

  if (codes.length === 0) return span.text
  return `\x1b[${codes.join(';')}m${span.text}\x1b[0m`
}
```

---

### 5.3 Console

**Role**: The main entry point. Equivalent to Python rich's `Console` class.

#### API

```ts
class Console {
  constructor(options?: ConsoleOptions)

  // Basic output
  print(...renderables: (string | Renderable)[]): void
  log(message: string, ...args: unknown[]): void   // With timestamp
  rule(title?: string, options?: RuleOptions): void
  line(count?: number): void

  // Status
  status(message: string, fn: () => Promise<void>, options?: StatusOptions): Promise<void>

  // Error
  print_exception(error: Error, options?: ExceptionOptions): void

  // Utilities
  get width(): number
  get colorLevel(): ColorLevel
  capture(): CaptureContext  // Capture output as string (for testing)
}

interface ConsoleOptions {
  stdout?:          NodeJS.WriteStream  // default: process.stdout
  stderr?:          NodeJS.WriteStream  // default: process.stderr
  forceTerminal?:   boolean
  colorLevel?:      ColorLevel
  width?:           number              // Auto-detected if not specified
  highlightNumbers?: boolean            // Auto-colorize numbers
}
```

#### Global Instance

```ts
// Import and use the default console directly
export const console = new Console()

// Or create your own instance
const myConsole = new Console({ width: 80, colorLevel: ColorLevel.Basic })
```

---

### 5.4 Table

**Role**: Build and render bordered tables.

#### API

```ts
class Table implements Renderable {
  constructor(options?: TableOptions)

  addColumn(header: string, options?: ColumnOptions): this
  addRow(...cells: (string | Renderable)[]): this
  addSection(): this  // Section separator line

  render(options: RenderOptions): string[]
}

interface TableOptions {
  title?:       string
  caption?:     string
  border?:      BorderStyle    // 'ascii' | 'markdown' | 'simple' | 'rounded' | 'heavy' | 'double' | 'none'
  showHeader?:  boolean        // default: true
  showEdge?:    boolean        // default: true
  showLines?:   boolean        // default: false (draw lines between rows)
  padding?:     number         // default: 1
  expand?:      boolean        // default: false (expand to terminal width)
  style?:       string         // Style for the entire table
  headerStyle?: string
  rowStyles?:   string[]       // Alternating row styles
  box?:         BoxChars       // Fully custom border characters
}

interface ColumnOptions {
  style?:     string
  headerStyle?: string
  justify?:   'left' | 'center' | 'right'   // default: 'left'
  width?:     number          // Fixed width
  minWidth?:  number
  maxWidth?:  number
  noWrap?:    boolean
  ratio?:     number          // Width ratio (flex-like behavior)
  overflow?:  'fold' | 'crop' | 'ellipsis' | 'ignore'
}
```

#### Width Calculation Algorithm

```
1. Calculate min_content_width (minimum width without wrapping) for each column
2. terminal_width - padding - border_chars = available_width
3. Distribute ratio-specified columns proportionally
4. Reserve fixed-width columns
5. Distribute remainder equally based on content
6. Wrap columns exceeding maxWidth (according to overflow setting)
```

#### Border Style Examples

```
rounded:          ascii:            simple:
╭──────┬──────╮  +------+------+    Name    Score
│ Name │Score │  | Name | Score|   ──────  ───────
├──────┼──────┤  +------+------+    Alice      98
│Alice │   98 │  | Alice|    98|    Bob        42
│Bob   │   42 │  | Bob  |    42|
╰──────┴──────╯  +------+------+
```

---

### 5.5 Progress

**Role**: Display progress for multiple tasks simultaneously.

#### API

```ts
class Progress implements Renderable {
  constructor(columns?: ProgressColumn[], options?: ProgressOptions)

  // Task management
  addTask(description: string, options?: TaskOptions): TaskID
  removeTask(id: TaskID): void
  updateTask(id: TaskID, options: Partial<TaskOptions>): void
  advance(id: TaskID, advance?: number): void

  // Lifecycle
  start(): void
  stop(): void
  refresh(): void

  // Static factory
  static run<T>(fn: (p: Progress) => Promise<T>, options?: ProgressOptions): Promise<T>

  // Iterator integration
  static track<T>(
    iterable: Iterable<T> | AsyncIterable<T>,
    options?: TrackOptions
  ): AsyncGenerator<T>

  get finished(): boolean
  render(options: RenderOptions): string[]
}

interface TaskOptions {
  total?:       number          // null = indeterminate (pulse bar)
  completed?:   number          // default: 0
  visible?:     boolean         // default: true
  description?: string
  fields?:      Record<string, unknown>  // Custom fields
}
```

#### Default Column Configuration

```ts
Progress.getDefaultColumns()
// → [SpinnerColumn, TextColumn("{task.description}"), BarColumn, TimeRemainingColumn]
```

#### Built-in Columns

| Class | Display |
|---|---|
| `SpinnerColumn` | Spinner animation |
| `BarColumn` | Progress bar `━━━━━━━━░░░░` |
| `TextColumn` | Text (with template variable support) |
| `PercentageColumn` | `100%` |
| `TimeElapsedColumn` | `0:01:23` |
| `TimeRemainingColumn` | `-0:00:45` |
| `FileSizeColumn` | `1.2 MB` |
| `TransferSpeedColumn` | `1.2 MB/s` |
| `MofNCompleteColumn` | `42/100` |

#### Creating Custom Columns

```ts
abstract class ProgressColumn {
  abstract render(task: Task, options: RenderOptions): string
  maxWidth?: number
  noWrap?: boolean
}

// Example: custom ETA column
class CustomETAColumn extends ProgressColumn {
  render(task: Task): string {
    if (!task.timeRemaining) return '?'
    return `ETA: ${formatDuration(task.timeRemaining)}`
  }
}
```

#### Display Update Mechanism

```
1. Call refresh() via setInterval(16ms)
2. Generate lines for all tasks with render()
3. Use Live's DiffRenderer to rewind cursor and rewrite only changed lines
4. On stop(), move cursor to final line and clear the timer
```

---

### 5.6 Status / Spinner

**Role**: Display a spinner for operations with indeterminate wait time.

#### API

```ts
// Function form (recommended)
async function status<T>(
  message: string,
  fn: () => Promise<T>,
  options?: StatusOptions
): Promise<T>

// Class form (manual control)
class Status {
  constructor(message: string, options?: StatusOptions)
  start(): void
  stop(): void
  update(message: string): void
}

interface StatusOptions {
  spinner?:      string          // Spinner name (default: 'dots')
  spinnerStyle?: string          // Style (default: 'green')
  speed?:        number          // Speed multiplier (default: 1.0)
}
```

#### Spinner Catalog (excerpt)

Includes all cli-spinners (80+ types).

```ts
// src/progress/spinners.ts
export const spinners = {
  dots:     { interval: 80,  frames: ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'] },
  dots2:    { interval: 80,  frames: ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷'] },
  line:     { interval: 130, frames: ['-','\\','|','/'] },
  bouncingBar: { ... },
  clock:    { ... },
  // ...80+
} satisfies Record<string, SpinnerDef>
```

---

### 5.7 Panel

**Role**: Wrap content in a titled bordered box.

#### API

```ts
class Panel implements Renderable {
  constructor(renderable: string | Renderable, options?: PanelOptions)
  render(options: RenderOptions): string[]
}

interface PanelOptions {
  title?:        string
  subtitle?:     string         // Bottom title
  border?:       BorderStyle
  style?:        string         // Border style
  titleAlign?:   'left' | 'center' | 'right'
  padding?:      Padding        // number | [top, right, bottom, left]
  expand?:       boolean
  width?:        number
}
```

---

### 5.8 Tree

**Role**: Display hierarchical data with guide lines.

#### API

```ts
class Tree implements Renderable {
  constructor(label: string | Renderable, options?: TreeOptions)

  add(label: string | Renderable): Tree   // Add child node and return it
  render(options: RenderOptions): string[]
}

// Usage example
const tree = new Tree('[bold]src/[/]')
const widgets = tree.add('widgets/')
widgets.add('table.ts')
widgets.add('panel.ts')
tree.add('index.ts')
console.print(tree)

// Output:
// src/
// ├── widgets/
// │   ├── table.ts
// │   └── panel.ts
// └── index.ts
```

---

### 5.9 Live

**Role**: Continuously update the same terminal region with diff-based rendering. Also serves as the foundation for Progress.

#### API

```ts
class Live {
  constructor(renderable?: Renderable, options?: LiveOptions)

  update(renderable: Renderable | string): void
  refresh(): void
  start(): void
  stop(clear?: boolean): void

  static run<T>(
    fn: (live: Live) => Promise<T>,
    options?: LiveOptions
  ): Promise<T>
}

interface LiveOptions {
  refreshRate?:  number    // ms (default: 16 ≈ 60fps)
  transient?:    boolean   // Clear display on stop (default: false)
  screen?:       boolean   // Use alternate screen buffer
  autoRefresh?:  boolean   // default: true
}
```

#### Diff Rendering Mechanism

```ts
// src/live/diff.ts

class DiffRenderer {
  private lastLines: string[] = []

  write(newLines: string[], stream: NodeJS.WriteStream): void {
    const diff = this.computeDiff(this.lastLines, newLines)

    // Rewind cursor to beginning of previous frame
    if (this.lastLines.length > 0) {
      stream.write(cursor.up(this.lastLines.length))
      stream.write(cursor.toColumn(0))
    }

    for (const { line, changed } of diff) {
      if (changed) {
        stream.write(eraseCurrentLine())
        stream.write(line + '\n')
      } else {
        stream.write(cursor.down(1))
      }
    }

    this.lastLines = newLines
  }
}
```

---

### 5.10 Syntax Highlight

**Role**: Display source code with syntax highlighting in the terminal.

#### API

```ts
class Syntax implements Renderable {
  constructor(code: string, language: Language, options?: SyntaxOptions)
  render(options: RenderOptions): string[]
}

type Language = 'javascript' | 'typescript' | 'python' | 'json' | 'bash' | 'css' | 'html' | 'plain'

interface SyntaxOptions {
  theme?:        Theme           // 'monokai' | 'github_dark' | 'nord' | ... (default: 'monokai')
  lineNumbers?:  boolean         // default: false
  highlight?:    number[]        // Line numbers to highlight
  startLine?:    number          // Starting line number (default: 1)
  indent?:       number          // Indent width (display only)
  word_wrap?:    boolean         // default: false
}
```

#### Lexer Design

Lightweight regex-based lexer. Does not use highlight.js (too heavy).

```ts
// src/syntax/lexer/base.ts
interface Token {
  type: TokenType
  value: string
}

type TokenType =
  | 'keyword' | 'string' | 'number' | 'comment'
  | 'operator' | 'punctuation' | 'identifier'
  | 'builtin' | 'decorator' | 'type' | 'whitespace'

abstract class Lexer {
  abstract tokenize(code: string): Token[]
}

// JavaScript lexer implementation example
const JS_KEYWORDS = new Set([
  'const','let','var','function','class','return','if','else',
  'for','while','import','export','default','async','await','new',
  'typeof','instanceof','void','delete','in','of','from','try',
  'catch','finally','throw','break','continue','switch','case'
])
```

#### Theme Definition

```ts
// src/syntax/themes/monokai.ts
export const monokai: Theme = {
  name: 'monokai',
  colors: {
    keyword:     '#F92672',
    string:      '#E6DB74',
    number:      '#AE81FF',
    comment:     '#75715E',
    operator:    '#F8F8F2',
    builtin:     '#66D9EF',
    type:        '#66D9EF',
    decorator:   '#A6E22E',
    identifier:  '#F8F8F2',
    punctuation: '#F8F8F2',
    background:  '#272822',
    lineNumber:  '#75715E',
    highlight:   '#3E3D32',
  }
}
```

---

### 5.11 Markdown Renderer

**Role**: Render Markdown text in the terminal.

#### Supported Elements

| Markdown | Terminal Rendering |
|---|---|
| `# Heading 1` | bold + underline + rule |
| `## Heading 2` | bold + underline |
| `**bold**` | bold |
| `*italic*` | italic |
| `` `code` `` | Red monospace |
| ```` ```js ```` | Syntax block |
| `- list` | `• item` (with indentation) |
| `> quote` | Vertical bar + italic |
| `---` | Rule |
| `[text](url)` | text (url shown dimmed after) |
| `| table |` | Rendered with Table component |

---

## 6. Type Definitions

```ts
// src/types.ts

export interface Style {
  bold?:          boolean
  italic?:        boolean
  underline?:     boolean
  strikethrough?: boolean
  reverse?:       boolean
  blink?:         boolean
  color?:         Color
  bgColor?:       Color
  link?:          string
}

export type Color =
  | StandardColor        // 'red' | 'green' | 'blue' | ...
  | `#${string}`         // hex
  | `rgb(${number},${number},${number})`
  | number               // 256-color index

export type StandardColor =
  | 'black' | 'red' | 'green' | 'yellow' | 'blue'
  | 'magenta' | 'cyan' | 'white'
  | 'bright_black' | 'bright_red' | 'bright_green' | 'bright_yellow'
  | 'bright_blue' | 'bright_magenta' | 'bright_cyan' | 'bright_white'

export interface RenderOptions {
  width:       number
  colorLevel:  ColorLevel
  highlightNumbers: boolean
}

export interface Renderable {
  render(options: RenderOptions): string[]
}

export type BorderStyle =
  | 'ascii' | 'markdown' | 'simple' | 'minimal'
  | 'horizontals' | 'rounded' | 'heavy' | 'double' | 'none'

export type Padding =
  | number
  | [number, number]          // [vertical, horizontal]
  | [number, number, number, number]  // [top, right, bottom, left]

export type TaskID = number & { readonly __brand: 'TaskID' }
```

---

## 7. Environment Detection & Fallback

### Auto Color Level Detection

```ts
// src/output/detector.ts

export function detectColorLevel(stream: NodeJS.WriteStream): ColorLevel {
  // Force None in CI (can be overridden with FORCE_COLOR)
  if (process.env.FORCE_COLOR === '0') return ColorLevel.None
  if (process.env.FORCE_COLOR)         return ColorLevel.TrueColor

  // Non-TTY (pipe / redirect) → None
  if (!stream.isTTY) return ColorLevel.None

  // CI / known environment detection
  if (process.env.CI)                       return ColorLevel.Basic
  if (process.env.GITHUB_ACTIONS)           return ColorLevel.Basic
  if (process.env.TERM === 'dumb')          return ColorLevel.None

  // TrueColor detection via COLORTERM
  const colorterm = process.env.COLORTERM?.toLowerCase()
  if (colorterm === 'truecolor' || colorterm === '24bit') return ColorLevel.TrueColor

  // 256-color detection via TERM
  const term = process.env.TERM ?? ''
  if (term.includes('256color')) return ColorLevel.Color256

  return ColorLevel.Basic
}
```

### Terminal Width Detection

```ts
export function detectWidth(stream: NodeJS.WriteStream, fallback = 80): number {
  return stream.columns ?? fallback
}

// Track resize via SIGWINCH
process.on('SIGWINCH', () => {
  consoleInstance.invalidateWidth()
})
```

---

## 8. Error Handling Policy

### Principles

- **Internal library errors must never crash the user's process**
- Rendering errors write minimal logs to `process.stderr` and fall back gracefully
- Invalid markup tags are treated as text (no exceptions)

### print_exception

```ts
console.print_exception(error, {
  showLocals?: boolean,   // Display local variables (future implementation)
  width?: number,
  extra_lines?: number,   // Lines of context around error (default: 3)
  theme?: Theme,
})

// Output example:
// ╭─ TypeError ─────────────────────────────────────────╮
// │ Cannot read properties of undefined (reading 'map') │
// ╰─────────────────────────────────────────────────────╯
//   File src/widgets/table.ts, line 42, in addRow
//
//    40 │ addRow(...cells: (string | Renderable)[]) {
//    41 │   const row = cells.map((cell, i) => {
//  > 42 │     return this.columns[i].format(cell)
//    43 │   })
//    44 │ }
```

---

## 9. Testing Strategy

### Test Runner: Vitest

### Unit Tests

```ts
// tests/markup/parser.test.ts
import { describe, it, expect } from 'vitest'
import { parse } from '../../src/markup/parser'

describe('parse', () => {
  it('parses bold tag', () => {
    expect(parse('[bold]hello[/]')).toEqual([
      { text: 'hello', style: { bold: true } }
    ])
  })

  it('merges nested styles', () => {
    expect(parse('[bold][red]x[/][/]')).toEqual([
      { text: 'x', style: { bold: true, color: 'red' } }
    ])
  })

  it('treats invalid tags as text', () => {
    expect(parse('[not_a_tag]')).toEqual([
      { text: '[not_a_tag]', style: {} }
    ])
  })
})
```

### Snapshot Tests (ANSI Output)

```ts
// tests/widgets/table.test.ts
import { Console } from '../../src/console'

it('matches Table ANSI output snapshot', () => {
  const c = new Console({ colorLevel: ColorLevel.None })
  const output = c.capture(() => {
    const t = new Table({ border: 'rounded' })
    t.addColumn('Name')
    t.addColumn('Score', { justify: 'right' })
    t.addRow('Alice', '98')
    c.print(t)
  })
  expect(output).toMatchSnapshot()
})
```

### Visual Regression Tests

Manage captured strings from `Console.capture()` in `.snap` files.
Review diffs in PRs on CI.

---

## 10. Build & Package Configuration

### package.json

```json
{
  "name": "irodori",
  "version": "0.1.0",
  "description": "Beautiful terminal UI for Node.js — irodori",
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "engines": { "node": ">=18.0.0" },
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.4.0",
    "tsup": "^8.0.0",
    "vitest": "^1.6.0"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "typecheck": "tsc --noEmit"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### tsup.config.ts

```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  target: 'node18',
})
```

---

## 11. Development Roadmap

### Phase 1 — MVP

Implementation follows dependency order.

```
Week 1-2: Foundation
  [x] src/output/detector.ts   (TTY/ColorLevel detection)
  [x] src/ansi/encoder.ts      (ANSI escape sequences)
  [x] src/ansi/colors.ts       (Color conversion)
  [x] src/layout/measure.ts    (Display width calculation, fullwidth aware)

Week 3-4: Markup + Console
  [x] src/markup/parser.ts     (Markup parser)
  [x] src/markup/emoji.ts      (Emoji map)
  [x] src/console.ts           (Console class)

Week 5-6: Table + Panel
  [x] src/widgets/rule.ts
  [x] src/widgets/panel.ts
  [x] src/widgets/table.ts

Week 7-8: Progress + Status
  [x] src/progress/spinners.ts
  [x] src/live/diff.ts         (Diff rendering)
  [x] src/live/live.ts
  [x] src/progress/progress.ts
  [x] src/progress/columns/

Week 9-10: Stabilization
  [x] Test suite & snapshots
  [x] README + documentation
  [x] npm publish
```

### Phase 2 — Growth

- `Syntax` class + JS/TS/Python/JSON/Bash Lexer
- `Tree` class
- `Markdown` renderer
- `Columns` (side-by-side layout)
- `Layout` / `Align` (alignment utilities)

### Phase 3 — JS-Specific Differentiation

- `Pretty Errors` (stack traces with source context)
- `Stream-aware Progress` (direct `ReadableStream` integration)
- `JSON Inspector` (collapsible JSON viewer)
- Plugin API
- `irodori/testing` test utility package

---

*Last updated: 2026-03-20*
*Author: @seino*
