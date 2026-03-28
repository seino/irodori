/**
 * E2E test: Verify CJS build artifact (dist/index.cjs) works correctly
 *
 * Use createRequire to require dist/index.cjs and verify that major APIs work correctly.
 */
import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const distPath = resolve(import.meta.dirname, '../../dist/index.cjs');

describe('CJS import (dist/index.cjs)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mod: any;

  it('can require dist/index.cjs', () => {
    mod = require(distPath);
    expect(mod).toBeDefined();
  });

  // ─── Export existence check ───

  describe('major exports exist', () => {
    it('Console, Table, Panel, Rule classes', () => {
      expect(typeof mod.Console).toBe('function');
      expect(typeof mod.Table).toBe('function');
      expect(typeof mod.Panel).toBe('function');
      expect(typeof mod.Rule).toBe('function');
    });

    it('console default instance', () => {
      expect(mod.console).toBeDefined();
    });

    it('ColorLevel enum', () => {
      expect(mod.ColorLevel).toBeDefined();
      expect(mod.ColorLevel.None).toBe(0);
      expect(mod.ColorLevel.TrueColor).toBe(3);
    });

    it('Markup / ANSI / Layout utilities', () => {
      expect(typeof mod.parse).toBe('function');
      expect(typeof mod.stripAnsi).toBe('function');
      expect(typeof mod.stringWidth).toBe('function');
      expect(typeof mod.wrapText).toBe('function');
    });

    it('Progress utilities', () => {
      expect(typeof mod.Progress).toBe('function');
      expect(typeof mod.Status).toBe('function');
      expect(typeof mod.BarColumn).toBe('function');
      expect(typeof mod.PercentageColumn).toBe('function');
      expect(mod.spinners).toBeDefined();
    });

    it('Live class', () => {
      expect(typeof mod.Live).toBe('function');
    });
  });

  // ─── Console behavior ───

  describe('Console behavior', () => {
    it('outputs plain text', () => {
      const c = new mod.Console({ colorLevel: mod.ColorLevel.None, width: 80 });
      const output = c.capture(() => {
        c.print('hello from CJS');
      });
      expect(output).toBe('hello from CJS');
    });

    it('outputs markup with ColorLevel.None', () => {
      const c = new mod.Console({ colorLevel: mod.ColorLevel.None, width: 80 });
      const output = c.capture(() => {
        c.print('[bold]test[/]');
      });
      expect(output).toBe('test');
      expect(output).not.toContain('\x1b[');
    });

    it('expands emoji', () => {
      const c = new mod.Console({ colorLevel: mod.ColorLevel.None, width: 80 });
      const output = c.capture(() => {
        c.print(':fire:');
      });
      expect(output).toContain('🔥');
    });
  });

  // ─── Table behavior ───

  describe('Table behavior', () => {
    it('renders a table', () => {
      const table = new mod.Table({ border: 'ascii' });
      table.addColumn('Key');
      table.addColumn('Value');
      table.addRow('name', 'irodori');

      const lines = table.render({ width: 60, colorLevel: mod.ColorLevel.None });
      expect(lines.length).toBeGreaterThan(0);
      expect(lines.some((l: string) => l.includes('irodori'))).toBe(true);
    });
  });

  // ─── Panel behavior ───

  describe('Panel behavior', () => {
    it('renders a panel', () => {
      const panel = new mod.Panel('CJS test', { title: 'Panel' });
      const lines = panel.render({ width: 40, colorLevel: mod.ColorLevel.None });
      expect(lines.length).toBeGreaterThan(0);
      expect(lines[0]).toContain('Panel');
    });
  });

  // ─── ANSI / Layout behavior ───

  describe('utility behavior', () => {
    it('stripAnsi removes escape sequences', () => {
      expect(mod.stripAnsi('\x1b[31mred\x1b[0m')).toBe('red');
    });

    it('stringWidth returns the correct width', () => {
      expect(mod.stringWidth('hello')).toBe(5);
      expect(mod.stringWidth('\u4F60\u597D')).toBe(4);
    });

    it('parse returns an array of Spans', () => {
      const spans = mod.parse('[bold]x[/]');
      expect(Array.isArray(spans)).toBe(true);
      expect(spans[0].text).toBe('x');
    });
  });
});
