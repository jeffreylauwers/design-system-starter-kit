import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

import schema from '../manifest-schema.json';
import manifest from '../manifest.json';

const require = createRequire(import.meta.url);
const { validateManifest } = require('./validate-manifest.js') as {
  validateManifest: (manifest: unknown, schema: unknown) => string[];
};

/**
 * A manifest under mutation. Components are loose maps rather than the real
 * ComponentEntry, because the point of most tests here is to write a value the
 * real type would never allow.
 */
interface DraftManifest {
  $schema?: string;
  version?: string;
  description?: string;
  components: Record<string, unknown>[];
}

/** Deep-clones the real manifest so a test can break one thing in it. */
function withManifest(mutate: (draft: DraftManifest) => void) {
  const draft = structuredClone(manifest) as unknown as DraftManifest;
  mutate(draft);
  return validateManifest(draft, schema);
}

describe('validateManifest', () => {
  it('accepts the checked-in manifest', () => {
    expect(validateManifest(manifest, schema)).toEqual([]);
  });

  it('rejects an unknown platform', () => {
    const errors = withManifest((draft) => {
      draft.components[0].platforms = ['html-css', 'vue'];
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('"vue" is geen geldige waarde');
  });

  it('rejects an unknown category', () => {
    const errors = withManifest((draft) => {
      draft.components[0].category = 'lay-out';
    });

    expect(errors[0]).toContain('/components/0/category');
  });

  it('rejects a missing required field', () => {
    const errors = withManifest((draft) => {
      delete draft.components[0].platforms;
    });

    expect(errors[0]).toContain("mist verplicht veld 'platforms'");
  });

  it('rejects a misspelled field name', () => {
    const errors = withManifest((draft) => {
      draft.components[0].platform = ['react'];
    });

    expect(errors).toContain("/components/0: onbekend veld 'platform'");
  });

  it('rejects a cssBlock without the dsn- prefix', () => {
    const errors = withManifest((draft) => {
      draft.components[0].cssBlock = 'action-group';
    });

    expect(errors[0]).toContain('matcht niet op');
  });

  it('rejects a component name that is not PascalCase', () => {
    const errors = withManifest((draft) => {
      draft.components[0].name = 'action-group';
    });

    expect(errors[0]).toContain('/components/0/name');
  });

  it('rejects a wrong type', () => {
    const errors = withManifest((draft) => {
      draft.components[0].platforms = 'html-css';
    });

    expect(errors[0]).toContain('verwacht type array');
  });

  it('reports a wrong type once, not once per nested keyword', () => {
    const errors = withManifest((draft) => {
      draft.components[0].primaryProps = null;
    });

    expect(errors).toHaveLength(1);
  });

  it('rejects duplicate platforms', () => {
    const errors = withManifest((draft) => {
      draft.components[0].platforms = ['react', 'react'];
    });

    expect(errors[0]).toContain('dubbele items');
  });

  it('rejects a duplicate component name', () => {
    const errors = withManifest((draft) => {
      draft.components.push(structuredClone(draft.components[0]));
    });

    expect(errors).toContain("/components: 'ActionGroup' staat er dubbel in");
  });

  it('reports every problem at once, not just the first', () => {
    const errors = withManifest((draft) => {
      draft.components[0].category = 'nope';
      draft.components[1].platforms = [];
    });

    expect(errors).toHaveLength(2);
  });

  it('throws when the schema uses a keyword it cannot check', () => {
    const unsupported = { type: 'object', oneOf: [] };

    expect(() => validateManifest({}, unsupported)).toThrow(/oneOf/);
  });
});
