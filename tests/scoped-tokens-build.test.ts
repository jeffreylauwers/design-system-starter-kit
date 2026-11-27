// @vitest-environment node
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
// @ts-expect-error: JavaScript-module zonder types
import { buildScopedFiles } from '../packages/design-tokens/src/config/scoped.js';

/**
 * De afleiding van de scoped bestanden, op kleine verzonnen configs.
 * tests/scoped-tokens.test.ts controleert de echte output in een browser;
 * deze test legt de regels vast (zie DR-2026-18).
 */

type Configs = Record<string, Record<string, string>>;

let dir: string;

afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
});

/** Schrijft een volledige config per thema x mode x density en bouwt de scoped bestanden. */
function build(configs: Configs) {
  dir = mkdtempSync(path.join(os.tmpdir(), 'dsn-scoped-'));
  for (const [name, tokens] of Object.entries(configs)) {
    const lines = Object.entries(tokens).map(
      ([token, value]) => `  ${token}: ${value}; /** Beschrijving. */`
    );
    writeFileSync(
      path.join(dir, `${name}.css`),
      `/**\n * Do not edit directly\n */\n\n:root {\n${lines.join('\n')}\n}\n`
    );
  }
  return buildScopedFiles({
    distDir: dir,
    themes: ['a', 'b'],
    modes: ['light', 'dark'],
    projectTypes: ['default', 'dense'],
    themeModeSelector: (theme: string, mode: string) =>
      mode === 'light' ? `.t-${theme}` : `.t-${theme}.m-dark`,
    densitySelectors: { default: ':root, .d-default', dense: '.d-dense' },
  });
}

const read = (file: string) =>
  readFileSync(path.join(dir, 'scoped', file), 'utf8');

/** Een set configs waarin elke soort token één keer voorkomt. */
function configs(
  overrides: (name: string) => Record<string, string> = () => ({})
) {
  const result: Configs = {};
  for (const theme of ['a', 'b']) {
    for (const mode of ['light', 'dark']) {
      for (const density of ['default', 'dense']) {
        const name = `${theme}-${mode}-${density}`;
        result[name] = {
          '--static': '4px',
          '--color': mode === 'dark' ? 'black' : 'white',
          '--button': 'var(--color)',
          '--space': density === 'dense' ? '1rem' : '2rem',
          '--space-lg': density === 'dense' ? '2rem' : '3rem',
          '--card': 'var(--space)',
          // Per thema een andere maat, en die maat verschilt per density.
          '--padding': theme === 'b' ? 'var(--space-lg)' : 'var(--space)',
          ...overrides(name),
        };
      }
    }
  }
  return result;
}

describe('buildScopedFiles', () => {
  it('neemt een token op die naar een verschillende token verwijst', () => {
    build(configs());
    const dark = read('a-dark.css');
    expect(dark).toContain('.t-a.m-dark {');
    expect(dark).toContain('  --color: black;');
    expect(dark).toContain('  --button: var(--color);');
    expect(dark).not.toMatch(/^\s*--static:/m);
    expect(dark).not.toMatch(/^\s*--space:/m);
    // Beschrijvingen staan al in de volledige config.
    expect(dark).not.toContain('Beschrijving');
  });

  it('geeft elk thema x mode-bestand dezelfde set tokens', () => {
    build(configs());
    const names = (file: string) =>
      [...read(file).matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]).sort();
    expect(names('a-light.css')).toEqual(names('b-dark.css'));
    expect(names('a-light.css')).toEqual(['--button', '--color', '--padding']);
  });

  it('zet een declaratie die per thema verschilt met specificiteit 0 in het density-bestand', () => {
    build(configs());
    const dense = read('density-dense.css');
    expect(dense).toMatch(/^\.d-dense \{\n {2}--space: 1rem;/m);
    expect(dense).toContain('  --card: var(--space);');
    expect(dense).toMatch(
      /^:where\(\.d-dense\) \{\n {2}--padding: var\(--space\);\n\}/m
    );
    // Thema b wijkt af van :root; zijn dark-variant niet van zijn light-variant.
    expect(dense).toMatch(
      /^:where\(\.t-b\) :where\(\.d-dense\) \{\n {2}--padding: var\(--space-lg\);\n\}/m
    );
    expect(dense).not.toContain(':where(.t-b.m-dark)');
    expect(dense).not.toContain(':where(.t-a');
    // In het themabestand verschilt --padding niet per density: gewone regel.
    expect(read('b-light.css')).toContain('  --padding: var(--space-lg);');
    expect(read('b-light.css')).not.toContain(':where');
  });

  it('meldt een token die in een config ontbreekt', () => {
    const results = build(
      configs((name) => (name.startsWith('a-') ? { '--backdrop': 'grey' } : {}))
    );
    const b = results.find((r: { file: string }) => r.file === 'b-light.css');
    expect(b.missing).toEqual(['--backdrop']);
    expect(read('a-light.css')).toContain('  --backdrop: grey;');
  });

  it('stopt als een declaratie op beide assen verschilt', () => {
    expect(() =>
      build(
        configs((name) => ({
          '--both': name.startsWith('a-')
            ? name.endsWith('dense')
              ? '1px'
              : '2px'
            : name.endsWith('dense')
              ? '3px'
              : '4px',
        }))
      )
    ).toThrow(/--both: de declaratie verschilt per/);
  });
});
