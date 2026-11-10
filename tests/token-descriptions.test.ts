import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

/**
 * Kleurtokens hebben in elk thema en elke mode dezelfde $description.
 * De tekst beschrijft rol en contrasteis, niet de waarde, dus hoort hij
 * niet per bestand te verschillen. Deze test bewaakt dat de vier
 * kleurbestanden gelijk blijven.
 */

const THEMES_DIR = path.resolve(
  __dirname,
  '../packages/design-tokens/src/tokens/themes'
);
const REFERENCE = 'start/colors-light.json';
const OTHERS = [
  'start/colors-dark.json',
  'wireframe/colors-light.json',
  'wireframe/colors-dark.json',
];

type TokenNode = { $value?: unknown; $description?: string } & {
  [key: string]: unknown;
};

function collectDescriptions(file: string): Map<string, string | undefined> {
  const json = JSON.parse(
    readFileSync(path.join(THEMES_DIR, file), 'utf-8')
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

const reference = collectDescriptions(REFERENCE);

describe('kleurtoken-descriptions', () => {
  it('geeft elke token in het referentiebestand een description zonder em dash', () => {
    for (const [token, description] of reference) {
      expect(description, token).toBeTruthy();
      expect(description, token).not.toContain('—');
    }
  });

  it.each(OTHERS)('%s heeft dezelfde descriptions als ' + REFERENCE, (file) => {
    const other = collectDescriptions(file);
    for (const [token, description] of other) {
      expect(reference.has(token), `${token} ontbreekt in ${REFERENCE}`).toBe(
        true
      );
      expect(description, token).toBe(reference.get(token));
    }
  });
});
