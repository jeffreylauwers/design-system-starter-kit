/**
 * Generates the icon registry from the SVG files in components-html/assets/icons/.
 *
 * Run: node scripts/generate-icons.js
 *
 * This produces src/Icon/icon-registry.generated.ts containing:
 * - Eén React-component per icoon, met de SVG-inhoud inline
 * - IconName union type
 * - iconMap record
 *
 * De SVG-inhoud wordt bewust ingelijfd in plaats van geïmporteerd. Een import als
 * `../../../components-html/assets/icons/x.svg?react` werkt alleen binnen deze monorepo
 * met vite-plugin-svgr geconfigureerd. Consumers die het npm-package installeren hebben
 * geen van beide, waardoor hun bundler faalt op "Module not found". Inline SVG maakt
 * dist zelfstandig en bundler-onafhankelijk.
 *
 * To add a new icon: drop the SVG into components-html/assets/icons/ and re-run this script.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const iconsDir = path.resolve(__dirname, '../../components-html/assets/icons');
const outputPath = path.resolve(
  __dirname,
  '../src/Icon/icon-registry.generated.ts'
);

// Verify the icons source directory exists
if (!fs.existsSync(iconsDir)) {
  console.error(`Error: Icons directory not found at ${iconsDir}`);
  console.error('Make sure packages/components-html/assets/icons/ exists.');
  process.exit(1);
}

// Read all .svg files and sort alphabetically
const svgFiles = fs
  .readdirSync(iconsDir)
  .filter((f) => f.endsWith('.svg'))
  .sort();

if (svgFiles.length === 0) {
  console.warn(`Warning: No .svg files found in ${iconsDir}`);
}

const iconNames = svgFiles.map((f) => f.replace('.svg', ''));

// Convert icon name to PascalCase variable name, e.g. "chevron-down" -> "ChevronDown"
function toPascalCase(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

// SVG-attribuutnaam naar React-propnaam: stroke-width -> strokeWidth.
// aria-* en data-* houdt React zelf in kebab-case.
function toReactAttributeName(attribute) {
  if (attribute.startsWith('aria-') || attribute.startsWith('data-')) {
    return attribute;
  }
  return attribute.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function parseAttributes(source, file) {
  const attributes = {};
  const pattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const [, name, value] = match;
    // De class van Tabler ('icon icon-tabler ...') is overbodig: Icon.tsx zet zelf
    // de dsn-icon-klassen via className.
    if (name === 'class') continue;
    attributes[toReactAttributeName(name)] = value;
  }
  return attributes;
}

/**
 * Parseert een Tabler-SVG naar root-attributen plus een platte lijst kindelementen.
 * Alleen self-closing kindelementen worden ondersteund; alles anders faalt hard,
 * zodat een afwijkend icoon opvalt tijdens de build in plaats van stil verkeerd te renderen.
 */
function parseSvg(svgSource, file) {
  const rootMatch = svgSource.match(/<svg\b([^>]*)>/);
  if (!rootMatch) {
    throw new Error(`No <svg> root element found in ${file}`);
  }

  const rootAttributes = parseAttributes(rootMatch[1], file);
  const inner = svgSource
    .slice(
      rootMatch.index + rootMatch[0].length,
      svgSource.lastIndexOf('</svg>')
    )
    .trim();

  const children = [];
  const childPattern = /<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*?)\/>/g;
  let consumed = 0;
  let match;
  while ((match = childPattern.exec(inner)) !== null) {
    // Alles tussen twee elementen moet whitespace zijn; anders staat er markup
    // die deze parser niet aankan (geneste elementen, <title>, tekst).
    const between = inner.slice(consumed, match.index).trim();
    if (between !== '') {
      throw new Error(
        `Unsupported SVG markup in ${file}: "${between.slice(0, 60)}". ` +
          'Only self-closing child elements are supported.'
      );
    }
    children.push([match[1], parseAttributes(match[2], file)]);
    consumed = match.index + match[0].length;
  }

  const trailing = inner.slice(consumed).trim();
  if (trailing !== '') {
    throw new Error(
      `Unsupported SVG markup in ${file}: "${trailing.slice(0, 60)}". ` +
        'Only self-closing child elements are supported.'
    );
  }

  if (children.length === 0) {
    throw new Error(`No drawable elements found in ${file}`);
  }

  return { rootAttributes, children };
}

const icons = svgFiles.map((file) => {
  const svgSource = fs.readFileSync(path.join(iconsDir, file), 'utf-8');
  const name = file.replace('.svg', '');
  return { name, ...parseSvg(svgSource, file) };
});

const serialize = (value) => JSON.stringify(value);

const definitions = icons
  .map(({ name, rootAttributes, children }) => {
    const variable = `${toPascalCase(name)}Icon`;
    const nodes = children
      .map(
        ([tag, attributes]) =>
          `    [${serialize(tag)}, ${serialize(attributes)}],`
      )
      .join('\n');
    return `const ${variable} = createIcon(
  ${serialize(variable)},
  ${serialize(rootAttributes)},
  [
${nodes}
  ]
);`;
  })
  .join('\n\n');

const typeUnion = icons.map(({ name }) => `  | '${name}'`).join('\n');

const mapEntries = icons
  .map(({ name }) => `  '${name}': ${toPascalCase(name)}Icon,`)
  .join('\n');

const output = `// Auto-generated — do not edit manually.
// Run: node scripts/generate-icons.js
//
// De SVG-inhoud staat hier inline zodat dist zelfstandig is: geen losse .svg-bestanden
// en geen svgr-configuratie nodig bij de consumer.
import React from 'react';

export type IconComponent = React.ForwardRefExoticComponent<
  React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>
>;

type IconNode = [tag: string, attributes: Record<string, string>];

function createIcon(
  displayName: string,
  rootAttributes: Record<string, string>,
  nodes: IconNode[]
): IconComponent {
  const Component = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    (props, ref) =>
      React.createElement(
        'svg',
        { ...rootAttributes, ...props, ref },
        nodes.map(([tag, attributes], index) =>
          React.createElement(tag, { key: index, ...attributes })
        )
      )
  );
  Component.displayName = displayName;
  return Component;
}

${definitions}

export type IconName =
${typeUnion};

export const iconMap: Record<IconName, IconComponent> = {
${mapEntries}
};
`;

// Ensure the output directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, output, 'utf-8');
console.log(
  `Generated icon registry with ${icons.length} inlined icons: ${outputPath}`
);
