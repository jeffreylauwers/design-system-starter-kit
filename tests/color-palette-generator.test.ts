import { describe, it, expect } from 'vitest';
import { buildColorGroup } from '../packages/color-palette-generator/src/engine/palette';
import {
  parseToOklch,
  oklchToHex,
} from '../packages/color-palette-generator/src/engine/oklch';
import {
  exportDtcg,
  exportGeneric,
} from '../packages/color-palette-generator/src/engine/export';
import {
  DEFAULT_BASE_COLORS,
  DEFAULT_GROUP_NAMES,
} from '../packages/color-palette-generator/src/types';
import type { ColorMode } from '../packages/color-palette-generator/src/types';

const BACKGROUNDS = [
  'bg-document',
  'bg-elevated',
  'bg-subtle',
  'bg-default',
  'bg-hover',
  'bg-active',
] as const;
const TEXTS = ['color-default', 'color-subtle'] as const;
const MODES: ColorMode[] = ['light', 'dark'];

function defaultGroups(mode: ColorMode) {
  return DEFAULT_GROUP_NAMES.map((name) => {
    const baseColor = DEFAULT_BASE_COLORS[name];
    const oklch = parseToOklch(baseColor);
    if (!oklch) throw new Error(`Ongeldige basiskleur voor ${name}`);
    return buildColorGroup(name, name, baseColor, oklch, mode, 1);
  });
}

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

/** `oklch(...)` uit de export -> de sRGB-hex na gamut-mapping (clampChroma). */
function exportedOklchToHex(value: string): string {
  const oklch = parseToOklch(value);
  if (!oklch) throw new Error(`Geen leesbare kleur: ${value}`);
  return oklchToHex(oklch);
}

function lightness(value: string): number {
  const oklch = parseToOklch(value);
  if (!oklch) throw new Error(`Geen leesbare kleur: ${value}`);
  return oklch.l;
}

describe.each(MODES)(
  'color-palette-generator: inverse-groepen (%s)',
  (mode) => {
    const groups = defaultGroups(mode);
    const oklchExport = JSON.parse(exportDtcg(groups, 'oklch')).dsn
      .color as Record<string, Record<string, { $value: string }>>;
    const hexExport = JSON.parse(exportGeneric(groups)) as Record<
      string,
      Record<string, string>
    >;
    const inverseNames = DEFAULT_GROUP_NAMES.map((name) => `${name}-inverse`);

    it.each(inverseNames)(
      '%s: color-default en color-subtle halen 4,5:1 op alle zes de achtergronden',
      (name) => {
        for (const text of TEXTS) {
          for (const bg of BACKGROUNDS) {
            // De oklch()-export, zoals die in de token-JSON terechtkomt.
            const fromOklch = contrast(
              exportedOklchToHex(oklchExport[name][text].$value),
              exportedOklchToHex(oklchExport[name][bg].$value)
            );
            expect(
              fromOklch,
              `${name} ${text} op ${bg} (oklch-export)`
            ).toBeGreaterThanOrEqual(4.5);

            const fromHex = contrast(
              hexExport[name][text],
              hexExport[name][bg]
            );
            expect(
              fromHex,
              `${name} ${text} op ${bg} (hex-export)`
            ).toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    );

    it.each(inverseNames)(
      '%s: hover en active lopen in dezelfde richting door als voorheen',
      (name) => {
        const l = (step: string) => lightness(oklchExport[name][step].$value);
        if (mode === 'dark') {
          expect(l('bg-hover')).toBeGreaterThan(l('bg-default'));
          expect(l('bg-active')).toBeGreaterThan(l('bg-hover'));
        } else {
          expect(l('bg-hover')).toBeLessThan(l('bg-default'));
          expect(l('bg-active')).toBeLessThan(l('bg-hover'));
        }
      }
    );
  }
);
