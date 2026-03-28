import { describe, it, expect } from 'vitest';
import { Rule } from '../../src/widgets/rule.js';
import { ColorLevel } from '../../src/types.js';
import type { RenderOptions } from '../../src/types.js';

const defaultOptions: RenderOptions = {
  width: 40,
  colorLevel: ColorLevel.None,
};

describe('Rule', () => {
  it('renders horizontal rule without title', () => {
    const rule = new Rule();
    const lines = rule.render(defaultOptions);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe('─'.repeat(40));
  });

  it('renders horizontal rule with title', () => {
    const rule = new Rule({ title: 'Section' });
    const lines = rule.render(defaultOptions);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain(' Section ');
    expect(lines[0]).toContain('─');
  });

  it('renders left-aligned title', () => {
    const rule = new Rule({ title: 'Left', align: 'left' });
    const lines = rule.render(defaultOptions);
    expect(lines[0]?.startsWith('──')).toBe(true);
    expect(lines[0]).toContain(' Left ');
  });

  it('renders right-aligned title', () => {
    const rule = new Rule({ title: 'Right', align: 'right' });
    const lines = rule.render(defaultOptions);
    expect(lines[0]?.endsWith('──')).toBe(true);
    expect(lines[0]).toContain(' Right ');
  });

  it('uses custom character', () => {
    const rule = new Rule({ character: '=' });
    const lines = rule.render(defaultOptions);
    expect(lines[0]).toBe('='.repeat(40));
  });
});
