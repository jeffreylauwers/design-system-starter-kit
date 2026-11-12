import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import {
  selectTokens,
  type TokenDoc,
  type TokenSelection,
} from '../packages/storybook/src/components/tokenSelection';

/**
 * De pagina Foundations/Design Tokens toont elk semantisch token.
 *
 * De tabellen op die pagina kiezen hun tokens met `prefix`, `exclude` en
 * `tokens` uit `token-docs.json`; namen en descriptions staan dus alleen in de
 * JSON. Deze test past dezelfde selectie toe als `TokenTable` en bewaakt:
 * - elk semantisch token (een token zonder component) staat in precies één
 *   tabel, zodat een nieuw token niet stil van de pagina wegvalt en er geen
 *   dubbele rijen ontstaan;
 * - elke tabel toont minstens één token en elke losse naam bestaat.
 *
 * `token-docs.json` is build-uitvoer: draai eerst `pnpm build`.
 */

const ROOT = path.resolve(__dirname, '..');
const TOKEN_DOCS = path.join(
  ROOT,
  'packages/design-tokens/dist/json/token-docs.json'
);
const PAGE = path.join(ROOT, 'packages/storybook/src/DesignTokens.mdx');

function readTokens(): TokenDoc[] {
  if (!existsSync(TOKEN_DOCS)) {
    throw new Error(
      `${path.relative(ROOT, TOKEN_DOCS)} ontbreekt: draai eerst pnpm build`
    );
  }
  return JSON.parse(readFileSync(TOKEN_DOCS, 'utf8')).tokens;
}

/** De props van elke `<TokenTable ... />` op de pagina. */
function tables(): (TokenSelection & { source: string })[] {
  const page = readFileSync(PAGE, 'utf8');
  return [...page.matchAll(/<TokenTable\b([^>]*?)\/>/g)].map(
    ([source, attrs]) => {
      const attr = (name: string) =>
        attrs.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
      return {
        source: source.replace(/\s+/g, ' '),
        prefix: attr('prefix'),
        exclude: attr('exclude'),
        tokens: attr('tokens'),
      };
    }
  );
}

describe('pagina Design Tokens', () => {
  const all = readTokens();
  const selections = tables().map((table) => ({
    table,
    rows: selectTokens(all, table),
  }));

  it('elke tabel toont tokens die bestaan', () => {
    const problems = selections.flatMap(({ table, rows }) => [
      ...(rows.length ? [] : [`lege tabel: ${table.source}`]),
      ...rows
        .filter((row) => row.description === undefined)
        .map((row) => `onbekend token ${row.name}: ${table.source}`),
    ]);
    expect(problems).toEqual([]);
  });

  it('elk semantisch token staat in precies één tabel', () => {
    const count = new Map<string, number>();
    for (const { rows } of selections) {
      for (const row of rows)
        count.set(row.name, (count.get(row.name) ?? 0) + 1);
    }
    const semantic = all.filter((token) => !token.component);
    const missing = semantic
      .filter((token) => !count.has(token.name))
      .map((token) => token.name);
    const duplicate = [...count].filter(([, n]) => n > 1).map(([name]) => name);

    expect({ missing, duplicate }).toEqual({ missing: [], duplicate: [] });
  });
});
