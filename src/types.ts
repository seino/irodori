/**
 * irodori common type definitions
 */

/** Style attributes */
export type Style = {
  bold?: boolean | undefined;
  dim?: boolean | undefined;
  italic?: boolean | undefined;
  underline?: boolean | undefined;
  strikethrough?: boolean | undefined;
  reverse?: boolean | undefined;
  blink?: boolean | undefined;
  color?: Color | undefined;
  bgColor?: Color | undefined;
  link?: string | undefined;
};

/** Color specification */
export type Color = StandardColor | `#${string}` | number;

/** Standard 16 colors */
export type StandardColor =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'bright_black'
  | 'bright_red'
  | 'bright_green'
  | 'bright_yellow'
  | 'bright_blue'
  | 'bright_magenta'
  | 'bright_cyan'
  | 'bright_white';

/** Color level */
export enum ColorLevel {
  /** ANSI disabled (CI / pipe) */
  None = 0,
  /** 16 colors */
  Basic = 1,
  /** 256 colors */
  Color256 = 2,
  /** 24-bit TrueColor */
  TrueColor = 3,
}

/** Render options */
export type RenderOptions = {
  width: number;
  colorLevel: ColorLevel;
};

/** Interface implemented by all renderable objects */
export type Renderable = {
  render(options: RenderOptions): string[];
};

/** Border style */
export type BorderStyle =
  | 'ascii'
  | 'markdown'
  | 'simple'
  | 'minimal'
  | 'horizontals'
  | 'rounded'
  | 'heavy'
  | 'double'
  | 'none';

/** Padding */
export type Padding = number | [number, number] | [number, number, number, number];

/** Markup parser token */
export type Token =
  | { type: 'text'; value: string }
  | { type: 'open'; tags: string[] }
  | { type: 'close'; tags: string[] };

/** Styled text fragment */
export type Span = {
  text: string;
  style: Style;
};

/** Border character set */
export type BoxChars = {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
  topMid: string;
  bottomMid: string;
  midLeft: string;
  midRight: string;
  mid: string;
  midMid: string;
};

/** Spinner definition */
export type SpinnerDef = {
  interval: number;
  frames: string[];
};

/** Progress task ID (branded type) */
export type TaskID = number & { readonly __brand: 'TaskID' };
