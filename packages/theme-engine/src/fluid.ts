/**
 * The fluid scale (DR-2026-13). A fluid token is written in JSON as
 * `fluid({min-token}, {max-token})`: the min value at the smallest viewport,
 * the max value at the largest, and a straight line in between.
 *
 * The token build (`dsn/fluid` in design-tokens' config.js) and the theme
 * configurator both compute the clamp() with these functions, so a preview
 * shows exactly what the build writes.
 */

export const FLUID_PATTERN = /^fluid\((.*)\)$/s;
export const ROOT_FONT_SIZE = 16;

export interface FluidViewport {
  /** Smallest viewport in px. */
  min: number;
  /** Largest viewport in px. */
  max: number;
}

export function isFluidValue(value: unknown): value is string {
  return typeof value === 'string' && FLUID_PATTERN.test(value.trim());
}

/** Splits on commas outside parentheses: `calc(a, b), c` gives 2 parts. */
export function splitTopLevel(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of input) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current.trim());
  return parts;
}

/**
 * Converts a value such as `1rem`, `8px` or `calc(0.5rem * 1.5 * 1.25)` to
 * pixels. The scale needs no more than multiplying and dividing.
 */
export function toPx(value: string | number): number {
  const expression = String(value)
    .trim()
    .replace(/^calc\((.*)\)$/s, '$1');
  const terms = expression.split(/\s*([*/])\s*/);
  let result: number | null = null;
  let unit: string | null = null;
  for (let index = 0; index < terms.length; index += 2) {
    const match = terms[index].match(/^(-?[\d.]+)(rem|px)?$/);
    if (!match) {
      throw new Error(`fluid(): kan "${value}" niet omrekenen naar px`);
    }
    let number = Number(match[1]);
    if (match[2]) {
      if (unit) throw new Error(`fluid(): "${value}" heeft twee eenheden`);
      unit = match[2];
      if (unit === 'rem') number *= ROOT_FONT_SIZE;
    }
    const operator = terms[index - 1];
    if (result === null) result = number;
    else if (operator === '*') result *= number;
    else result /= number;
  }
  if (!unit || result === null) {
    throw new Error(`fluid(): "${value}" heeft geen eenheid`);
  }
  return result;
}

const round = (number: number) => Number(number.toFixed(5));

/**
 * Turns the two resolved values of `fluid(min, max)` into a clamp(). Equal
 * min and max give the value itself: there is nothing to scale.
 */
export function fluidClamp(
  minValue: string,
  maxValue: string,
  viewport: FluidViewport
): string {
  const min = toPx(minValue);
  const max = toPx(maxValue);
  if (min === max) return minValue;

  const slope = (max - min) / (viewport.max - viewport.min);
  const intercept = min - slope * viewport.min;
  const lower = Math.min(min, max) / ROOT_FONT_SIZE;
  const upper = Math.max(min, max) / ROOT_FONT_SIZE;
  return `clamp(${round(lower)}rem, ${round(intercept / ROOT_FONT_SIZE)}rem + ${round(slope * 100)}vw, ${round(upper)}rem)`;
}

/**
 * Resolves `fluid(min, max)` whose references are already replaced by
 * values, as Style Dictionary hands it to the transform.
 */
export function resolveFluid(value: string, viewport: FluidViewport): string {
  const match = value.trim().match(FLUID_PATTERN);
  if (!match) throw new Error(`"${value}" is geen fluid()-waarde`);
  const [minValue, maxValue, ...rest] = splitTopLevel(match[1]);
  if (!maxValue || rest.length) {
    throw new Error(`fluid() verwacht precies twee waarden: "${value}"`);
  }
  return fluidClamp(minValue, maxValue, viewport);
}

/**
 * Reads the range of the fluid scale from a theme's base tokens. These
 * tokens must be fixed px values: the build computes with them.
 */
export function readFluidViewport(base: {
  dsn: {
    viewport: {
      'min-inline-size': { $value: string };
      'max-inline-size': { $value: string };
    };
  };
}): FluidViewport {
  const viewport = base.dsn.viewport;
  const min = toPx(viewport['min-inline-size'].$value);
  const max = toPx(viewport['max-inline-size'].$value);
  if (!(max > min)) {
    throw new Error(
      'dsn.viewport.max-inline-size moet groter zijn dan min-inline-size'
    );
  }
  return { min, max };
}
