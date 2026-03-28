import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiffRenderer } from '../../src/live/diff.js';

function createMockStream() {
  const chunks: string[] = [];
  return {
    write: vi.fn((data: string) => {
      chunks.push(data);
      return true;
    }),
    chunks,
  } as unknown as NodeJS.WriteStream & { chunks: string[] };
}

describe('DiffRenderer', () => {
  let renderer: DiffRenderer;
  let stream: NodeJS.WriteStream & { chunks: string[] };

  beforeEach(() => {
    renderer = new DiffRenderer();
    stream = createMockStream();
  });

  it('returns 0 for lineCount in initial state', () => {
    expect(renderer.lineCount).toBe(0);
  });

  it('does not call cursorUp on first write', () => {
    renderer.write(['line1', 'line2'], stream);
    const output = stream.chunks.join('');
    // should not contain cursorUp (\x1b[...A)
    expect(output).not.toMatch(/\x1b\[\d+A/);
    expect(output).toContain('line1');
    expect(output).toContain('line2');
  });

  it('updates lineCount after write', () => {
    renderer.write(['a', 'b', 'c'], stream);
    expect(renderer.lineCount).toBe(3);
  });

  it('does not call eraseLine when rewriting identical content', () => {
    renderer.write(['same'], stream);
    stream.chunks.length = 0;
    (stream.write as ReturnType<typeof vi.fn>).mockClear();

    renderer.write(['same'], stream);
    const output = stream.chunks.join('');
    // should not contain eraseLine (\x1b[2K)
    expect(output).not.toContain('\x1b[2K');
  });

  it('rewrites only changed lines with eraseLine', () => {
    renderer.write(['line1', 'line2'], stream);
    stream.chunks.length = 0;

    renderer.write(['line1', 'changed'], stream);
    const output = stream.chunks.join('');
    expect(output).toContain('changed');
  });

  it('renders correctly when line count increases', () => {
    renderer.write(['a'], stream);
    expect(renderer.lineCount).toBe(1);

    renderer.write(['a', 'b', 'c'], stream);
    expect(renderer.lineCount).toBe(3);
  });

  it('clears excess lines and adjusts cursor when line count decreases', () => {
    renderer.write(['a', 'b', 'c'], stream);
    expect(renderer.lineCount).toBe(3);

    renderer.write(['x'], stream);
    expect(renderer.lineCount).toBe(1);
  });

  it('resets lineCount to 0 after reset()', () => {
    renderer.write(['a', 'b'], stream);
    renderer.reset();
    expect(renderer.lineCount).toBe(0);
  });

  it('treats write after reset() as first write', () => {
    renderer.write(['old'], stream);
    renderer.reset();
    stream.chunks.length = 0;

    renderer.write(['new'], stream);
    const output = stream.chunks.join('');
    // should not contain cursorUp (treated as first write)
    expect(output).not.toMatch(/\x1b\[\d+A/);
  });
});
