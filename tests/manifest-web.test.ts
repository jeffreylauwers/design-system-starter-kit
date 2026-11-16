import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import path from 'path';
import ts from 'typescript';

import manifest from '../packages/components-html/manifest';
import type { ApiProp } from '../packages/components-html/manifest';

/**
 * De `api` in de manifest komt overeen met de web components.
 *
 * Een web component krijgt zijn props als attributen (`observedAttributes`)
 * en zijn inhoud via `<slot>`. Deze test legt die naast de manifest:
 *
 * - elk attribuut hoort bij een prop, en elke prop met een waarde (een enum,
 *   boolean, string of getal) die het component zelf declareert, is een
 *   attribuut. De naam is de kebab-case vorm van de prop (`fullWidth` wordt
 *   `full-width`), of wat `attribute` in de manifest zegt.
 * - de waarden van een enum zijn dezelfde. De volgorde telt hier niet mee:
 *   die doet er voor een attribuut niet toe.
 * - elk named slot (`<slot name="icon-start">`) staat in `api.slots`.
 *
 * Gecontroleerd voor elk component met `web-components` in `platforms`.
 */

const WEB_SRC = path.resolve(__dirname, '../packages/components-web/src');

const kebabCase = (name: string) =>
  name.replace(/(?<!^)(?=[A-Z])/g, '-').toLowerCase();

/** De attributen, slotnamen en enum-types van een web component. */
function readWebComponent(name: string) {
  const dir = path.join(WEB_SRC, kebabCase(name));
  const fileName = readdirSync(dir).find((file) => file === `${name}.ts`);
  if (!fileName) throw new Error(`${name}.ts niet gevonden in ${dir}`);
  const text = readFileSync(path.join(dir, fileName), 'utf-8');
  const source = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.Latest,
    true
  );

  const attributes: string[] = [];
  const enums = new Map<string, string[]>();

  const visit = (node: ts.Node) => {
    if (
      ts.isGetAccessorDeclaration(node) &&
      node.name.getText(source) === 'observedAttributes'
    ) {
      node.forEachChild(function find(child) {
        if (ts.isArrayLiteralExpression(child)) {
          for (const element of child.elements) {
            if (ts.isStringLiteral(element)) attributes.push(element.text);
          }
        }
        child.forEachChild(find);
      });
    }
    if (ts.isTypeAliasDeclaration(node) && ts.isUnionTypeNode(node.type)) {
      const values = node.type.types.map((member) =>
        ts.isLiteralTypeNode(member) && ts.isStringLiteral(member.literal)
          ? member.literal.text
          : undefined
      );
      if (values.every((value) => value !== undefined)) {
        enums.set(node.name.text, values as string[]);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  const slots = [...text.matchAll(/<slot name="([^"]+)"/g)].map(
    (match) => match[1]
  );

  return { attributes, enums, slots };
}

const attributeOf = (prop: ApiProp) => prop.attribute ?? kebabCase(prop.name);

/** Props die een web component als attribuut hoort te hebben. */
const isAttributeProp = (prop: ApiProp) =>
  !prop.native &&
  (prop.values !== undefined ||
    ['boolean', 'string', 'number'].includes(String(prop.type)));

const covered = manifest.components.filter((component) =>
  component.platforms.includes('web-components')
);

describe('manifest-api versus web components', () => {
  it('controleert minstens één component', () => {
    expect(covered.length).toBeGreaterThan(0);
  });

  describe.each(covered.map((component) => [component.name, component]))(
    '%s',
    (name, component) => {
      const web = readWebComponent(name);
      const props = component.api.props;

      it('elk attribuut hoort bij een prop', () => {
        const known = new Set(props.map(attributeOf));
        const unknown = web.attributes.filter(
          (attribute) => !known.has(attribute)
        );
        expect(unknown, 'attributen zonder prop in de manifest').toEqual([]);
      });

      it('elke prop met een waarde is een attribuut', () => {
        const missing = props
          .filter(isAttributeProp)
          .map(attributeOf)
          .filter((attribute) => !web.attributes.includes(attribute));
        expect(missing, 'props zonder attribuut').toEqual([]);
      });

      it('een enum heeft dezelfde waarden', () => {
        for (const prop of props) {
          if (!prop.values) continue;
          // ButtonVariant, HeadingLevel: het type in het web component.
          const type = web.enums.get(
            `${name}${prop.name[0].toUpperCase()}${prop.name.slice(1)}`
          );
          if (!type) continue;
          expect([...type].sort(), `waarden van ${prop.name}`).toEqual(
            prop.values.map(String).sort()
          );
        }
      });

      it('elk named slot staat in de manifest', () => {
        const known = new Set(component.api.slots.map((slot) => slot.name));
        const unknown = web.slots.filter((slot) => !known.has(slot));
        expect(unknown, 'slots zonder manifest-slot').toEqual([]);
      });
    }
  );
});
