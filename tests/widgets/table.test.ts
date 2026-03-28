import { describe, it, expect } from 'vitest';
import { Table } from '../../src/widgets/table.js';
import { ColorLevel } from '../../src/types.js';
import type { RenderOptions } from '../../src/types.js';

const defaultOptions: RenderOptions = {
  width: 80,
  colorLevel: ColorLevel.None,
};

describe('Table', () => {
  it('returns empty array for empty table', () => {
    const table = new Table();
    expect(table.render(defaultOptions)).toEqual([]);
  });

  it('renders a table with headers only', () => {
    const table = new Table({ border: 'ascii' });
    table.addColumn('Name');
    table.addColumn('Score');
    const lines = table.render(defaultOptions);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.some((l) => l.includes('Name'))).toBe(true);
    expect(lines.some((l) => l.includes('Score'))).toBe(true);
  });

  it('renders a table with data rows', () => {
    const table = new Table({ border: 'ascii' });
    table.addColumn('Name');
    table.addColumn('Score');
    table.addRow('Alice', '98');
    table.addRow('Bob', '42');
    const lines = table.render(defaultOptions);
    expect(lines.some((l) => l.includes('Alice'))).toBe(true);
    expect(lines.some((l) => l.includes('98'))).toBe(true);
    expect(lines.some((l) => l.includes('Bob'))).toBe(true);
    expect(lines.some((l) => l.includes('42'))).toBe(true);
  });

  it('renders right-aligned columns', () => {
    const table = new Table({ border: 'ascii' });
    table.addColumn('Name');
    table.addColumn('Score', { justify: 'right' });
    table.addRow('Alice', '98');
    const lines = table.render(defaultOptions);
    const scoreLine = lines.find((l) => l.includes('98'));
    expect(scoreLine).toBeDefined();
  });

  it('renders with rounded border', () => {
    const table = new Table({ border: 'rounded' });
    table.addColumn('Name');
    table.addRow('Alice');
    const lines = table.render(defaultOptions);
    expect(lines[0]).toContain('╭');
    expect(lines[lines.length - 1]).toContain('╯');
  });

  it('renders with none border', () => {
    const table = new Table({ border: 'none' });
    table.addColumn('Name');
    table.addRow('Alice');
    const lines = table.render(defaultOptions);
    expect(lines.some((l) => l.includes('Alice'))).toBe(true);
  });

  it('supports method chaining', () => {
    const table = new Table();
    const result = table.addColumn('A').addColumn('B').addRow('1', '2');
    expect(result).toBe(table);
  });

  it('renders a table with title', () => {
    const table = new Table({ title: 'Test Table', border: 'ascii' });
    table.addColumn('Name');
    table.addRow('Alice');
    const lines = table.render(defaultOptions);
    expect(lines[0]).toContain('Test Table');
  });

  it('renders a table with caption', () => {
    const table = new Table({ caption: 'Source: test', border: 'ascii' });
    table.addColumn('Name');
    table.addRow('Alice');
    const lines = table.render(defaultOptions);
    expect(lines[lines.length - 1]).toContain('Source: test');
  });

  it('snapshot of ANSI output', () => {
    const table = new Table({ border: 'rounded' });
    table.addColumn('Name');
    table.addColumn('Score', { justify: 'right' });
    table.addRow('Alice', '98');
    table.addRow('Bob', '42');
    const lines = table.render(defaultOptions);
    expect(lines).toMatchSnapshot();
  });
});
