import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import path from 'path';

import manifest from '../packages/components-html/manifest';
import type {
  ApiProp,
  ApiSlot,
  ApiState,
  ComponentEntry,
  FigmaBinding,
} from '../packages/components-html/manifest';

/**
 * De `api` in de manifest komt overeen met de Figma-matrix van het component.
 *
 * Elke as, elke waarde op een gedeelde as, elke component property en elk
 * Figma-slot in de matrix hoort bij precies één prop, slot of state in de
 * manifest, en andersom. Wat bewust niet in Figma staat, heeft daar een
 * binding `none` met een reden. Zo is "loading staat niet in Figma (#323)"
 * data, en geen commentaar dat stil kan verouderen.
 *
 * Alleen componenten mét een `api` en mét een matrix worden gecontroleerd.
 */

const MATRICES = path.resolve(__dirname, '../packages/figma-sync/src/matrices');

/** Een matrix uit figma-sync; alleen de velden die hier tellen. */
interface Matrix {
  axes?: Record<string, string[]>;
  componentProperties?: { name: string; type: string; slot?: string }[];
  /** De as die viewports kiest: een keuze van figma-sync, geen API. */
  viewportAxis?: string;
  /** Bouwt geneste componenten als instance (zie figma-sync/src/instances.js). */
  instances?: boolean;
  render: (combination: Record<string, string>) => string;
}

/** De vlag-as uit figma-sync/src/flags.js. */
const FLAG = ['false', 'true'];

const PROPERTY_KINDS: Record<string, FigmaBinding['kind']> = {
  TEXT: 'text',
  BOOLEAN: 'boolean',
  INSTANCE_SWAP: 'instance-swap',
};

/**
 * Componenten die nog geen `api`-blok hebben (issue #488). Deze lijst krimpt
 * tot hij leeg is. Een nieuw component hoort er niet in: dat krijgt meteen
 * een `api`-blok.
 */
const WITHOUT_API = new Set([
  'ActionGroup',
  'Body',
  'BreadcrumbNavigation',
  'BreakoutSection',
  'ButtonLink',
  'Container',
  'FormField',
  'FormFieldDescription',
  'FormFieldErrorMessage',
  'FormFieldLabel',
  'FormFieldLegend',
  'FormFieldStatus',
  'FormFieldset',
  'Grid',
  'Heading',
  'HeadingGroup',
  'Hero',
  'Icon',
  'IconList',
  'Link',
  'LinkButton',
  'Logo',
  'Menu',
  'MenuButton',
  'MenuLink',
  'OrderedList',
  'PageBody',
  'PageFooter',
  'PageHeader',
  'PageLayout',
  'Paragraph',
  'PopoverMenu',
  'PreHeading',
  'SkipLink',
  'Stack',
  'TableOfContents',
  'UnorderedList',
]);

const kebabCase = (name: string) =>
  name.replace(/(?<!^)(?=[A-Z])/g, '-').toLowerCase();

const matrixPath = (name: string) =>
  path.join(MATRICES, `${kebabCase(name)}.js`);

const loadMatrix = async (name: string) =>
  (await import(matrixPath(name))).default as Matrix;

// Een describe-callback moet synchroon zijn, dus de matrices worden vooraf
// geladen.
const covered = await Promise.all(
  manifest.components
    .filter(
      (component) => component.api && existsSync(matrixPath(component.name))
    )
    .map(async (component) => ({
      component,
      matrix: await loadMatrix(component.name),
    }))
);

/** De matrices van geneste instances waar een binding naar wijst. */
const nestedMatrices = new Map<string, Matrix>();
for (const { component } of covered) {
  for (const binding of bindingsOf(component)) {
    const name = binding.instance;
    if (name && !nestedMatrices.has(name) && existsSync(matrixPath(name))) {
      nestedMatrices.set(name, await loadMatrix(name));
    }
  }
}

type Part = ApiProp | ApiSlot | ApiState;

