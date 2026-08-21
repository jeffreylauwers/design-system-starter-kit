/**
 * Leest de *computed* layout van een component uit een echte browser.
 *
 * De CSS parsen zou onbetrouwbaar zijn: cascade, custom properties, clamp() en
 * media queries bepalen samen pas de eindwaarde. Door de component te renderen
 * en getComputedStyle te lezen krijgen we exact wat de gebruiker ziet, en
 * bovendien flexbox-informatie die vrijwel 1-op-1 op Figma auto layout past.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '..', '..', '..');

/** `@dsn-starter-kit/x/y/z.css` -> absoluut pad binnen de monorepo. */
function resolveCssPath(specifier) {
  const match = specifier.match(/^@dsn-starter-kit\/([^/]+)\/(.+)$/);
  if (!match) return path.resolve(monorepoRoot, specifier);
  return path.join(monorepoRoot, 'packages', match[1], match[2]);
}

/**
 * Eigenschappen die we uitlezen. Alles wat hier niet in staat bestaat voor de
 * generator niet, dus deze lijst is de feitelijke scope van de conversie.
 */
const CAPTURED_PROPERTIES = [
  'display',
  'flexDirection',
  'flexWrap',
  'gap',
  'rowGap',
  'columnGap',
  'alignItems',
  'justifyContent',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'backgroundColor',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderTopColor',
  'borderStyle',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'color',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'lineHeight',
  'letterSpacing',
  'textAlign',
  'textDecorationLine',
  'textTransform',
  'opacity',
  'boxShadow',
  'position',
  'overflow',
];

/**
 * Loopt de DOM af binnen de browser en geeft een boom terug met per element
 * de computed styles en de positie ten opzichte van de root.
 */
/* c8 ignore start - draait in de browsercontext, niet in Node */
function domWalker(properties) {
  const root = document.querySelector('[data-figma-root]');
  if (!root) throw new Error('geen [data-figma-root] gevonden');
  const origin = root.getBoundingClientRect();

  const readStyles = (element) => {
    const computed = getComputedStyle(element);
    const result = {};
    for (const property of properties) result[property] = computed[property];
    return result;
  };

  const visit = (element) => {
    const rect = element.getBoundingClientRect();
    const node = {
      tag: element.tagName.toLowerCase(),
      classes: Array.from(element.classList),
      rect: {
        x: Math.round((rect.x - origin.x) * 100) / 100,
        y: Math.round((rect.y - origin.y) * 100) / 100,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100,
      },
      styles: readStyles(element),
      children: [],
    };

    // SVG wordt niet uitgelopen: dat wordt in Figma één vector-node.
    if (node.tag === 'svg') {
      node.kind = 'vector';
      node.svg = element.outerHTML;
      return node;
    }

    for (const child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent.trim();
        if (text) node.children.push({ kind: 'text', text });
        continue;
      }
      if (child.nodeType === Node.ELEMENT_NODE)
        node.children.push(visit(child));
    }

    return node;
  };

  return visit(root);
}
/* c8 ignore stop */

/**
 * Rendert elke cel van de matrix en levert de computed boom per variant.
 *
 * @param {object} matrix Een matrixdefinitie uit src/matrices/
 * @returns {Promise<Array<{variant: object, tree: object}>>}
 */
export async function extractMatrix(matrix) {
  const stylesheets = matrix.css
    .map(resolveCssPath)
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n');

  const fontLinks = (matrix.fonts ?? [])
    .map((href) => `<link rel="stylesheet" href="${href}">`)
    .join('');

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  const combinations = cartesian(matrix.axes);
  const results = [];

  try {
    for (const combination of combinations) {
      await page.setContent(
        `<!doctype html><html><head><meta charset="utf-8"><style>
           /* Neutrale ondergrond zodat de component zelf de enige bron van
              layout is en er geen body-marges meelekken. */
           *, *::before, *::after { box-sizing: border-box; }
           body { margin: 0; padding: 40px; background: #fff; }
         </style>${fontLinks}<style>${stylesheets}</style></head>
         <body>${matrix.render(combination)}</body></html>`,
        { waitUntil: 'load' }
      );

      // Zonder document.fonts.ready meet de eerste variant nog met een
      // fallback-font en wijken de breedtes af van de rest.
      await page.evaluate(() => document.fonts.ready);

      const pseudo = matrix.pseudoStates?.[combination.state];
      if (pseudo === 'hover') {
        await page.hover('[data-figma-root]');
      }

      const tree = await page.evaluate(domWalker, CAPTURED_PROPERTIES);
      results.push({ variant: combination, tree });
    }
  } finally {
    await browser.close();
  }

  return results;
}

/** Alle combinaties van de assen, in stabiele volgorde. */
export function cartesian(axes) {
  return Object.entries(axes).reduce(
    (accumulator, [name, values]) =>
      accumulator.flatMap((base) =>
        values.map((value) => ({ ...base, [name]: value }))
      ),
    [{}]
  );
}
