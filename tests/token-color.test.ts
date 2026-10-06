import { describe, it, expect } from 'vitest';
// @ts-expect-error - build-script zonder type-declaraties
import { parseColor } from '../packages/design-tokens/src/config/color.js';

/** `{ r, g, b }` in 0..1 -> `#rrggbb`. */
function toHex({ r, g, b }: { r: number; g: number; b: number }) {
  return `#${[r, g, b]
    .map((channel) =>
      Math.round(channel * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
}

describe('parseColor', () => {
  it('leest hex in alle vier de vormen', () => {
    expect(parseColor('#fff')).toEqual({ r: 1, g: 1, b: 1, a: 1 });
    expect(parseColor('#0000')).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    expect(parseColor('#1B59A4')).toEqual({
      r: 27 / 255,
      g: 89 / 255,
      b: 164 / 255,
      a: 1,
    });
    expect(parseColor('#1B59A480')?.a).toBeCloseTo(128 / 255);
  });

  // Verwachte waarden komen uit culori (`clampChroma` + `formatHex`), de
  // bibliotheek waarmee de color-palette-generator zijn hex-waarden toont.
  it('zet oklch om naar dezelfde sRGB-waarde als de palette generator', () => {
    expect(toHex(parseColor('oklch(0.991 0 0)'))).toBe('#fcfcfc');
    expect(toHex(parseColor('oklch(0.463 0.132 255.3)'))).toBe('#1b58a0');
    expect(toHex(parseColor('oklch(0.62 0.19 28)'))).toBe('#e24a3f');
    expect(toHex(parseColor('oklch(0.85 0.17 95)'))).toBe('#f1cb1c');
    expect(toHex(parseColor('oklch(0.2 0.02 150)'))).toBe('#101911');
    expect(toHex(parseColor('oklch(0 0 0)'))).toBe('#000000');
    expect(toHex(parseColor('oklch(1 0 0)'))).toBe('#ffffff');
    expect(parseColor('oklch(1 0 0)').a).toBe(1);
  });

  it('brengt chroma terug voor kleuren buiten sRGB, zonder de tint te verschuiven', () => {
    expect(toHex(parseColor('oklch(0.7 0.35 145)'))).toBe('#00bf34');
    expect(toHex(parseColor('oklch(0.5 0.4 264)'))).toBe('#033fff');
  });

  it('leest alpha, percentages en none', () => {
    expect(parseColor('oklch(0.5 0.1 250 / 0.5)').a).toBe(0.5);
    expect(parseColor('oklch(0.5 0.1 250 / 25%)').a).toBe(0.25);
    expect(parseColor('oklch(50% 25% 250deg)')).toEqual(
      parseColor('oklch(0.5 0.1 250)')
    );
    expect(parseColor('oklch(0.5 0 none)')).toEqual(
      parseColor('oklch(0.5 0 0)')
    );
  });

  it('geeft null voor wat niet statisch naar één kleur te herleiden is', () => {
    expect(parseColor('color-mix(in srgb, black 12%, transparent)')).toBeNull();
    expect(parseColor('transparent')).toBeNull();
    expect(parseColor('oklch(0.5 0.1)')).toBeNull();
    expect(parseColor('#12')).toBeNull();
  });
});
