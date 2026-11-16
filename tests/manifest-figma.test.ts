import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import path from 'path';

import manifest from '../packages/components-html/manifest';
import type {
  ComponentEntry,
  FigmaBinding,
} from '../packages/components-html/manifest';

/**
 * De `api` in de manifest komt overeen met de Figma-matrix van het component.
 *
 * Elke as en elke component property in de matrix hoort bij precies één prop,
 * slot of state in de manifest, en andersom. Wat bewust niet in Figma staat,
 * heeft in de manifest een binding `none` met een reden. Zo is "loading staat
 * niet in Figma (#323)" data, en geen commentaar dat stil kan verouderen.
 *
 * Alleen componenten mét een `api` en mét een matrix worden gecontroleerd.
 */

const MATRICES = path.resolve(__dirname, '../packages/figma-sync/src/matrices');

/** Een matrix uit figma-sync; alleen de velden die hier tellen. */
interface Matrix {
  axes: Record<string, string[]>;
  componentProperties?: { name: string; type: string; slot?: string }[];
}

/** De vlag-as uit figma-sync/src/flags.js. */
const FLAG = ['false', 'true'];

/** De waarde van de state-as zonder toestand: de basis, geen state. */
const BASE_STATE = 'default';

const PROPERTY_KINDS: Record<string, FigmaBinding['kind']> = {
  TEXT: 'text',
  BOOLEAN: 'boolean',
  INSTANCE_SWAP: 'instance-swap',
};

const kebabCase = (name: string) =>
  name.replace(/(?<!^)(?=[A-Z])/g, '-').toLowerCase();

const matrixPath = (component: ComponentEntry) =>
  path.join(MATRICES, `${kebabCase(component.name)}.js`);

// Een describe-callback moet synchroon zijn, dus de matrices worden vooraf
// geladen.
const covered = await Promise.all(
  manifest.components
    .filter((component) => component.api && existsSync(matrixPath(component)))
    .map(async (component) => ({
      component,
      matrix: (await import(matrixPath(component))).default as Matrix,
    }))
);

describe('manifest-api versus Figma-matrix', () => {
  it('controleert minstens één component', () => {
    expect(covered.length).toBeGreaterThan(0);
  });

  describe.each(covered.map((entry) => [entry.component.name, entry] as const))(
    '%s',
    (_name, { component, matrix }) => {
      const api = component.api!;

      it('elke prop op een variant-as heeft precies de waarden van die as', () => {
        for (const prop of api.props) {
          for (const binding of prop.figma ?? []) {
            if (binding.kind !== 'variant') continue;
            const axis = matrix.axes[binding.property!];
            expect(axis, `as '${binding.property}' ontbreekt`).toBeDefined();
            const expected = prop.values?.map(String) ?? FLAG;
            if (!prop.values) expect(prop.type).toBe('boolean');
            expect(axis, `waarden van as '${binding.property}'`).toEqual(
              expected
            );
          }
        }
      });

      it('elke state op een variant-as staat als waarde op die as', () => {
        const byAxis = new Map<string, string[]>();
        for (const state of api.states) {
          for (const binding of state.figma) {
            if (binding.kind !== 'variant') continue;
            const values = byAxis.get(binding.property!) ?? [];
            byAxis.set(binding.property!, [...values, binding.value!]);
          }
        }
        for (const [axis, values] of byAxis) {
          expect(matrix.axes[axis], `as '${axis}'`).toEqual([
            BASE_STATE,
            ...values,
          ]);
        }
      });

      it('elke as in de matrix hoort bij een prop of state', () => {
        const claimed = new Set(
          [...api.props, ...api.states].flatMap((part) =>
            (part.figma ?? [])
              .filter((binding) => binding.kind === 'variant')
              .map((binding) => binding.property)
          )
        );
        const unclaimed = Object.keys(matrix.axes).filter(
          (axis) => !claimed.has(axis)
        );
        expect(unclaimed, 'assen zonder prop of state').toEqual([]);
      });

      it('component properties en manifest-bindingen zijn dezelfde set', () => {
        const fromManifest = [...api.props, ...api.slots]
          .flatMap((part) => part.figma ?? [])
          .filter((binding) =>
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

      it('een slot-property hangt aan het slot met dezelfde naam', () => {
        for (const property of matrix.componentProperties ?? []) {
          if (!property.slot) continue;
          const owner = api.slots.find((slot) =>
            slot.figma.some((binding) => binding.property === property.name)
          );
          expect(owner?.name, `slot van '${property.name}'`).toBe(
            property.slot
          );
        }
      });
    }
  );
});
