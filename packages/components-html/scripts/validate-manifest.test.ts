import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import schema from '../manifest-schema.json';
import manifest from '../manifest.json';

const require = createRequire(import.meta.url);
const { validateManifest, validateComponent } =
  require('./validate-manifest.js') as {
    validateManifest: (manifest: unknown, schema: unknown) => string[];
    validateComponent: (
      component: unknown,
      schema: unknown,
      at?: string
    ) => string[];
  };
const { assembleManifest, findParts, format, kebabCase } =
  require('./build-manifest.js') as {
    assembleManifest: () => { manifest: unknown; errors: string[] };
    findParts: () => string[];
    format: (manifest: unknown) => Promise<string>;
    kebabCase: (name: string) => string;
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

/** A component with a minimal, valid api block, as a part file would hold. */
function componentWithApi() {
  return {
    name: 'Example',
    cssBlock: 'dsn-example',
    category: 'content',
    purpose: 'An example.',
    platforms: ['html-css', 'react'],
    primaryProps: [
      { name: 'size', values: ['small', 'large'], default: 'small' },
    ],
    api: {
      props: [
        {
          name: 'size',
          values: ['small', 'large'],
          default: 'small',
          figma: [{ kind: 'variant', property: 'size' }],
        },
        { name: 'children', type: 'ReactNode', slots: ['label'] },
      ],
      slots: [
        {
          name: 'label',
          element: 'dsn-example__label',
          figma: [{ kind: 'text', property: 'label' }],
        },
      ],
      states: [
        {
          name: 'hover',
          selector: ':hover',
          figma: [{ kind: 'variant', property: 'state', value: 'hover' }],
        },
      ],
    },
  };
}

type Draft = ReturnType<typeof componentWithApi> & Record<string, unknown>;

function withComponent(mutate: (draft: Draft) => void) {
  const draft = componentWithApi() as Draft;
  mutate(draft);
  return validateComponent(draft, schema, 'example.manifest.json');
}

describe('validateComponent: api block', () => {
  it('accepts a valid api block', () => {
    expect(withComponent(() => {})).toEqual([]);
  });

  it('accepts a component without an api block', () => {
    expect(
      withComponent((draft) => delete (draft as Partial<Draft>).api)
    ).toEqual([]);
  });

  it('prefixes errors with the file name', () => {
    const errors = withComponent((draft) => {
      draft.category = 'nope';
    });

    expect(errors[0]).toMatch(/^example\.manifest\.json\/category/);
  });

  it('requires a reason for a part left out of Figma', () => {
    const errors = withComponent((draft) => {
      draft.api.props[0].figma = [{ kind: 'none' }] as never;
    });

    expect(errors).toContain(
      "example.manifest.json/api/props/0/figma: 'none' heeft een reason nodig"
    );
  });

  it('rejects none next to another binding', () => {
    const errors = withComponent((draft) => {
      draft.api.props[0].figma = [
        { kind: 'none', reason: 'x' },
        { kind: 'variant', property: 'size' },
      ] as (typeof draft.api.props)[0]['figma'];
    });

    expect(errors.join('\n')).toContain('kan niet samen');
  });

  it('requires a property on every other binding', () => {
    const errors = withComponent((draft) => {
      draft.api.slots[0].figma = [{ kind: 'text' }] as never;
    });

    expect(errors.join('\n')).toContain("'text' heeft een property nodig");
  });

  it('requires a value on a state bound to a variant axis', () => {
    const errors = withComponent((draft) => {
      draft.api.states[0].figma = [
        { kind: 'variant', property: 'state' },
      ] as never;
    });

    expect(errors.join('\n')).toContain('heeft een value nodig');
  });

  it('rejects two parts claiming the same Figma property', () => {
    const errors = withComponent((draft) => {
      draft.api.slots[0].figma = [
        { kind: 'variant', property: 'size' },
      ] as never;
    });

    expect(errors.join('\n')).toContain('is al gekoppeld');
  });

  it('requires either figma or slots on a prop, not both', () => {
    const errors = withComponent((draft) => {
      (draft.api.props[1] as Record<string, unknown>).figma = [
        { kind: 'text', property: 'other' },
      ];
    });

    expect(errors.join('\n')).toContain('precies één van figma en slots');
  });

  it('rejects a prop that fills a slot that does not exist', () => {
    const errors = withComponent((draft) => {
      draft.api.props[1].slots = ['lable'];
    });

    expect(errors.join('\n')).toContain("slot 'lable' staat niet in api.slots");
  });

  it('rejects primaryProps that contradict api.props', () => {
    const errors = withComponent((draft) => {
      draft.primaryProps[0].values = ['large', 'small'];
    });

    expect(errors.join('\n')).toContain("values van 'size'");
  });

  it('rejects a primary prop missing from api.props', () => {
    const errors = withComponent((draft) => {
      draft.primaryProps.push({ name: 'tone', values: ['a'], default: 'a' });
    });

    expect(errors.join('\n')).toContain("'tone' ontbreekt in api.props");
  });
});

describe('build-manifest', () => {
  it('produces the checked-in manifest.json from the part files', async () => {
    const { manifest: assembled, errors } = assembleManifest();

    expect(errors).toEqual([]);
    expect(await format(assembled)).toBe(
      readFileSync(resolve(__dirname, '../manifest.json'), 'utf-8')
    );
  });

  it('finds one part file per component', () => {
    expect(findParts()).toHaveLength(manifest.components.length);
  });

  it('derives the file name from the component name', () => {
    expect(kebabCase('EmailInput')).toBe('email-input');
    expect(kebabCase('Button')).toBe('button');
  });
});
