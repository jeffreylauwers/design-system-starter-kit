import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  applyColorTokens,
  generateColorTokens,
  oklchToHex,
  parseToOklch,
  TOKEN_STEPS,
} from '../packages/theme-engine/src/index.ts';
import type { ThemeConfig } from '../packages/theme-engine/src/index.ts';

/**
 * De kleuren van een thema met een theme.config.json komen uit de theme
 * engine (`pnpm --filter @dsn-starter-kit/design-tokens generate:colors`).
 * Deze tests controleren de JSON zoals hij in git staat.
 */

const THEMES_DIR = path.resolve(
  __dirname,
  '../packages/design-tokens/src/tokens/themes'
);
const MODES = ['light', 'dark'] as const;

type ColorJson = {
  dsn: { color: Record<string, Record<string, { $value: string }>> };
};

const THEMES = fs
  .readdirSync(THEMES_DIR)
  .filter((theme) =>
    fs.existsSync(path.join(THEMES_DIR, theme, 'theme.config.json'))
  );

function readJson<T>(...parts: string[]): T {
  return JSON.parse(fs.readFileSync(path.join(THEMES_DIR, ...parts), 'utf-8'));
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

/** Volgt `{dsn.color.groep.stap}`-verwijzingen tot een kleurwaarde. */
function resolve(json: ColorJson, group: string, step: string): string {
  const value = json.dsn.color[group][step].$value;
  const reference = /^\{dsn\.color\.([^.]+)\.([^}]+)\}$/.exec(value);
  return reference ? resolve(json, reference[1], reference[2]) : value;
}

it('er is minstens één thema met een theme.config.json', () => {
  expect(THEMES).toContain('start');
});

describe.each(THEMES)('thema %s', (theme) => {
  const config = readJson<ThemeConfig>(theme, 'theme.config.json');

  describe.each(MODES)('%s', (mode) => {
    const json = readJson<ColorJson>(theme, `colors-${mode}.json`);

    it('colors-*.json is wat de config oplevert', () => {
      const values = generateColorTokens(config, mode);
      expect(applyColorTokens(json, values)).toEqual(json);
    });

    const groups = Object.keys(config.colors.groups);
    const hex = (group: string, step: string) => {
      const color = parseToOklch(resolve(json, group, step));
      if (!color) throw new Error(`${group}.${step}: geen kleur`);
      return oklchToHex(color);
    };
    const expectContrast = (
      group: string,
      fg: string,
      bg: string,
      min: number
    ) => {
      expect(
        contrast(hex(group, fg), hex(group, bg)),
        `${group}: ${fg} op ${bg}`
      ).toBeGreaterThanOrEqual(min);
    };

    it.each(groups)('%s: tekst en borders halen hun contrast', (group) => {
      for (const bg of ['bg-default', 'bg-hover', 'bg-active', 'bg-subtle']) {
        expectContrast(group, 'color-default', bg, 4.5);
      }
      expectContrast(group, 'color-hover', 'bg-hover', 4.5);
      expectContrast(group, 'color-active', 'bg-active', 4.5);
      expectContrast(group, 'color-subtle', 'bg-subtle', 4.5);
      expectContrast(group, 'color-document', 'bg-subtle', 4.5);
      expectContrast(group, 'border-default', 'bg-default', 3);
      expectContrast(group, 'border-hover', 'bg-hover', 3);
      expectContrast(group, 'border-active', 'bg-active', 3);
    });

    it.each(groups)(
      '%s-inverse: tekst en borders halen hun contrast',
      (name) => {
        const group = `${name}-inverse`;
        for (const text of ['color-default', 'color-subtle']) {
          for (const bg of [
            'bg-document',
            'bg-elevated',
            'bg-subtle',
            'bg-default',
            'bg-hover',
            'bg-active',
          ]) {
            expectContrast(group, text, bg, 4.5);
          }
        }
        expectContrast(group, 'border-default', 'bg-default', 3);
        expectContrast(group, 'border-hover', 'bg-hover', 3);
        expectContrast(group, 'border-active', 'bg-active', 3);
      }
    );
  });
});

describe('Start', () => {
  it.each(MODES)(
    'info verwijst als hele groep naar accent-1, ook het inverse deel (%s)',
    (mode) => {
      const json = readJson<ColorJson>('start', `colors-${mode}.json`);
      for (const step of TOKEN_STEPS) {
        expect(json.dsn.color.info[step].$value).toBe(
          `{dsn.color.accent-1.${step}}`
        );
        expect(json.dsn.color['info-inverse'][step].$value).toBe(
          `{dsn.color.accent-1-inverse.${step}}`
        );
      }
    }
  );
});
