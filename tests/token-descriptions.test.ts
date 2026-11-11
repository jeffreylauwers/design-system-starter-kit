import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';

/**
 * Tokens hebben in elk thema, elke mode en elk project-type
 * dezelfde $description. De tekst beschrijft de rol (en bij kleur de
 * contrasteis), niet de waarde, dus hoort hij niet per bestand te
 * verschillen. Komt een token in meerdere bestanden van een groep voor,
 * dan moet de description overal gelijk zijn.
 */

const TOKENS_DIR = path.resolve(
  __dirname,
  '../packages/design-tokens/src/tokens'
);

const GROUPS: Record<string, string[]> = {
  kleur: [
    'themes/start/colors-light.json',
    'themes/start/colors-dark.json',
    'themes/wireframe/colors-light.json',
    'themes/wireframe/colors-dark.json',
  ],
  base: [
    'themes/start/base.json',
    'themes/wireframe/base.json',
    'project-types/default/space.json',
    'project-types/default/typography.json',
    'project-types/information-dense/typography.json',
  ],
  component: [
    ...readdirSync(path.join(TOKENS_DIR, 'components'))
      .filter((file) => file.endsWith('.json'))
      .map((file) => `components/${file}`),
    'project-types/information-dense/grid.json',
  ],
};

// Een concrete maat of duur in een description veroudert zodra een project
// de waarde aanpast.
const CONCRETE_VALUE = /\d+(\.\d+)?\s?(px|rem|em|ms|s|%)(?![a-z])/i;

type TokenNode = { $value?: unknown; $description?: string } & {
  [key: string]: unknown;
};

function collectDescriptions(file: string): Map<string, string | undefined> {
  const json = JSON.parse(
    readFileSync(path.join(TOKENS_DIR, file), 'utf-8')
  ) as TokenNode;
  const result = new Map<string, string | undefined>();
  const walk = (node: TokenNode, trail: string[]) => {
    if ('$value' in node) {
      result.set(trail.join('.'), node.$description);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (child && typeof child === 'object' && !key.startsWith('$')) {
        walk(child as TokenNode, [...trail, key]);
      }
    }
  };
  walk(json, []);
  return result;
}

describe.each(Object.entries(GROUPS))('%s-descriptions', (_group, files) => {
  const perFile = files.map(
    (file) => [file, collectDescriptions(file)] as const
  );

  it.each(files)(
    '%s geeft elke token een description zonder em dash of waarde',
    (file) => {
      const descriptions = perFile.find(([f]) => f === file)![1];
      for (const [token, description] of descriptions) {
        expect(description, `${token} in ${file}`).toBeTruthy();
        expect(description, `${token} in ${file}`).not.toContain('—');
        expect(description, `${token} in ${file}`).not.toMatch(CONCRETE_VALUE);
      }
    }
  );

  it('heeft voor elke token in alle bestanden dezelfde description', () => {
    const first = new Map<string, { file: string; text?: string }>();
    for (const [file, descriptions] of perFile) {
      for (const [token, text] of descriptions) {
        const seen = first.get(token);
        if (!seen) {
          first.set(token, { file, text });
          continue;
        }
        expect(text, `${token}: ${file} wijkt af van ${seen.file}`).toBe(
          seen.text
        );
      }
    }
  });
});
