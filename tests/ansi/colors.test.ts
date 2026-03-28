import { describe, it, expect } from 'vitest';
import { colorToAnsiCodes, hexToRgb, isStandardColor } from '../../src/ansi/colors.js';
import { ColorLevel } from '../../src/types.js';

describe('isStandardColor', () => {
  it('recognizes standard color names', () => {
    expect(isStandardColor('red')).toBe(true);
    expect(isStandardColor('bright_green')).toBe(true);
    expect(isStandardColor('black')).toBe(true);
  });

  it('rejects non-standard color names', () => {
    expect(isStandardColor('orange')).toBe(false);
    expect(isStandardColor('xxx')).toBe(false);
  });
});

describe('hexToRgb', () => {
  it('converts 6-digit hex to RGB', () => {
    expect(hexToRgb('#ff0000')).toEqual([255, 0, 0]);
    expect(hexToRgb('#00ff00')).toEqual([0, 255, 0]);
    expect(hexToRgb('#0000ff')).toEqual([0, 0, 255]);
  });

  it('converts 3-digit hex to RGB', () => {
    expect(hexToRgb('#f00')).toEqual([255, 0, 0]);
    expect(hexToRgb('#0f0')).toEqual([0, 255, 0]);
  });

  it('works without # prefix', () => {
    expect(hexToRgb('ff0000')).toEqual([255, 0, 0]);
  });
});

describe('colorToAnsiCodes', () => {
  it('returns empty array for ColorLevel.None', () => {
    expect(colorToAnsiCodes('red', ColorLevel.None, false)).toEqual([]);
  });

  it('converts standard color to Basic level fg code', () => {
    expect(colorToAnsiCodes('red', ColorLevel.Basic, false)).toEqual([31]);
    expect(colorToAnsiCodes('green', ColorLevel.Basic, false)).toEqual([32]);
  });

  it('converts standard color to Basic level bg code', () => {
    expect(colorToAnsiCodes('red', ColorLevel.Basic, true)).toEqual([41]);
    expect(colorToAnsiCodes('blue', ColorLevel.Basic, true)).toEqual([44]);
  });

  it('outputs standard color as RGB at TrueColor level', () => {
    const codes = colorToAnsiCodes('red', ColorLevel.TrueColor, false);
    expect(codes[0]).toBe(38);
    expect(codes[1]).toBe(2);
    expect(codes.length).toBe(5);
  });

  it('converts hex color at TrueColor level', () => {
    expect(colorToAnsiCodes('#ff0000', ColorLevel.TrueColor, false)).toEqual([38, 2, 255, 0, 0]);
    expect(colorToAnsiCodes('#ff0000', ColorLevel.TrueColor, true)).toEqual([48, 2, 255, 0, 0]);
  });

  it('converts hex color at 256-color level', () => {
    const codes = colorToAnsiCodes('#ff0000', ColorLevel.Color256, false);
    expect(codes[0]).toBe(38);
    expect(codes[1]).toBe(5);
    expect(codes.length).toBe(3);
  });

  it('converts 256-color index at Color256 level', () => {
    expect(colorToAnsiCodes(196, ColorLevel.Color256, false)).toEqual([38, 5, 196]);
    expect(colorToAnsiCodes(196, ColorLevel.Color256, true)).toEqual([48, 5, 196]);
  });
});
