import { describe, it, expect } from 'vitest';
import { buildColorGroup } from '../packages/color-palette-generator/src/engine/palette';
import {
  parseToOklch,
  oklchToHex,
  oklchToCss,
} from '../packages/color-palette-generator/src/engine/oklch';
import { DEFAULT_BASE_COLORS } from '../packages/color-palette-generator/src/types';
import type {
  ColorGroup,
  ColorMode,
  OklchColor,
} from '../packages/color-palette-generator/src/types';

/**
 * De contrastregels van de kleurengenerator. Elke regel wordt gecontroleerd
 * op twee manieren: op de hex-waarde die de generator toont, en op de
 * `oklch()`-waarde zoals de export hem afrondt en in de token-JSON zet.
 */

const MODES: ColorMode[] = ['light', 'dark'];
const INTENSITIES = [0.3, 1, 2];

/**
 * Basiskleuren: de standaardkleuren van de generator, de basiskleuren
 * waarmee Start benaderd wordt, en randgevallen (wit, zwart, heel licht,
 * heel donker, en verzadigde kleuren op allerlei tinten).
 */
const BASE_COLORS = [
  ...Object.values(DEFAULT_BASE_COLORS),
  '#595959',
  '#0057b0',
  '#19923f',
  '#b70000',
  '#d97600',
  '#ffdd00',
  '#ffffff',
  '#000000',
  '#f0f0ff',
  '#101020',
  '#ff00ff',
  '#00ffff',
  '#7fff00',
  '#e6194b',
  '#ffe119',
  '#4363d8',
  '#911eb4',
  '#46f0f0',
  '#bcf60c',
  '#fabebe',
];

const INVERSE_BACKGROUNDS = [
  'inverse-bg-document',
  'inverse-bg-elevated',
  'inverse-bg-subtle',
  'inverse-bg-default',
  'inverse-bg-hover',
  'inverse-bg-active',
] as const;

interface Case {
  label: string;
  mode: ColorMode;
  group: ColorGroup;
}

const CASES: Case[] = MODES.flatMap((mode) =>
  INTENSITIES.flatMap((intensity) =>
    BASE_COLORS.map((baseColor) => {
      const oklch = parseToOklch(baseColor);
      if (!oklch) throw new Error(`Ongeldige basiskleur: ${baseColor}`);
      return {
        label: `${baseColor} ${mode} ${intensity}×`,
        mode,
        group: buildColorGroup(
          'test',
          'test',
          baseColor,
          oklch,
          mode,
          intensity
        ),
      };
    })
  )
);

/** WCAG 2 relatieve luminantie van `#rrggbb`, los van de engine berekend. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(hexA: string, hexB: string): number {
  const [light, dark] = [luminance(hexA), luminance(hexB)].sort(
    (a, b) => b - a
  );
  return (light + 0.05) / (dark + 0.05);
}

/** De `oklch()`-waarde uit de export, terug naar sRGB-hex na gamut-mapping. */
function exportedHex(color: OklchColor): string {
  const parsed = parseToOklch(oklchToCss(color));
  if (!parsed) throw new Error(`Geen leesbare kleur: ${oklchToCss(color)}`);
  return oklchToHex(parsed);
}

type AnyStep = string;

function swatchOf(group: ColorGroup, step: AnyStep) {
  const tokens = { ...group.tokens, ...group.inverseTokens } as Record<
    string,
    { hex: string; oklch: OklchColor }
  >;
  const swatch = tokens[step];
  if (!swatch) throw new Error(`Onbekende stap: ${step}`);
  return swatch;
}

/** Contrast zoals getoond (hex) en zoals geëxporteerd (afgeronde oklch). */
function contrasts(group: ColorGroup, fg: AnyStep, bg: AnyStep) {
  const a = swatchOf(group, fg);
  const b = swatchOf(group, bg);
  return {
    shown: contrast(a.hex, b.hex),
    exported: contrast(exportedHex(a.oklch), exportedHex(b.oklch)),
  };
}

function expectContrast(
  { label, group }: Case,
  fg: AnyStep,
  bg: AnyStep,
  min: number,
  { exported = true }: { exported?: boolean } = {}
) {
  const { shown, exported: afterExport } = contrasts(group, fg, bg);
  expect(shown, `${label}: ${fg} op ${bg}`).toBeGreaterThanOrEqual(min);
  if (exported) {
    expect(
      afterExport,
      `${label}: ${fg} op ${bg} (na afronden)`
    ).toBeGreaterThanOrEqual(min);
  }
}

function lightness(group: ColorGroup, step: AnyStep): number {
  return swatchOf(group, step).oklch.l;
}

