/**
 * Color name / hex to ANSI code conversion
 */
import type { Color, StandardColor } from '../types.js';
import { ColorLevel } from '../types.js';

type RGB = [number, number, number];

/** Standard color to Basic (fg) code */
const STANDARD_FG: Record<StandardColor, number> = {
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
  bright_black: 90,
  bright_red: 91,
  bright_green: 92,
  bright_yellow: 93,
  bright_blue: 94,
  bright_magenta: 95,
  bright_cyan: 96,
  bright_white: 97,
};

/** Standard color to Basic (bg) code */
const STANDARD_BG: Record<StandardColor, number> = {
  black: 40,
  red: 41,
  green: 42,
  yellow: 43,
  blue: 44,
  magenta: 45,
  cyan: 46,
  white: 47,
  bright_black: 100,
  bright_red: 101,
  bright_green: 102,
  bright_yellow: 103,
  bright_blue: 104,
  bright_magenta: 105,
  bright_cyan: 106,
  bright_white: 107,
};

/** Standard color to RGB (for TrueColor fallback) */
const STANDARD_RGB: Record<StandardColor, RGB> = {
  black: [0, 0, 0],
  red: [204, 0, 0],
  green: [0, 204, 0],
  yellow: [204, 204, 0],
  blue: [0, 0, 204],
  magenta: [204, 0, 204],
  cyan: [0, 204, 204],
  white: [229, 229, 229],
  bright_black: [127, 127, 127],
  bright_red: [255, 0, 0],
  bright_green: [0, 255, 0],
  bright_yellow: [255, 255, 0],
  bright_blue: [0, 0, 255],
  bright_magenta: [255, 0, 255],
  bright_cyan: [0, 255, 255],
  bright_white: [255, 255, 255],
};

/** Checks if the value is a standard color name */
export function isStandardColor(value: string): value is StandardColor {
  return value in STANDARD_FG;
}

/**
 * Converts a hex color string to an RGB tuple.
 * Accepts 3-digit (#rgb) and 6-digit (#rrggbb) formats.
 * @param hex - Hex color string (e.g. "#ff8800" or "#f80")
 * @throws {Error} If the hex string is not a valid 3 or 6 digit hex color
 */
export function hexToRgb(hex: string): RGB {
  const clean = hex.startsWith('#') ? hex.slice(1) : hex;
  if (clean.length !== 3 && clean.length !== 6) {
    throw new Error(`Invalid hex color: "${hex}" (expected 3 or 6 hex digits)`);
  }
  if (!/^[0-9a-fA-F]+$/.test(clean)) {
    throw new Error(`Invalid hex color: "${hex}" (contains non-hex characters)`);
  }
  const expanded =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(expanded, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// 256-color palette layout:
// 0-15:    Standard colors (handled by rgbToBasic)
// 16-231:  6x6x6 color cube (16 + 36*r + 6*g + b, each 0-5)
// 232-255: Grayscale ramp (24 shades, 232 = darkest, 255 = lightest)
const ANSI_256_COLOR_CUBE_OFFSET = 16;
const ANSI_256_GRAYSCALE_OFFSET = 232;
const ANSI_256_GRAYSCALE_STEPS = 24;
const ANSI_256_GRAYSCALE_RANGE = 247; // 255 - 8

/** Approximates an RGB color to the nearest 256-color palette index */
function rgbTo256(r: number, g: number, b: number): number {
  if (r === g && g === b) {
    if (r < 8) return ANSI_256_COLOR_CUBE_OFFSET;
    if (r > 248) return ANSI_256_GRAYSCALE_OFFSET - 1;
    return Math.round((r - 8) / ANSI_256_GRAYSCALE_RANGE * ANSI_256_GRAYSCALE_STEPS) + ANSI_256_GRAYSCALE_OFFSET;
  }
  const ri = Math.round(r / 255 * 5);
  const gi = Math.round(g / 255 * 5);
  const bi = Math.round(b / 255 * 5);
  return ANSI_256_COLOR_CUBE_OFFSET + 36 * ri + 6 * gi + bi;
}

/** Approximates an RGB color to the nearest Basic 16 ANSI foreground code */
function rgbToBasic(r: number, g: number, b: number): number {
  const DEFAULT_FG_CODE = 30; // black
  let minDist = Infinity;
  let closest = DEFAULT_FG_CODE;
  for (const [name, rgb] of Object.entries(STANDARD_RGB)) {
    const deltaR = r - rgb[0];
    const deltaG = g - rgb[1];
    const deltaB = b - rgb[2];
    // Squared Euclidean distance (no sqrt needed for comparison)
    const dist = deltaR * deltaR + deltaG * deltaG + deltaB * deltaB;
    if (dist < minDist) {
      minDist = dist;
      // Safe cast: Object.entries iterates STANDARD_RGB keys which are StandardColor
      closest = STANDARD_FG[name as StandardColor] ?? DEFAULT_FG_CODE;
    }
  }
  return closest;
}

/**
 * Converts a Color to an array of ANSI codes
 * @param color Color specification
 * @param level Color level
 * @param isBg Whether this is a background color
 */
export function colorToAnsiCodes(color: Color, level: ColorLevel, isBg: boolean): number[] {
  if (level === ColorLevel.None) return [];

  if (typeof color === 'string' && isStandardColor(color)) {
    if (level >= ColorLevel.TrueColor) {
      const rgb = STANDARD_RGB[color];
      return isBg ? [48, 2, rgb[0], rgb[1], rgb[2]] : [38, 2, rgb[0], rgb[1], rgb[2]];
    }
    return [isBg ? STANDARD_BG[color] : STANDARD_FG[color]];
  }

  if (typeof color === 'number') {
    if (level >= ColorLevel.Color256) {
      return isBg ? [48, 5, color] : [38, 5, color];
    }
    return [];
  }

  if (typeof color === 'string' && color.startsWith('#')) {
    const [r, g, b] = hexToRgb(color);
    if (level >= ColorLevel.TrueColor) {
      return isBg ? [48, 2, r, g, b] : [38, 2, r, g, b];
    }
    if (level >= ColorLevel.Color256) {
      const idx = rgbTo256(r, g, b);
      return isBg ? [48, 5, idx] : [38, 5, idx];
    }
    const basic = rgbToBasic(r, g, b);
    return [isBg ? basic + 10 : basic];
  }

  return [];
}
