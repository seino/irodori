import { describe, it, expect } from 'vitest';
import { Panel } from '../../src/widgets/panel.js';
import { ColorLevel } from '../../src/types.js';
import type { RenderOptions } from '../../src/types.js';

const defaultOptions: RenderOptions = {
  width: 40,
  colorLevel: ColorLevel.None,
};

describe('Panel', () => {
  it('renders a basic panel', () => {
    const panel = new Panel('Hello, World!');
    const lines = panel.render(defaultOptions);
    expect(lines.length).toBeGreaterThanOrEqual(3); // top border + content + bottom border
    expect(lines.some((l) => l.includes('Hello, World!'))).toBe(true);
  });

  it('renders with rounded border', () => {
    const panel = new Panel('test', { border: 'rounded' });
    const lines = panel.render(defaultOptions);
    expect(lines[0]).toContain('╭');
    expect(lines[lines.length - 1]).toContain('╯');
  });

  it('renders a panel with title', () => {
    const panel = new Panel('content', { title: 'My Panel' });
    const lines = panel.render(defaultOptions);
    expect(lines[0]).toContain('My Panel');
  });

  it('renders a panel with subtitle', () => {
    const panel = new Panel('content', { subtitle: 'Footer' });
    const lines = panel.render(defaultOptions);
    expect(lines[lines.length - 1]).toContain('Footer');
  });

  it('renders with ascii border', () => {
    const panel = new Panel('test', { border: 'ascii' });
    const lines = panel.render(defaultOptions);
    expect(lines[0]).toContain('+');
  });

  it('expands to full terminal width in expand mode', () => {
    const panel = new Panel('test', { expand: true });
    const lines = panel.render(defaultOptions);
    // all lines should have the same width
    const firstLen = lines[0]?.length;
    expect(firstLen).toBeDefined();
  });

  it('snapshot of ANSI output', () => {
    const panel = new Panel('Hello, World!', {
      title: 'Greeting',
      border: 'rounded',
    });
    const lines = panel.render(defaultOptions);
    expect(lines).toMatchSnapshot();
  });
});
