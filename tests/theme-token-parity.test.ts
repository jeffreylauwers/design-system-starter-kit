import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';

/**
 * Elk thema definieert dezelfde tokens als Start, en light en dark van een
 * thema definiëren dezelfde tokens.
 *
 * Ontbreekt een token in een thema, dan bestaat de custom property in de
 * volledige config van dat thema niet. Een `var()` zonder fallback wordt dan
 * ongeldig en de eigenschap valt terug op haar beginwaarde. Zo was de
 * backdrop in Wireframe transparant omdat `dsn.backdrop.background-color`
 * alleen in Start stond. Niemand zag het, want er faalde niets.
 */

const THEMES_DIR = path.resolve(
  __dirname,
  '../packages/design-tokens/src/tokens/themes'
);
const REFERENCE_THEME = 'start';
const FILES = ['colors-light.json', 'colors-dark.json', 'base.json'];

type TokenNode = { [key: string]: unknown };

function tokenNames(theme: string, file: string): string[] {
  const json = JSON.parse(
    readFileSync(path.join(THEMES_DIR, theme, file), 'utf-8')
  ) as TokenNode;
  const names: string[] = [];
  const walk = (node: TokenNode, trail: string[]) => {
    if ('$value' in node) {
      names.push(trail.join('.'));
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (child && typeof child === 'object' && !key.startsWith('$')) {
        walk(child as TokenNode, [...trail, key]);
      }
    }
  };
  walk(json, []);
  return names.sort();
}

const THEMES = readdirSync(THEMES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== REFERENCE_THEME)
  .map((entry) => entry.name);

describe.each(THEMES)('thema %s', (theme) => {
  it.each(FILES)(`%s heeft dezelfde tokens als ${REFERENCE_THEME}`, (file) => {
    expect(tokenNames(theme, file)).toEqual(tokenNames(REFERENCE_THEME, file));
  });
});

describe.each([REFERENCE_THEME, ...THEMES])('thema %s', (theme) => {
  it('heeft in light en dark dezelfde tokens', () => {
    expect(tokenNames(theme, 'colors-dark.json')).toEqual(
      tokenNames(theme, 'colors-light.json')
    );
  });
});
