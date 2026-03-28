/**
 * E2E test: Verify ESM build artifact (dist/index.js) works correctly
 *
 * Import from the built dist/ and verify that major APIs work correctly.
 */
import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';

const distPath = resolve(import.meta.dirname, '../../dist/index.js');

describe('ESM import (dist/index.js)', () => {
  // Dynamically import from dist
  let mod: Awaited<ReturnType<typeof import('../../dist/index.js')>>;

  // Check that dist/index.js exists first, as all tests will fail without it
  it('can import dist/index.js', async () => {
    mod = await import(distPath);
    expect(mod).toBeDefined();
  });

  // ─── Export existence check ───

  describe('major exports exist', () => {
    it('Console class', () => {
      expect(typeof mod.Console).toBe('function');
    });

    it('console default instance', () => {
      expect(mod.console).toBeDefined();
      expect(mod.console).toBeInstanceOf(mod.Console);
    });

    it('ColorLevel enum', () => {
      expect(mod.ColorLevel).toBeDefined();
      expect(mod.ColorLevel.None).toBe(0);
      expect(mod.ColorLevel.TrueColor).toBe(3);
    });

    it('Markup utilities: parse, tokenize, replaceEmoji', () => {
      expect(typeof mod.parse).toBe('function');
      expect(typeof mod.tokenize).toBe('function');
      expect(typeof mod.replaceEmoji).toBe('function');
    });

    it('ANSI utilities: encodeSpan, encodeSpans, stripAnsi', () => {
      expect(typeof mod.encodeSpan).toBe('function');
      expect(typeof mod.encodeSpans).toBe('function');
      expect(typeof mod.stripAnsi).toBe('function');
    });

    it('Layout utilities: stringWidth, charWidth, wrapText, truncateText', () => {
      expect(typeof mod.stringWidth).toBe('function');
      expect(typeof mod.charWidth).toBe('function');
      expect(typeof mod.wrapText).toBe('function');
      expect(typeof mod.truncateText).toBe('function');
    });

    it('Output utilities: detectColorLevel, detectWidth', () => {
      expect(typeof mod.detectColorLevel).toBe('function');
      expect(typeof mod.detectWidth).toBe('function');
    });

    it('Widget classes: Table, Panel, Rule', () => {
      expect(typeof mod.Table).toBe('function');
      expect(typeof mod.Panel).toBe('function');
      expect(typeof mod.Rule).toBe('function');
    });

    it('BORDER_CHARS', () => {
      expect(mod.BORDER_CHARS).toBeDefined();
      expect(mod.BORDER_CHARS.rounded).toBeDefined();
    });

    it('Live class', () => {
      expect(typeof mod.Live).toBe('function');
    });

    it('Progress utilities: Progress, Status, status, spinners', () => {
      expect(typeof mod.Progress).toBe('function');
      expect(typeof mod.Status).toBe('function');
      expect(typeof mod.status).toBe('function');
      expect(mod.spinners).toBeDefined();
      expect(mod.spinners.dots).toBeDefined();
    });

    it('Progress Columns', () => {
      expect(typeof mod.BarColumn).toBe('function');
      expect(typeof mod.SpinnerColumn).toBe('function');
      expect(typeof mod.TextColumn).toBe('function');
      expect(typeof mod.TimeElapsedColumn).toBe('function');
      expect(typeof mod.TimeRemainingColumn).toBe('function');
      expect(typeof mod.FileSizeColumn).toBe('function');
      expect(typeof mod.TransferSpeedColumn).toBe('function');
      expect(typeof mod.PercentageColumn).toBe('function');
      expect(typeof mod.MofNCompleteColumn).toBe('function');
    });
  });

  // ─── Console behavior ───

  describe('Console behavior', () => {
    it('outputs plain text', () => {
      const c = new mod.Console({ colorLevel: mod.ColorLevel.None, width: 80 });
      const output = c.capture(() => {
        c.print('hello irodori');
      });
      expect(output).toBe('hello irodori');
    });

    it('outputs markup with ColorLevel.None (no ANSI)', () => {
      const c = new mod.Console({ colorLevel: mod.ColorLevel.None, width: 80 });
      const output = c.capture(() => {
        c.print('[bold red]Warning[/]: test');
      });
      expect(output).toBe('Warning: test');
      expect(output).not.toContain('\x1b[');
    });

    it('outputs markup with ColorLevel.TrueColor (with ANSI)', () => {
      const c = new mod.Console({ colorLevel: mod.ColorLevel.TrueColor, width: 80 });
      const output = c.capture(() => {
        c.print('[bold]hello[/]');
      });
      expect(output).toContain('\x1b[1m');
      expect(output).toContain('hello');
      expect(output).toContain('\x1b[0m');
    });

    it('expands emoji', () => {
      const c = new mod.Console({ colorLevel: mod.ColorLevel.None, width: 80 });
      const output = c.capture(() => {
        c.print(':fire: hot');
      });
      expect(output).toContain('🔥');
      expect(output).toContain('hot');
    });

    it('outputs a rule', () => {
      const c = new mod.Console({ colorLevel: mod.ColorLevel.None, width: 40 });
      const output = c.capture(() => {
        c.rule();
      });
      expect(output).toBe('─'.repeat(40));
    });

    it('outputs a rule with title', () => {
      const c = new mod.Console({ colorLevel: mod.ColorLevel.None, width: 40 });
      const output = c.capture(() => {
        c.rule('Section');
      });
      expect(output).toContain(' Section ');
      expect(output.length).toBeGreaterThan(0);
    });

    it('outputs a Renderable object', () => {
      const c = new mod.Console({ colorLevel: mod.ColorLevel.None, width: 80 });
      const renderable = { render: () => ['line1', 'line2'] };
      const output = c.capture(() => {
        c.print(renderable);
      });
      expect(output).toContain('line1');
      expect(output).toContain('line2');
    });

    it('outputs an error with printException', () => {
      const c = new mod.Console({ colorLevel: mod.ColorLevel.None, width: 80 });
      const error = new Error('test error');
      const output = c.capture(() => {
        c.printException(error);
      });
      expect(output).toContain('test error');
      expect(output).toContain('Error');
    });
  });

  // ─── Table behavior ───

  describe('Table behavior', () => {
    it('renders a table', () => {
      const table = new mod.Table({ border: 'ascii' });
      table.addColumn('Name');
      table.addColumn('Score', { justify: 'right' });
      table.addRow('Alice', '98');
      table.addRow('Bob', '42');

      const lines = table.render({ width: 80, colorLevel: mod.ColorLevel.None });
      expect(lines.length).toBeGreaterThan(0);
      expect(lines.some((l: string) => l.includes('Alice'))).toBe(true);
      expect(lines.some((l: string) => l.includes('98'))).toBe(true);
      expect(lines.some((l: string) => l.includes('Bob'))).toBe(true);
    });

    it('snapshot: rounded border', () => {
      const table = new mod.Table({ border: 'rounded' });
      table.addColumn('Name');
      table.addColumn('Value');
      table.addRow('color', 'red');
      table.addRow('size', '42');

      const lines = table.render({ width: 60, colorLevel: mod.ColorLevel.None });
      expect(lines).toMatchSnapshot();
    });

    it('can be built with method chaining', () => {
      const table = new mod.Table();
      const result = table.addColumn('A').addColumn('B').addRow('1', '2');
      expect(result).toBe(table);
    });
  });

  // ─── Panel behavior ───

  describe('Panel behavior', () => {
    it('renders a panel', () => {
      const panel = new mod.Panel('Hello, irodori!', { title: 'Test' });
      const lines = panel.render({ width: 40, colorLevel: mod.ColorLevel.None });
      expect(lines.length).toBeGreaterThan(0);
      expect(lines[0]).toContain('Test');
      expect(lines.some((l: string) => l.includes('Hello, irodori!'))).toBe(true);
    });

    it('snapshot: with title and subtitle', () => {
      const panel = new mod.Panel('Content here', {
        title: 'Title',
        subtitle: 'Subtitle',
        border: 'rounded',
      });
      const lines = panel.render({ width: 40, colorLevel: mod.ColorLevel.None });
      expect(lines).toMatchSnapshot();
    });
  });

  // ─── Rule behavior ───

  describe('Rule behavior', () => {
    it('renders a horizontal rule', () => {
      const rule = new mod.Rule();
      const lines = rule.render({ width: 40, colorLevel: mod.ColorLevel.None });
      expect(lines).toEqual(['─'.repeat(40)]);
    });

    it('renders a horizontal rule with title', () => {
      const rule = new mod.Rule({ title: 'Section' });
      const lines = rule.render({ width: 40, colorLevel: mod.ColorLevel.None });
      expect(lines[0]).toContain(' Section ');
    });
  });

  // ─── Markup behavior ───

  describe('Markup behavior', () => {
    it('parse returns an array of Spans', () => {
      const spans = mod.parse('[bold]hello[/]');
      expect(Array.isArray(spans)).toBe(true);
      expect(spans.length).toBeGreaterThan(0);
      expect(spans[0].text).toBe('hello');
      expect(spans[0].style.bold).toBe(true);
    });

    it('tokenize returns an array of tokens', () => {
      const tokens = mod.tokenize('[red]text[/]');
      expect(Array.isArray(tokens)).toBe(true);
      expect(tokens.length).toBeGreaterThan(0);
    });

    it('replaceEmoji converts emoji names', () => {
      expect(mod.replaceEmoji(':fire:')).toContain('🔥');
      expect(mod.replaceEmoji(':heart:')).toContain('❤️');
    });
  });

  // ─── ANSI behavior ───

  describe('ANSI behavior', () => {
    it('stripAnsi removes escape sequences', () => {
      const ansi = '\x1b[1m\x1b[31mhello\x1b[0m';
      expect(mod.stripAnsi(ansi)).toBe('hello');
    });

    it('encodeSpans generates ANSI', () => {
      const spans = mod.parse('[bold]test[/]');
      const encoded = mod.encodeSpans(spans, mod.ColorLevel.TrueColor);
      expect(encoded).toContain('\x1b[1m');
      expect(encoded).toContain('test');
    });

    it('encodeSpans does not include ANSI with ColorLevel.None', () => {
      const spans = mod.parse('[bold red]test[/]');
      const encoded = mod.encodeSpans(spans, mod.ColorLevel.None);
      expect(encoded).toBe('test');
      expect(encoded).not.toContain('\x1b[');
    });
  });

  // ─── Layout behavior ───

  describe('Layout behavior', () => {
    it('stringWidth correctly calculates ASCII character width', () => {
      expect(mod.stringWidth('hello')).toBe(5);
    });

    it('stringWidth correctly calculates CJK character width', () => {
      expect(mod.stringWidth('\u4F60\u597D\u4E16\u754C\u0021')).toBe(9);
    });

    it('wrapText wraps text', () => {
      const lines = mod.wrapText('hello world foo bar', 10);
      expect(lines.length).toBeGreaterThan(1);
    });

    it('truncateText truncates text', () => {
      const result = mod.truncateText('hello world', 8);
      expect(mod.stringWidth(result)).toBeLessThanOrEqual(8);
    });
  });

  // ─── Progress Columns behavior ───

  describe('Progress Columns behavior', () => {
    const makeTask = (completed: number, total: number | null) => ({
      id: 0 as unknown,
      description: 'test',
      total,
      completed,
      visible: true,
      startTime: Date.now() - 5000,
      fields: {},
    });

    it('BarColumn renders a progress bar', () => {
      const col = new mod.BarColumn(20);
      const task = makeTask(50, 100);
      const result = col.render(task);
      expect(result.length).toBe(20);
    });

    it('PercentageColumn returns a percentage', () => {
      const col = new mod.PercentageColumn();
      const task = makeTask(50, 100);
      expect(col.render(task)).toContain('50%');
    });

    it('MofNCompleteColumn returns n/m format', () => {
      const col = new mod.MofNCompleteColumn();
      const task = makeTask(3, 10);
      const result = col.render(task);
      expect(result).toContain('3');
      expect(result).toContain('10');
    });
  });
});
