import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import ts from 'typescript';

import manifest from '../packages/components-html/manifest';
import type { ApiProp } from '../packages/components-html/manifest';

/**
 * De `api` in de manifest komt overeen met het props-type in React.
 *
 * De manifest beschrijft de API één keer, voor elk platform. Het interface
 * `{Name}Props` in `{Name}.tsx` beschrijft hem nog een keer, voor React. Deze
 * test maakt een verschil tussen de twee een rode test in plaats van stille
 * drift.
 *
 * De bron wordt met de TypeScript-parser gelezen en niet geïmporteerd: het gaat
 * om het gedeclareerde type (de volgorde van een union, of een prop optioneel
 * is), en dat bestaat at runtime niet meer.
 *
 * Alleen componenten mét een `api` worden gecontroleerd. De rest van de
 * manifest heeft nog alleen de samenvatting in `primaryProps` (issue #484).
 */

const REACT_SRC = path.resolve(__dirname, '../packages/components-react/src');

/** Elk component heeft className; die in elke manifest opnemen zegt niets. */
const UNIVERSAL_PROPS = new Set(['className']);

type Described =
  { type: string } | { values: (string | number)[] } | { unknown: string };

interface ReactProp {
  optional: boolean;
  described: Described;
}

interface ReactApi {
  props: Map<string, ReactProp>;
  defaults: Map<string, unknown>;
}

/**
 * De props van `{Name}Props` en de defaults uit de destructuring.
 *
 * Breidt het interface dat van een ander component uit
 * (`CheckboxOptionProps extends CheckboxProps`, ook via `Omit<...>`), dan
 * tellen die props mee: ze zijn deel van de API, en de manifest noemt ze
 * zonder `native`. Wat uit de React-attributen van het element komt
 * (`disabled` uit ButtonHTMLAttributes) staat in geen van die interfaces;
 * dat zijn in de manifest de `native` props.
 */
function readReactApi(name: string): ReactApi {
  const own = readOwnApi(name);
  const props = new Map<string, ReactProp>();
  const defaults = new Map<string, unknown>();

  for (const { component, omit } of own.extendsComponents) {
    const parent = readReactApi(component);
    for (const [prop, info] of parent.props) {
      if (!omit.includes(prop)) props.set(prop, info);
    }
    for (const [prop, value] of parent.defaults) {
      if (!omit.includes(prop)) defaults.set(prop, value);
    }
  }
  for (const [prop, info] of own.props) props.set(prop, info);
  for (const [prop, value] of own.defaults) defaults.set(prop, value);

  return { props, defaults };
}

function readOwnApi(name: string) {
  const file = path.join(REACT_SRC, name, `${name}.tsx`);
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf-8'),
    ts.ScriptTarget.Latest,
    true
  );

  const aliases = new Map<string, ts.TypeNode>();
  const patterns: ts.ObjectBindingPattern[] = [];
  let propsInterface: ts.InterfaceDeclaration | undefined;

  const visit = (node: ts.Node) => {
    if (ts.isTypeAliasDeclaration(node)) aliases.set(node.name.text, node.type);
    if (ts.isInterfaceDeclaration(node) && node.name.text === `${name}Props`) {
      propsInterface = node;
    }
    if (ts.isParameter(node) && ts.isObjectBindingPattern(node.name)) {
      patterns.push(node.name);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  if (!propsInterface) throw new Error(`${name}Props niet gevonden`);

  const literal = (node: ts.TypeNode) => {
    if (!ts.isLiteralTypeNode(node)) return undefined;
    if (ts.isStringLiteral(node.literal)) return node.literal.text;
    if (ts.isNumericLiteral(node.literal)) return Number(node.literal.text);
    return undefined;
  };

  const describeType = (node: ts.TypeNode): Described => {
    if (node.kind === ts.SyntaxKind.BooleanKeyword) return { type: 'boolean' };
    if (node.kind === ts.SyntaxKind.StringKeyword) return { type: 'string' };
    if (node.kind === ts.SyntaxKind.NumberKeyword) return { type: 'number' };
    if (ts.isTypeReferenceNode(node)) {
      const ref = node.typeName.getText(source);
      if (ref === 'React.ReactNode' || ref === 'ReactNode') {
        return { type: 'ReactNode' };
      }
      const alias = aliases.get(ref);
      if (alias) return describeType(alias);
    }
    if (ts.isUnionTypeNode(node)) {
      const values = node.types.map(literal);
      if (values.every((value) => value !== undefined)) {
        return { values: values as (string | number)[] };
      }
    }
    return { unknown: node.getText(source) };
  };

  const props = new Map<string, ReactProp>();
  for (const member of propsInterface.members) {
    if (!ts.isPropertySignature(member) || !member.type) continue;
    props.set(member.name.getText(source), {
      optional: Boolean(member.questionToken),
      described: describeType(member.type),
    });
  }

  // `extends CheckboxProps` of `extends Omit<CheckboxProps, 'id'>`: alleen
  // interfaces van andere componenten in components-react. React.*Attributes
  // en andere types horen bij het element, niet bij de API.
  const extendsComponents: { component: string; omit: string[] }[] = [];
  for (const clause of propsInterface.heritageClauses ?? []) {
    for (const heritage of clause.types) {
      let target = heritage.expression.getText(source);
      let omit: string[] = [];
      if (target === 'Omit' && heritage.typeArguments?.length === 2) {
        const [base, keys] = heritage.typeArguments;
        target = base.getText(source);
        omit = (ts.isUnionTypeNode(keys) ? keys.types : [keys])
          .map(literal)
          .filter((key): key is string => typeof key === 'string');
      }
      const component = /^([A-Z]\w*)Props$/.exec(target)?.[1];
      if (
        component &&
        component !== name &&
        existsSync(path.join(REACT_SRC, component, `${component}.tsx`))
      ) {
        extendsComponents.push({ component, omit });
      }
    }
  }

  // De destructuring van het component is het patroon dat de meeste props
  // noemt; een callback verderop in het bestand kan er ook een hebben.
  const overlap = (pattern: ts.ObjectBindingPattern) =>
    pattern.elements.filter((element) =>
      props.has(element.name.getText(source))
    ).length;
  const [pattern] = [...patterns].sort((a, b) => overlap(b) - overlap(a));

  const defaults = new Map<string, unknown>();
  for (const element of pattern?.elements ?? []) {
    const init = element.initializer;
    if (!init) continue;
    let value: unknown = `<${init.getText(source)}>`;
    if (ts.isStringLiteral(init)) value = init.text;
    else if (ts.isNumericLiteral(init)) value = Number(init.text);
    else if (init.kind === ts.SyntaxKind.TrueKeyword) value = true;
    else if (init.kind === ts.SyntaxKind.FalseKeyword) value = false;
    defaults.set(element.name.getText(source), value);
  }

  return { props, defaults, extendsComponents };
}

/** Wat de manifest over het type zegt, in de vorm van readReactApi. */
function manifestType(prop: ApiProp): Described {
  return prop.values ? { values: prop.values } : { type: String(prop.type) };
}

const covered = manifest.components.filter(
  (component) => component.api && component.platforms.includes('react')
);

describe('manifest-api versus React', () => {
  it('controleert minstens één component', () => {
    expect(covered.length).toBeGreaterThan(0);
  });

  describe.each(covered.map((component) => [component.name, component]))(
    '%s',
    (name, component) => {
      const api = component.api!;
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
