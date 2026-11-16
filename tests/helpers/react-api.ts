import { existsSync, readdirSync, readFileSync } from 'fs';
import path from 'path';
import ts from 'typescript';

/**
 * Leest de API van een React-component uit de broncode.
 *
 * Met de TypeScript-parser, niet door te importeren: het gaat om het
 * gedeclareerde type (de volgorde van een union, of een prop optioneel is),
 * en dat bestaat at runtime niet meer. Gebruikt door
 * `tests/manifest-react.test.ts`.
 */

const REACT_SRC = path.resolve(
  __dirname,
  '../../packages/components-react/src'
);
const CORE_TYPES = path.resolve(__dirname, '../../packages/core/src/types');

export type Described =
  { type: string } | { values: (string | number)[] } | { unknown: string };

export interface ReactProp {
  optional: boolean;
  described: Described;
}

export interface ReactApi {
  props: Map<string, ReactProp>;
  defaults: Map<string, unknown>;
}

const parse = (file: string) =>
  ts.createSourceFile(
    file,
    readFileSync(file, 'utf-8'),
    ts.ScriptTarget.Latest,
    true
  );

/**
 * Type-aliassen uit `@dsn-starter-kit/core` (`FormControlInlineSize`). Een
 * component importeert ze van het package; de bron staat in core/src/types.
 */
let coreAliases: Map<string, { node: ts.TypeNode; source: ts.SourceFile }>;
function getCoreAliases() {
  if (!coreAliases) {
    coreAliases = new Map();
    for (const file of readdirSync(CORE_TYPES)) {
      if (!file.endsWith('.ts')) continue;
      const source = parse(path.join(CORE_TYPES, file));
      source.forEachChild((node) => {
        if (ts.isTypeAliasDeclaration(node)) {
          coreAliases.set(node.name.text, { node: node.type, source });
        }
      });
    }
  }
  return coreAliases;
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
export function readReactApi(name: string): ReactApi {
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
  const source = parse(file);

  const aliases = new Map<string, { node: ts.TypeNode; source: ts.SourceFile }>(
    getCoreAliases()
  );
  const interfaces = new Set<string>();
  const patterns: ts.ObjectBindingPattern[] = [];
  let propsInterface: ts.InterfaceDeclaration | undefined;

  const visit = (node: ts.Node) => {
    if (ts.isTypeAliasDeclaration(node)) {
      aliases.set(node.name.text, { node: node.type, source });
    }
    if (ts.isInterfaceDeclaration(node)) {
      interfaces.add(node.name.text);
      if (node.name.text === `${name}Props`) propsInterface = node;
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

  const describeType = (node: ts.TypeNode, from: ts.SourceFile): Described => {
    if (node.kind === ts.SyntaxKind.BooleanKeyword) return { type: 'boolean' };
    if (node.kind === ts.SyntaxKind.StringKeyword) return { type: 'string' };
    if (node.kind === ts.SyntaxKind.NumberKeyword) return { type: 'number' };
    if (ts.isFunctionTypeNode(node)) return { type: 'function' };
    if (ts.isTypeLiteralNode(node)) return { type: 'object' };
    if (ts.isParenthesizedTypeNode(node)) return describeType(node.type, from);
    if (ts.isTypeReferenceNode(node)) {
      const ref = node.typeName.getText(from);
      if (ref === 'React.ReactNode' || ref === 'ReactNode') {
        return { type: 'ReactNode' };
      }
      // Exclude<Union, 'a' | 'b'>: de union zonder die waarden.
      if (ref === 'Exclude' && node.typeArguments?.length === 2) {
        const [base, removed] = node.typeArguments;
        const described = describeType(base, from);
        if (!('values' in described)) return { unknown: node.getText(from) };
        const drop = (
          ts.isUnionTypeNode(removed) ? removed.types : [removed]
        ).map(literal);
        return {
          values: described.values.filter((value) => !drop.includes(value)),
        };
      }
      const alias = aliases.get(ref);
      if (alias) return describeType(alias.node, alias.source);
      if (interfaces.has(ref)) return { type: 'object' };
    }
    if (ts.isUnionTypeNode(node)) {
      const values = node.types.map(literal);
      if (values.every((value) => value !== undefined)) {
        return { values: values as (string | number)[] };
      }
    }
    return { unknown: node.getText(from) };
  };

  const props = new Map<string, ReactProp>();
  for (const member of propsInterface.members) {
    if (!ts.isPropertySignature(member) || !member.type) continue;
    props.set(member.name.getText(source), {
      optional: Boolean(member.questionToken),
      described: describeType(member.type, source),
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
    const key = (element.propertyName ?? element.name).getText(source);
    let value: unknown = `<${init.getText(source)}>`;
    if (ts.isStringLiteral(init)) value = init.text;
    else if (ts.isNumericLiteral(init)) value = Number(init.text);
    else if (init.kind === ts.SyntaxKind.TrueKeyword) value = true;
    else if (init.kind === ts.SyntaxKind.FalseKeyword) value = false;
    defaults.set(key, value);
  }

  return { props, defaults, extendsComponents };
}