interface Claim {
  part: Part;
  owner: 'prop' | 'slot' | 'state';
  binding: FigmaBinding;
}

function claimsOf(component: ComponentEntry): Claim[] {
  const api = component.api!;
  return [
    ...api.props.map((part) => ({ part, owner: 'prop' as const })),
    ...api.slots.map((part) => ({ part, owner: 'slot' as const })),
    ...api.states.map((part) => ({ part, owner: 'state' as const })),
  ].flatMap(({ part, owner }) =>
    (part.figma ?? []).map((binding) => ({ part, owner, binding }))
  );
}

function bindingsOf(component: ComponentEntry) {
  return claimsOf(component).map((claim) => claim.binding);
}

/** De eerste waarde van elke as: genoeg om de opbouw van de markup te zien. */
function firstCombination(matrix: Matrix) {
  return Object.fromEntries(
    Object.entries(matrix.axes ?? {}).map(([axis, values]) => [axis, values[0]])
  );
}

describe('manifest-api versus Figma-matrix', () => {
  it('controleert minstens één component', () => {
    expect(covered.length).toBeGreaterThan(0);
  });

  describe.each(covered.map((entry) => [entry.component.name, entry] as const))(
    '%s',
    (_name, { component, matrix }) => {
      const claims = claimsOf(component);
      const axes = Object.fromEntries(
        Object.entries(matrix.axes ?? {}).filter(
          ([axis]) => axis !== matrix.viewportAxis
        )
      );
      const variantClaims = claims.filter(
        (claim) => claim.binding.kind === 'variant'
      );

      it('elke as in de matrix hoort bij een prop, slot of state', () => {
        const claimed = new Set(
          variantClaims.map((claim) => claim.binding.property)
        );
        const unclaimed = Object.keys(axes).filter(
          (axis) => !claimed.has(axis)
        );
        expect(unclaimed, 'assen zonder prop, slot of state').toEqual([]);
      });

      it('elke variant-binding wijst naar een bestaande as', () => {
        const missing = variantClaims
          .map((claim) => claim.binding.property!)
          .filter((axis) => !axes[axis]);
        expect(missing, 'assen die de matrix niet heeft').toEqual([]);
      });

      it('een as is van één onderdeel, of verdeeld over waarden', () => {
        const byAxis = new Map<string, Claim[]>();
        for (const claim of variantClaims) {
          const axis = claim.binding.property!;
          byAxis.set(axis, [...(byAxis.get(axis) ?? []), claim]);
        }
        for (const [axis, axisClaims] of byAxis) {
          const values = axes[axis];
          if (!values) continue; // hierboven al gemeld
          const whole = axisClaims.filter((c) => c.binding.value === undefined);

          if (whole.length > 0) {
            expect(axisClaims, `as '${axis}': één eigenaar`).toHaveLength(1);
            const [{ part, owner }] = whole;
            const { unset, values: spelled } = whole[0].binding;
            const before = unset ? [unset] : [];
            if (spelled) {
              // De binding noemt de waarden zoals Figma ze spelt.
              expect(values, `waarden van as '${axis}'`).toEqual([
                ...before,
                ...spelled,
              ]);
              continue;
            }
            const prop = owner === 'prop' ? (part as ApiProp) : undefined;
            if (prop?.values) {
              // Een enum is zijn waarden, met de waarde voor "niet gezet"
              // ervoor als de prop geen default heeft.
              expect(values, `waarden van as '${axis}'`).toEqual([
                ...before,
                ...prop.values.map(String),
              ]);
            } else if (prop?.type === 'boolean') {
              expect(values, `waarden van as '${axis}'`).toEqual(FLAG);
            } else {
              // Een slot, of een tekst die er wel of niet is: twee waarden.
              expect(values, `as '${axis}' van ${part.name}`).toHaveLength(2);
            }
            continue;
          }

          // Verdeeld: elk onderdeel heeft een eigen waarde, en precies één
          // waarde blijft over als basis (unchecked, default).
          const taken = axisClaims.map((claim) => claim.binding.value!);
          const unknown = taken.filter((value) => !values.includes(value));
          expect(unknown, `waarden die as '${axis}' niet heeft`).toEqual([]);
          const base = values.filter((value) => !taken.includes(value));
          expect(base, `as '${axis}': precies één basiswaarde`).toHaveLength(1);
        }
      });

      it('component properties en manifest-bindingen zijn dezelfde set', () => {
        const fromManifest = claims
          .map((claim) => claim.binding)
          .filter(
            (binding) =>
              !binding.instance &&
              Object.values(PROPERTY_KINDS).includes(binding.kind)
          )
          .map((binding) => `${binding.kind} ${binding.property}`)
          .sort();
        const fromMatrix = (matrix.componentProperties ?? [])
          .map((property) => {
            const kind = PROPERTY_KINDS[property.type] ?? property.type;
            return `${kind} ${property.name}`;
          })
          .sort();
        expect(fromMatrix).toEqual(fromManifest);
      });

      it('hangt een property aan een manifest-slot, dan heet dat slot zo', () => {
        // Een property kan ook aan een prop hangen (value en placeholder van
        // een tekstveld): dat is een attribuut, geen inhoud.
        for (const property of matrix.componentProperties ?? []) {
          if (!property.slot) continue;
          const owner = component.api!.slots.find((slot) =>
            slot.figma.some(
              (binding) =>
                !binding.instance && binding.property === property.name
            )
          );
          if (owner) {
            expect(owner.name, `slot van '${property.name}'`).toBe(
              property.slot
            );
          }
        }
      });

      it('Figma-slots en manifest-bindingen zijn dezelfde set', () => {
        const html = matrix.render(firstCombination(matrix));
        const fromMatrix = [
          ...html.matchAll(/data-figma-children="([^"]+)"/g),
        ].map((match) => match[1]);
        const fromManifest = claims
          .filter((claim) => claim.binding.kind === 'slot')
          .map((claim) => claim.binding.property);
        expect([...new Set(fromMatrix)].sort()).toEqual(fromManifest.sort());
      });

      it('een property van een geneste instance bestaat op dat component', () => {
        const html = matrix.render(firstCombination(matrix));
        for (const { binding, part } of claims) {
          if (!binding.instance) continue;
          // Alleen een matrix met `instances: true` maakt van een genest
          // component een instance; anders worden het gemeten lagen, zonder
          // property.
          expect(
            matrix.instances,
            `${part.name}: ${binding.instance} is alleen een instance met instances: true`
          ).toBe(true);
          const block = manifest.components.find(
            (entry) => entry.name === binding.instance
          )?.cssBlock;
          expect(
            html,
            `${part.name}: ${block} staat in de markup van de matrix`
          ).toMatch(new RegExp(`class="([^"]* )?${block}( |")`));
          const nested = nestedMatrices.get(binding.instance);
          expect(nested, `matrix van ${binding.instance}`).toBeDefined();
          const property = nested?.componentProperties?.find(
            (candidate) => candidate.name === binding.property
          );
          expect(
            property && PROPERTY_KINDS[property.type],
            `${part.name}: ${binding.kind} '${binding.property}' op ${binding.instance}`
          ).toBe(binding.kind);
        }
      });
    }
  );
});

describe('voortgang van de api-blokken (#488)', () => {
  it('elk component zonder api staat in WITHOUT_API', () => {
    const missing = manifest.components
      .filter((component) => !component.api && !WITHOUT_API.has(component.name))
      .map((component) => component.name);
    expect(missing, 'geef deze componenten een api-blok').toEqual([]);
  });

  it('WITHOUT_API noemt alleen componenten zonder api', () => {
    const done = manifest.components
      .filter((component) => component.api && WITHOUT_API.has(component.name))
      .map((component) => component.name);
    expect(done, 'haal deze uit WITHOUT_API').toEqual([]);
  });
});
