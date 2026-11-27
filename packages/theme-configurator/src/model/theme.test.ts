import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { TOKEN_STEPS } from '@dsn-starter-kit/theme-engine';
import {
  changedTokens,
  defaultConfig,
  exportTheme,
  groupNameProblem,
  groupViews,
  resolveTheme,
} from './theme';
import type { ThemeConfig } from './theme';

const DESIGN_TOKENS = path.resolve(__dirname, '../../../design-tokens');
const START_DIR = path.join(DESIGN_TOKENS, 'src/tokens/themes/start');
const MODES = ['light', 'dark'] as const;

function withGroups(
  groups: ThemeConfig['colors']['groups'],
  config = defaultConfig()
): ThemeConfig {
  return {
    ...config,
    colors: {
      ...config.colors,
      groups: { ...config.colors.groups, ...groups },
    },
  };
}

type ColorJson = { dsn: { color: Record<string, unknown> } & object };

describe('exportTheme', () => {
  it('geeft met de standaardconfig precies de bestanden van Start', () => {
    const files = exportTheme(defaultConfig());
    for (const [file, content] of Object.entries(files)) {
      expect(content, file).toBe(
        fs.readFileSync(path.join(START_DIR, file), 'utf-8')
      );
    }
  });

  it('verandert alleen de kleurgroepen als een basiskleur verandert', () => {
    const config = withGroups({ 'accent-1': { base: '#7c3aed' } });
    const files = exportTheme(config);
    const start = exportTheme(defaultConfig());

    expect(files['base.json']).toBe(start['base.json']);
    for (const mode of MODES) {
      const file = `colors-${mode}.json` as const;
      const exported = JSON.parse(files[file]) as ColorJson;
      const original = JSON.parse(start[file]) as ColorJson;
      expect(exported.dsn.color['accent-1']).not.toEqual(
        original.dsn.color['accent-1']
      );
      // Een verwijzing blijft een verwijzing.
      expect(exported.dsn.color['accent-2']).toEqual(
        original.dsn.color['accent-2']
      );
      // Tokens zonder bediening gaan ongewijzigd mee.
      const { color: exportedColor, ...exportedRest } = exported.dsn;
      const { color: originalColor, ...originalRest } = original.dsn;
      expect(exportedRest).toEqual(originalRest);
      expect(exportedColor.shadow).toEqual(originalColor.shadow);
      expect(exportedColor.transparent).toEqual(originalColor.transparent);
    }
    expect(JSON.parse(files['theme.config.json'])).toEqual(config);
  });

  it('zet een eigen groep na de laatste groep van Start, en de inverse groep na de laatste inverse groep', () => {
    const files = exportTheme(withGroups({ brand: { base: '#e6194b' } }));
    const color = (JSON.parse(files['colors-light.json']) as ColorJson).dsn
      .color;
    const names = Object.keys(color);
    expect(names.indexOf('brand')).toBe(names.indexOf('warning') + 1);
    expect(names.indexOf('brand-inverse')).toBe(
      names.indexOf('warning-inverse') + 1
    );
    const brand = color.brand as Record<string, Record<string, string>>;
    expect(Object.keys(brand)).toEqual(TOKEN_STEPS);
    expect(brand['bg-default'].$type).toBe('color');
    expect(brand['bg-default'].$value).toMatch(/^oklch\(/);
    expect(brand['bg-default']).not.toHaveProperty('$description');
  });
});

describe('resolveTheme', () => {
  const docs = JSON.parse(
    fs.readFileSync(
      path.join(DESIGN_TOKENS, 'dist/json/token-docs.json'),
      'utf-8'
    )
  ) as { tokens: { name: string; component: string | null }[] };
  const semantic = docs.tokens
    .filter((token) => token.component === null)
    .map((token) => token.name);

  /** De custom properties in het :root-blok van de gebouwde CSS. */
  function builtTokens(mode: string): Map<string, string> {
    const css = fs.readFileSync(
      path.join(DESIGN_TOKENS, `dist/css/start-${mode}-default.css`),
      'utf-8'
    );
    const root = css.slice(0, css.indexOf('@media'));
    return new Map(
      [
        ...root.matchAll(/^\s*(--[\w-]+):\s*(.*?);(?:\s*\/\*\*.*\*\/)?\s*$/gm),
      ].map((match) => [match[1], match[2]])
    );
  }

  it.each(MODES)(
    'geeft met de standaardconfig dezelfde waarden als de token-build (%s)',
    (mode) => {
      const built = builtTokens(mode);
      const resolved = resolveTheme(defaultConfig(), mode);
      // Elk semantisch token zit erin. token-docs.json rekent een paar
      // tokens uit base.json (zoals dsn.heading.*) tot een component; die
      // horen er ook bij.
      const names = new Set(resolved.map((token) => token.name));
      expect(semantic.filter((name) => !names.has(name))).toEqual([]);
      for (const token of resolved) {
        expect(token.value, token.name).toBe(built.get(token.name));
      }
    }
  );

  it('verandert alleen de tokens van de groep die verandert; verwijzingen volgen via var()', () => {
    const changed = changedTokens(
      withGroups({ 'accent-1': { base: '#7c3aed' } }),
      'light'
    ).map((token) => token.name);
    expect(changed.length).toBeGreaterThan(0);
    expect(
      changed.every((name) => name.startsWith('--dsn-color-accent-1-'))
    ).toBe(true);
    expect(changedTokens(defaultConfig(), 'light')).toEqual([]);
  });
});

describe('groupViews', () => {
  it('toont een verwijzing met de schakeringen van de groep waar hij naar verwijst', () => {
    const views = groupViews(defaultConfig(), 'light');
    const accent1 = views.find((view) => view.name === 'accent-1');
    const accent2 = views.find((view) => view.name === 'accent-2');
    expect(accent2?.aliasOf).toBe('accent-1');
    expect(accent2?.tokens).toEqual(accent1?.tokens);
    expect(accent2?.standard).toBe(true);
  });

  it('markeert eigen groepen als niet-standaard', () => {
    const views = groupViews(
      withGroups({ brand: { base: '#e6194b' } }),
      'dark'
    );
    expect(views.find((view) => view.name === 'brand')?.standard).toBe(false);
  });
});

describe('groupNameProblem', () => {
  const config = defaultConfig();

  it('accepteert een nieuwe naam in kleine letters met streepjes', () => {
    expect(groupNameProblem(config, 'brand-2')).toBeNull();
  });

  it('weigert ongeldige, inverse en bestaande namen', () => {
    expect(groupNameProblem(config, 'Brand')).toMatch(/kleine letters/);
    expect(groupNameProblem(config, 'brand-')).toMatch(/kleine letters/);
    expect(groupNameProblem(config, 'brand-inverse')).toMatch(/-inverse/);
    expect(groupNameProblem(config, 'accent-1')).toMatch(/bestaat al/);
  });
});