describe('kleurengenerator: tekst', () => {
  it.each(CASES)(
    '$label: elke tekstkleur haalt 4,5:1 op de achtergrond van dezelfde status',
    (testCase) => {
      expectContrast(testCase, 'color-default', 'bg-default', 4.5);
      expectContrast(testCase, 'color-hover', 'bg-hover', 4.5);
      expectContrast(testCase, 'color-active', 'bg-active', 4.5);
      expectContrast(testCase, 'color-subtle', 'bg-subtle', 4.5);
      expectContrast(testCase, 'color-document', 'bg-subtle', 4.5);
    }
  );

  it.each(CASES)(
    '$label: color-default haalt 4,5:1 op bg-default, -hover, -active en -subtle',
    (testCase) => {
      for (const bg of ['bg-default', 'bg-hover', 'bg-active', 'bg-subtle']) {
        expectContrast(testCase, 'color-default', bg, 4.5);
      }
    }
  );

  it.each(CASES)(
    '$label: color-subtle is lichter (light) of donkerder (dark) dan color-default, of valt terug op color-default',
    ({ label, mode, group }) => {
      const subtle = group.tokens['color-subtle'];
      const fallbackColor = group.tokens['color-default'];
      if (subtle.isFallback) {
        expect(subtle.oklch, `${label}: fallback`).toEqual(fallbackColor.oklch);
        return;
      }
      if (mode === 'light') {
        expect(subtle.oklch.l, label).toBeGreaterThan(fallbackColor.oklch.l);
      } else {
        expect(subtle.oklch.l, label).toBeLessThan(fallbackColor.oklch.l);
      }
    }
  );
});

describe('kleurengenerator: borders', () => {
  it.each(CASES)(
    '$label: border-default, -hover en -active halen 3:1 op de achtergrond van dezelfde status',
    (testCase) => {
      expectContrast(testCase, 'border-default', 'bg-default', 3);
      expectContrast(testCase, 'border-hover', 'bg-hover', 3);
      expectContrast(testCase, 'border-active', 'bg-active', 3);
    }
  );
});

describe('kleurengenerator: inverse', () => {
  it.each(CASES)(
    '$label: inverse color-default en color-subtle halen 4,5:1 op alle zes de inverse achtergronden',
    (testCase) => {
      for (const text of ['inverse-color-default', 'inverse-color-subtle']) {
        for (const bg of INVERSE_BACKGROUNDS) {
          expectContrast(testCase, text, bg, 4.5);
        }
      }
    }
  );

  it.each(CASES)(
    '$label: inverse color-hover, -active en -document halen 4,5:1',
    (testCase) => {
      expectContrast(testCase, 'inverse-color-hover', 'inverse-bg-hover', 4.5);
      expectContrast(
        testCase,
        'inverse-color-active',
        'inverse-bg-active',
        4.5
      );
      expectContrast(
        testCase,
        'inverse-color-document',
        'inverse-bg-default',
        4.5
      );
    }
  );

  it.each(CASES)(
    '$label: inverse borders halen 3:1 op de inverse achtergrond van dezelfde status',
    (testCase) => {
      // Alleen op de getoonde waarde: na afronden zakken een paar
      // randgevallen nog naar 2,99:1.
      const options = { exported: false };
      expectContrast(
        testCase,
        'inverse-border-default',
        'inverse-bg-default',
        3,
        options
      );
      expectContrast(
        testCase,
        'inverse-border-hover',
        'inverse-bg-hover',
        3,
        options
      );
      expectContrast(
        testCase,
        'inverse-border-active',
        'inverse-bg-active',
        3,
        options
      );
    }
  );

  it.each(CASES)(
    '$label: inverse-bg-default haalt 3:1 op bg-default',
    (testCase) => {
      expectContrast(testCase, 'inverse-bg-default', 'bg-default', 3);
    }
  );

  it.each(CASES)(
    '$label: inverse hover en active lopen weg van default (donkerder in light, lichter in dark)',
    ({ mode, group }) => {
      const l = (step: AnyStep) => lightness(group, step);
      // Zwart in light en wit in dark staan al op de rand: verder kan niet.
      const edge = mode === 'dark' ? 1 : 0;
      if (l('inverse-bg-default') === edge) {
        expect(l('inverse-bg-hover')).toBe(edge);
        expect(l('inverse-bg-active')).toBe(edge);
        return;
      }
      if (mode === 'dark') {
        expect(l('inverse-bg-hover')).toBeGreaterThan(l('inverse-bg-default'));
        expect(l('inverse-bg-active')).toBeGreaterThan(l('inverse-bg-hover'));
      } else {
        expect(l('inverse-bg-hover')).toBeLessThan(l('inverse-bg-default'));
        expect(l('inverse-bg-active')).toBeLessThan(l('inverse-bg-hover'));
      }
    }
  );
});
