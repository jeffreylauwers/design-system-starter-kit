import { describe, it, expect } from 'vitest';

import manifest from '../packages/components-html/manifest';
import type { ApiProp } from '../packages/components-html/manifest';
import { readReactApi } from './helpers/react-api';
import type { Described } from './helpers/react-api';

/**
 * De `api` in de manifest komt overeen met het props-type in React.
 *
 * De manifest beschrijft de API één keer, voor elk platform. Het interface
 * `{Name}Props` in `{Name}.tsx` beschrijft hem nog een keer, voor React. Deze
 * test maakt een verschil tussen de twee een rode test in plaats van stille
 * drift.
 *
 * `helpers/react-api.ts` leest de bron met de TypeScript-parser.
 */

/** Elk component heeft className; die in elke manifest opnemen zegt niets. */
const UNIVERSAL_PROPS = new Set(['className']);

/** Wat de manifest over het type zegt, in de vorm van readReactApi. */
function manifestType(prop: ApiProp): Described {
  return prop.values ? { values: prop.values } : { type: String(prop.type) };
}

const covered = manifest.components.filter((component) =>
  component.platforms.includes('react')
);

describe('manifest-api versus React', () => {
  it('controleert minstens één component', () => {
    expect(covered.length).toBeGreaterThan(0);
  });

  describe.each(covered.map((component) => [component.name, component]))(
    '%s',
    (name, component) => {
      const api = component.api;
      const react = readReactApi(name);

      it('noemt elke prop van het React-props-interface', () => {
        const listed = new Set(api.props.map((prop) => prop.name));
        const missing = [...react.props.keys()].filter(
          (prop) => !UNIVERSAL_PROPS.has(prop) && !listed.has(prop)
        );
        expect(missing, 'wel in React, niet in de manifest').toEqual([]);
      });

      it('noemt geen prop die React niet declareert', () => {
        const unknown = api.props
          .filter((prop) => !prop.native && !react.props.has(prop.name))
          .map((prop) => prop.name);
        expect(unknown, 'wel in de manifest, niet in React').toEqual([]);
      });

      it('markeert alleen attributen van het element als native', () => {
        const declared = api.props
          .filter((prop) => prop.native && react.props.has(prop.name))
          .map((prop) => prop.name);
        expect(declared, 'native, maar staat in het props-type').toEqual([]);
      });

      const own = api.props.filter((prop) => !prop.native);
      it.each(own.map((prop) => [prop.name, prop] as const))(
        'prop %s: type, values en optioneel komen overeen',
        (propName, prop) => {
          const declared = react.props.get(propName);
          if (!declared) return; // hierboven al gemeld
          expect(manifestType(prop)).toEqual(declared.described);
          expect(Boolean(prop.required)).toBe(!declared.optional);
        }
      );

      it.each(api.props.map((prop) => [prop.name, prop] as const))(
        'prop %s: default komt overeen met de destructuring',
        (propName, prop) => {
          const expected = react.defaults.get(propName);
          // Een optionele boolean zonder default in de destructuring
          // (disabled, invalid) is undefined, en dat werkt als false. Dat mag
          // de manifest zo noemen.
          if (
            expected === undefined &&
            prop.type === 'boolean' &&
            !prop.required &&
            prop.default === false
          ) {
            return;
          }
          expect(prop.default ?? undefined).toEqual(expected);
        }
      );
    }
  );
});
