import { describe, it, expect } from 'vitest';
import { Console } from '../src/console.js';
import { ColorLevel } from '../src/types.js';

describe('Console', () => {
  it('outputs plain text', () => {
    const c = new Console({ colorLevel: ColorLevel.None, width: 80 });
    const output = c.capture(() => {
      c.print('hello world');
    });
    expect(output).toBe('hello world');
  });

  it('outputs markup text with ColorLevel.None', () => {
    const c = new Console({ colorLevel: ColorLevel.None, width: 80 });
    const output = c.capture(() => {
      c.print('[bold]hello[/]');
    });
    expect(output).toBe('hello');
  });

  it('outputs markup text with ColorLevel.Basic', () => {
    const c = new Console({ colorLevel: ColorLevel.Basic, width: 80 });
    const output = c.capture(() => {
      c.print('[bold]hello[/]');
    });
    expect(output).toContain('\x1b[1m');
    expect(output).toContain('hello');
    expect(output).toContain('\x1b[0m');
  });

  it('outputs a rule', () => {
    const c = new Console({ colorLevel: ColorLevel.None, width: 40 });
    const output = c.capture(() => {
      c.rule();
    });
    expect(output).toBe('─'.repeat(40));
  });

  it('outputs a rule with title', () => {
    const c = new Console({ colorLevel: ColorLevel.None, width: 40 });
    const output = c.capture(() => {
      c.rule('Test');
    });
    expect(output).toContain(' Test ');
  });

  it('outputs blank lines', () => {
    const c = new Console({ colorLevel: ColorLevel.None, width: 80 });
    const output = c.capture(() => {
      c.line(2);
    });
    expect(output).toBe('\n');
  });

  it('outputs a message with timestamp via log', () => {
    const c = new Console({ colorLevel: ColorLevel.None, width: 80 });
    const output = c.capture(() => {
      c.log('test message');
    });
    expect(output).toContain('test message');
    // contains timestamp [] (with ColorLevel.None, text is produced before markup is stripped)
  });

  it('outputs an error via printException', () => {
    const c = new Console({ colorLevel: ColorLevel.None, width: 80 });
    const error = new Error('Test error');
    const output = c.capture(() => {
      c.printException(error);
    });
    expect(output).toContain('Test error');
    expect(output).toContain('Error');
  });

  it('outputs a Renderable', () => {
    const c = new Console({ colorLevel: ColorLevel.None, width: 80 });
    const renderable = {
      render: () => ['line1', 'line2'],
    };
    const output = c.capture(() => {
      c.print(renderable);
    });
    expect(output).toContain('line1');
    expect(output).toContain('line2');
  });

  it('returns the width property', () => {
    const c = new Console({ width: 120 });
    expect(c.width).toBe(120);
  });

  it('returns the colorLevel property', () => {
    const c = new Console({ colorLevel: ColorLevel.TrueColor });
    expect(c.colorLevel).toBe(ColorLevel.TrueColor);
  });

  it('expands emoji shortcodes', () => {
    const c = new Console({ colorLevel: ColorLevel.None, width: 80 });
    const output = c.capture(() => {
      c.print(':fire: hot');
    });
    expect(output).toContain('🔥');
    expect(output).toContain('hot');
  });
});
