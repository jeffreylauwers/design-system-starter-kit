/**
 * De API van een component, gelezen uit `components-html/manifest.json`.
 *
 * Een matrix noemt de assen van een component set. Waar een as een prop is
 * (`variant`, `size`), staan de waarden en hun volgorde al in de `api` van het
 * component in de manifest. Een matrix die ze daar leest, kan niet stil uit de
 * pas lopen met de code: de manifest wordt in een test vergeleken met het
 * props-type in React, en met de matrix zelf (`manifest.test.ts`).
 *
 * Assen die geen prop zijn (`state`) en keuzes die alleen voor Figma gelden
 * (welke combinaties weg kunnen) blijven in de matrix.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST = path.resolve(
  __dirname,
  '..',
  '..',
  'components-html',
  'manifest.json'
);

let components;

/** De manifest-entry van een component, of een fout als die er niet is. */
export function manifestComponent(name) {
  components ??= JSON.parse(fs.readFileSync(MANIFEST, 'utf8')).components;
  const component = components.find((entry) => entry.name === name);
  if (!component) {
    throw new Error(`${name} staat niet in components-html/manifest.json`);
  }
  return component;
}

/**
 * De waarden van de prop die in Figma de as `axis` is.
 *
 * Normaal zijn dat de `values` van de prop, in de volgorde van de manifest (en
 * dus van de union in React). Spelt Figma ze anders, dan staan ze in `values`
 * van de binding: `16-9` voor `16:9`, een andere volgorde, of een deel van
 * de enum. Heeft de prop geen default, dan staat de waarde voor "niet gezet"
 * (`unset`, zoals `auto`) vooraan. Getallen worden tekst (`level` 1 wordt
 * '1'), want een Figma-variant is altijd tekst.
 *
 * Gooit een fout als de manifest die as niet aan een enum-prop koppelt. Een
 * matrix die stil terugvalt op een eigen lijst, is precies de drift die dit
 * moet voorkomen.
 */
export function axisValues(componentName, axis) {
  const { api } = manifestComponent(componentName);
  const owns = (binding) =>
    binding.kind === 'variant' &&
    binding.property === axis &&
    binding.value === undefined;
  const prop = api?.props.find((candidate) => candidate.figma?.some(owns));
  if (!prop?.values) {
    throw new Error(
      `${componentName}: geen enum-prop die in Figma de as '${axis}' is (api.props in de manifest)`
    );
  }
  const binding = prop.figma.find(owns);
  const values = binding.values ?? prop.values;
  return [...(binding.unset ? [binding.unset] : []), ...values].map(String);
}
