import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'fs';
import path from 'path';

/**
 * De token-tabellen in Storybook komen uit de design tokens, niet uit de
 * Markdown. Een `.docs.md` bevat alleen markers als
 * `<!-- tokens: checkbox-group -->`; `DocsMarkdown` maakt daar bij het renderen
 * een tabel van met de namen en descriptions uit `token-docs.json`.
 *
 * Deze test bewaakt dat dat zo blijft:
 * - elke marker wijst naar een bestaand component of token;
 * - elk component met tokens heeft ergens een marker, zodat een nieuw
 *   component niet stil zonder tabel blijft;
 * - een token-naam die in de tekst van een docs-pagina staat, bestaat ook
 *   echt (als token of als custom property in de component-CSS).
 *
 * `token-docs.json` is build-uitvoer: draai eerst `pnpm build`.
 */

const ROOT = path.resolve(__dirname, '..');
const TOKEN_DOCS = path.join(
  ROOT,
  'packages/design-tokens/dist/json/token-docs.json'
);
const DOCS_DIR = path.join(ROOT, 'packages/storybook/src');
const COMPONENT_TOKENS_DIR = path.join(
  ROOT,
  'packages/design-tokens/src/tokens/components'
);

interface TokenDoc {
  name: string;
  description: string;
  component: string | null;
}

const MARKER = /<!--\s*tokens:\s*(.*?)\s*-->/g;

function readTokens(): TokenDoc[] {
  if (!existsSync(TOKEN_DOCS)) {
    throw new Error(
      `${path.relative(ROOT, TOKEN_DOCS)} ontbreekt: draai eerst pnpm build`
    );
  }
  return JSON.parse(readFileSync(TOKEN_DOCS, 'utf8')).tokens;
}

const docs = readdirSync(DOCS_DIR)
  .filter((file) => file.endsWith('.docs.md'))
  .map((file) => ({
    file,
    text: readFileSync(path.join(DOCS_DIR, file), 'utf8'),
  }));

function markerItems(text: string): string[] {
  return [...text.matchAll(MARKER)].flatMap((match) =>
    match[1].split(/\s+/).filter(Boolean)
  );
}

/** Custom properties die een component zelf zet, zoals `--dsn-stack-space`. */
function declaredCustomProperties(): Set<string> {
  const names = new Set<string>();
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(css|tsx?)$/.test(entry.name)) {
        const source = readFileSync(full, 'utf8');
        for (const match of source.matchAll(
          /['"]?(--dsn-[a-z0-9-]+)['"]?\??\s*:/g
        )) {
          names.add(match[1]);
        }
      }
    }
  };
  walk(path.join(ROOT, 'packages/components-html/src'));
  walk(path.join(ROOT, 'packages/components-react/src'));
  return names;
}

describe('token-tabellen in Storybook', () => {
  const tokens = readTokens();
  const tokenNames = new Set(tokens.map((token) => token.name));
  const components = new Set(
    tokens.map((token) => token.component).filter(Boolean)
  );

  it('elke marker wijst naar een bestaand component of token', () => {
    const unknown = docs.flatMap(({ file, text }) =>
      markerItems(text)
        .filter((item) =>
          item.startsWith('--') ? !tokenNames.has(item) : !components.has(item)
        )
        .map((item) => `${file}: ${item}`)
    );
    expect(unknown).toEqual([]);
  });

  it('elk component-tokenbestand heeft een tabel in Storybook', () => {
    const documented = new Set(docs.flatMap(({ text }) => markerItems(text)));
    const missing = readdirSync(COMPONENT_TOKENS_DIR)
      .filter((file) => file.endsWith('.json'))
      .map((file) => path.basename(file, '.json'))
      .filter((component) => !documented.has(component));
    expect(missing).toEqual([]);
  });

  it('geen handgeschreven token-tabellen', () => {
    const handWritten = docs
      .filter(({ text }) => /^\|\s*`--dsn-[a-z0-9-]+`/m.test(text))
      .map(({ file }) => file);
    expect(handWritten).toEqual([]);
  });

  it('token-namen in de tekst bestaan', () => {
    const declared = declaredCustomProperties();
    const unknown = docs.flatMap(({ file, text }) =>
      [...text.replace(MARKER, '').matchAll(/`(--dsn-[a-z0-9-]+)`/g)]
        .map((match) => match[1])
        .filter((name) => !tokenNames.has(name) && !declared.has(name))
        .map((name) => `${file}: ${name}`)
    );
    expect([...new Set(unknown)]).toEqual([]);
  });
});
