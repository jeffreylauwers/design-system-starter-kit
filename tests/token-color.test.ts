import { describe, it, expect } from 'vitest';
// @ts-expect-error - build-script zonder type-declaraties
import { parseColor } from '../packages/design-tokens/src/config/color.js';
// @ts-expect-error - build-script zonder type-declaraties
import { parseBoxShadow } from '../packages/design-tokens/src/config/shadow.js';

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

  // De schaduwkleuren (#326). CSS mengt met voorvermenigvuldigde alpha:
  // `transparent` trekt de kleur dus niet naar zwart, alleen de alpha omlaag.
  it('rekent color-mix in srgb uit zoals CSS', () => {
    expect(parseColor('color-mix(in srgb, black 12%, transparent)')).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 0.12,
    });
    expect(parseColor('color-mix(in srgb, white 8%, transparent)')).toEqual({
      r: 1,
      g: 1,
      b: 1,
      a: 0.08,
    });
    // Zonder percentages 50/50; het percentage mag ook vooraan staan.
    expect(parseColor('color-mix(in srgb, #ff0000, #0000ff)')).toEqual({
      r: 0.5,
      g: 0,
      b: 0.5,
      a: 1,
    });
    expect(parseColor('color-mix(in srgb, 25% black, white)')).toEqual(
      parseColor('color-mix(in srgb, black 25%, white 75%)')
    );
    // Samen minder dan 100% maakt het resultaat doorzichtiger.
    expect(parseColor('color-mix(in srgb, black 20%, white 20%)')?.a).toBe(0.4);
  });

  // Zo serialiseert Chrome de uitkomst van een color-mix in getComputedStyle.
  it('leest color(srgb ...)', () => {
    expect(parseColor('color(srgb 0 0 0 / 0.12)')).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 0.12,
    });
    expect(parseColor('color(srgb 1 0.5 0)')).toEqual({
      r: 1,
      g: 0.5,
      b: 0,
      a: 1,
    });
  });

  it('kent transparent, black en white', () => {
    expect(parseColor('transparent')).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    expect(parseColor('black')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    expect(parseColor('white')).toEqual({ r: 1, g: 1, b: 1, a: 1 });
  });

  it('geeft null voor wat niet statisch naar één kleur te herleiden is', () => {
    // Een andere interpolatieruimte vraagt andere wiskunde; geen benadering.
    expect(parseColor('color-mix(in oklab, black, white)')).toBeNull();
    expect(
      parseColor('color-mix(in srgb, currentColor 50%, white)')
    ).toBeNull();
    expect(parseColor('currentColor')).toBeNull();
    expect(parseColor('oklch(0.5 0.1)')).toBeNull();
    expect(parseColor('#12')).toBeNull();
  });
});

describe('parseBoxShadow', () => {
  it('leest de schaduwtokens, met de kleur achteraan', () => {
    expect(
      parseBoxShadow(
        '0 1px 2px 0 {dsn.color.shadow.direct}, 0 0 0 1px {dsn.color.shadow.highlight}'
      )?.map(({ inset, lengths, color }) => ({ inset, lengths, color }))
    ).toEqual([
      {
        inset: false,
        lengths: ['0', '1px', '2px', '0'],
        color: '{dsn.color.shadow.direct}',
      },
      {
        inset: false,
        lengths: ['0', '0', '0', '1px'],
        color: '{dsn.color.shadow.highlight}',
      },
    ]);
  });

  it('leest een gemeten waarde, met de kleur vooraan en inset achteraan', () => {
    const [layer] = parseBoxShadow(
      'color(srgb 0 0 0 / 0.12) 0px 0px 0px 2px inset'
    );
    expect(layer.inset).toBe(true);
    expect(layer.color).toBe('color(srgb 0 0 0 / 0.12)');
    expect(layer.lengths).toEqual(['0px', '0px', '0px', '2px']);
  });

  it('herkent bij een var() de kleur op zijn plek, of op het type van het token', () => {
    const [layer] = parseBoxShadow('inset 0 0 0 var(--spread) var(--color)');
    expect(layer.lengths).toEqual(['0', '0', '0', 'var(--spread)']);
    expect(layer.color).toBe('var(--color)');

    const [decided] = parseBoxShadow(
      '0 0 0 var(--color)',
      (part: string) => part === 'var(--color)'
    );
    expect(decided.color).toBe('var(--color)');
    expect(decided.lengths).toEqual(['0', '0', '0']);
  });

  it('geeft [] voor none en null voor wat geen schaduw is', () => {
    expect(parseBoxShadow('none')).toEqual([]);
    expect(parseBoxShadow('red')).toBeNull();
    expect(parseBoxShadow('0 0 0 0 0 red')).toBeNull();
  });
});
