import {
  parse,
  converter,
  formatHex,
  formatCss,
  clampChroma,
  wcagContrast,
} from 'culori';
import type { Oklch } from 'culori';
import type { OklchColor } from './types.ts';

function toColor(o: OklchColor): Oklch {
  return o;
}

const toOklch = converter('oklch');

export function parseToOklch(input: string): OklchColor | null {
  try {
    const parsed = parse(input);
    if (!parsed) return null;
    const oklch = toOklch(parsed);
    if (!oklch) return null;
    return {
      mode: 'oklch',
      l: oklch.l ?? 0,
      c: oklch.c ?? 0,
      h: oklch.h ?? 0,
    };
  } catch {
    return null;
  }
}

export function oklchToHex(color: OklchColor): string {
  const clamped = clampChroma(toColor(color), 'oklch');
  return formatHex(clamped) ?? '#000000';
}

/** Rounds to the precision that oklchToCss writes. */
export function roundOklch(color: OklchColor): OklchColor {
  return {
    mode: 'oklch',
    l: Math.round(color.l * 1000) / 1000,
    c: Math.round(color.c * 1000) / 1000,
    h: Math.round((color.h ?? 0) * 10) / 10,
  };
}

export function oklchToCss(color: OklchColor): string {
  const { l, c, h } = roundOklch(color);
  return `oklch(${l} ${c} ${h})`;
}

export function formatColor(
  color: OklchColor,
  format: 'oklch' | 'hex'
): string {
  return format === 'hex' ? oklchToHex(color) : oklchToCss(color);
}

export function clampToSRGB(color: OklchColor): OklchColor {
  const clamped = clampChroma(toColor(color), 'oklch');
  return {
    mode: 'oklch',
    l: clamped.l,
    c: clamped.c,
    h: clamped.h ?? color.h,
  };
}

export function contrastRatio(a: OklchColor, b: OklchColor): number {
  const aHex = oklchToHex(clampToSRGB(a));
  const bHex = oklchToHex(clampToSRGB(b));
  const parsedA = parse(aHex);
  const parsedB = parse(bHex);
  if (!parsedA || !parsedB) return 1;
  return wcagContrast(parsedA, parsedB);
}

export function makeOklch(l: number, c: number, h: number): OklchColor {
  return {
    mode: 'oklch',
    l: clamp(l, 0, 1),
    c: Math.max(0, c),
    h: (h + 360) % 360,
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** The value as the oklch() export writes it: gamut-mapped, then rounded. */
export function exportedOklch(color: OklchColor): OklchColor {
  return roundOklch(clampToSRGB(color));
}

/**
 * True when `fg` reaches `minRatio` on `bg`, both as generated and as the
 * oklch() export rounds them. A pair right at the threshold can otherwise
 * drop below it once the token JSON is written.
 */
export function meetsContrast(
  fg: OklchColor,
  bg: OklchColor,
  minRatio: number
): boolean {
  return (
    contrastRatio(fg, bg) >= minRatio &&
    contrastRatio(exportedOklch(fg), exportedOklch(bg)) >= minRatio
  );
}

export function adjustLForContrast(
  color: OklchColor,
  bg: OklchColor,
  minRatio: number,
  direction: 'darken' | 'lighten'
): OklchColor {
  const step = direction === 'darken' ? -0.005 : 0.005;
  let current = { ...color };

  for (let i = 0; i < 200; i++) {
    if (meetsContrast(current, bg, minRatio)) return current;
    current = { ...current, l: clamp(current.l + step, 0, 1) };
    if (current.l <= 0.001 || current.l >= 0.999) break;
  }
  return current;
}

export function isValidColor(input: string): boolean {
  if (!input.trim()) return false;
  return parseToOklch(input) !== null;
}

export { formatCss, formatHex };
