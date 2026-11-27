import { describe, it, expect } from 'vitest';
import {
  fluidClamp,
  isFluidValue,
  readFluidViewport,
  resolveFluid,
  splitTopLevel,
  toPx,
} from './fluid.ts';

const VIEWPORT = { min: 360, max: 1440 };

describe('toPx', () => {
  it('rekent rem, px en calc() met vermenigvuldigen en delen om', () => {
    expect(toPx('1rem')).toBe(16);
    expect(toPx('8px')).toBe(8);
    expect(toPx('calc(0.5rem * 1 * 1.25)')).toBe(10);
    expect(toPx('calc(2rem / 4)')).toBe(8);
    expect(toPx(' calc(1.5 * 1rem) ')).toBe(24);
  });

  it('weigert wat de schaal niet kent', () => {
    expect(() => toPx('1em')).toThrow('kan "1em" niet omrekenen naar px');
    expect(() => toPx('calc(1rem * 2px)')).toThrow('heeft twee eenheden');
    expect(() => toPx('1.5')).toThrow('heeft geen eenheid');
  });
});

describe('splitTopLevel', () => {
  it('splitst alleen op komma’s buiten haakjes', () => {
    expect(splitTopLevel('calc(a, b), c')).toEqual(['calc(a, b)', 'c']);
    expect(splitTopLevel(' 1rem ,calc(1rem * 1.25) ')).toEqual([
      '1rem',
      'calc(1rem * 1.25)',
    ]);
  });
});

describe('fluidClamp', () => {
  it('rekent de clamp() uit zoals de token-build hem schrijft', () => {
    // --dsn-text-font-size-md in dist/css/start-light-default.css
    expect(fluidClamp('1rem', 'calc(1rem * 1.25)', VIEWPORT)).toBe(
      'clamp(1rem, 0.91667rem + 0.37037vw, 1.25rem)'
    );
    // --dsn-space-block-md
    expect(
      fluidClamp('calc(0.5rem * 1)', 'calc(0.5rem * 1 * 1.25)', VIEWPORT)
    ).toBe('clamp(0.5rem, 0.45833rem + 0.18519vw, 0.625rem)');
  });

  it('geeft de waarde zelf terug als min en max gelijk zijn', () => {
    expect(fluidClamp('calc(0.5rem * 2)', '16px', VIEWPORT)).toBe(
      'calc(0.5rem * 2)'
    );
  });

  it('houdt de grenzen op volgorde als max kleiner is dan min', () => {
    expect(fluidClamp('2rem', '1rem', VIEWPORT)).toMatch(
      /^clamp\(1rem, .*, 2rem\)$/
    );
  });
});

describe('resolveFluid', () => {
  it('leest fluid(min, max) en geeft de clamp()', () => {
    expect(isFluidValue('fluid({a}, {b})')).toBe(true);
    expect(isFluidValue('{a}')).toBe(false);
    expect(resolveFluid('fluid(1rem, calc(1rem * 1.25))', VIEWPORT)).toBe(
      'clamp(1rem, 0.91667rem + 0.37037vw, 1.25rem)'
    );
  });

  it('weigert iets anders dan precies twee waarden', () => {
    expect(() => resolveFluid('fluid(1rem)', VIEWPORT)).toThrow(
      'precies twee waarden'
    );
    expect(() => resolveFluid('fluid(1rem, 2rem, 3rem)', VIEWPORT)).toThrow(
      'precies twee waarden'
    );
  });
});

describe('readFluidViewport', () => {
  const base = (min: string, max: string) => ({
    dsn: {
      viewport: {
        'min-inline-size': { $value: min },
        'max-inline-size': { $value: max },
      },
    },
  });

  it('leest het bereik in px', () => {
    expect(readFluidViewport(base('360px', '90rem'))).toEqual(VIEWPORT);
  });

  it('weigert een bereik dat niet oploopt', () => {
    expect(() => readFluidViewport(base('1440px', '360px'))).toThrow(
      'max-inline-size moet groter zijn'
    );
  });
});
