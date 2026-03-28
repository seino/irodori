import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectColorLevel, detectWidth } from '../../src/output/detector.js';
import { ColorLevel } from '../../src/types.js';

describe('detectColorLevel', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset environment variables
    delete process.env['FORCE_COLOR'];
    delete process.env['CI'];
    delete process.env['GITHUB_ACTIONS'];
    delete process.env['COLORTERM'];
    delete process.env['TERM'];
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns None when FORCE_COLOR=0', () => {
    process.env['FORCE_COLOR'] = '0';
    const stream = { isTTY: true } as NodeJS.WriteStream;
    expect(detectColorLevel(stream)).toBe(ColorLevel.None);
  });

  it('returns TrueColor when FORCE_COLOR=1', () => {
    process.env['FORCE_COLOR'] = '1';
    const stream = { isTTY: false } as NodeJS.WriteStream;
    expect(detectColorLevel(stream)).toBe(ColorLevel.TrueColor);
  });

  it('returns None for non-TTY', () => {
    const stream = { isTTY: false } as NodeJS.WriteStream;
    expect(detectColorLevel(stream)).toBe(ColorLevel.None);
  });

  it('returns Basic in CI environment', () => {
    process.env['CI'] = 'true';
    const stream = { isTTY: true } as NodeJS.WriteStream;
    expect(detectColorLevel(stream)).toBe(ColorLevel.Basic);
  });

  it('returns TrueColor when COLORTERM=truecolor', () => {
    process.env['COLORTERM'] = 'truecolor';
    const stream = { isTTY: true } as NodeJS.WriteStream;
    expect(detectColorLevel(stream)).toBe(ColorLevel.TrueColor);
  });

  it('returns Color256 when TERM contains 256color', () => {
    process.env['TERM'] = 'xterm-256color';
    const stream = { isTTY: true } as NodeJS.WriteStream;
    expect(detectColorLevel(stream)).toBe(ColorLevel.Color256);
  });

  it('returns None when TERM=dumb', () => {
    process.env['TERM'] = 'dumb';
    const stream = { isTTY: true } as NodeJS.WriteStream;
    expect(detectColorLevel(stream)).toBe(ColorLevel.None);
  });
});

describe('detectWidth', () => {
  it('returns stream.columns when available', () => {
    const stream = { columns: 120 } as NodeJS.WriteStream;
    expect(detectWidth(stream)).toBe(120);
  });

  it('returns fallback value when stream.columns is absent', () => {
    const stream = {} as NodeJS.WriteStream;
    expect(detectWidth(stream)).toBe(80);
    expect(detectWidth(stream, 100)).toBe(100);
  });
});
