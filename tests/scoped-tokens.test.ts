// @vitest-environment node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium, type Browser, type Page } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * Runtime omschakelen met klassen, gemeten in een echte browser.
 *
 * jsdom rekent geen custom properties uit stylesheets uit, dus deze test
 * draait Chromium via Playwright. Per scenario bouwt hij twee schone
 * documenten:
 *
 * - de referentie: de volledige config van die combinatie op `:root`, zoals
 *   `css/dark` dat doet;
 * - de klassenroute uit docs/00-getting-started.md: `css` (Start light op
 *   `:root`) plus alle scoped bestanden, met de klassen op een container.
 *
 * Op een element binnen de container moet elke custom property dezelfde
 * berekende waarde hebben als in de referentie, en een echte knop en een echt
 * tekstveld moeten er hetzelfde uitzien.
 *
 * Waarom dat niet vanzelf goed gaat: een custom property wordt opgelost op het
 * element waar hij gedeclareerd staat. Een componenttoken zoals
 * `--dsn-button-default-color: var(--dsn-color-action-1-color-default)` dat
 * alleen op `:root` staat, erft binnen een dark container als de al opgeloste
 * light-waarde. Zie DR-2026-18.
 */

const DIST = path.resolve(__dirname, '..', 'packages', 'design-tokens', 'dist');
const COMPONENTS = path.resolve(
  __dirname,
  '..',
  'packages',
  'components-html',
  'src'
);

const read = (file: string) => readFileSync(file, 'utf8');
const fullConfig = (name: string) =>
  read(path.join(DIST, 'css', `${name}.css`));
const scoped = (name: string) =>
  read(path.join(DIST, 'css', 'scoped', `${name}.css`));

const THEME_FILES = [
  'start-light',
  'start-dark',
  'wireframe-light',
  'wireframe-dark',
];
const DENSITY_FILES = ['density-default', 'density-information-dense'];

const COMPONENT_CSS = ['button/button.css', 'text-input/text-input.css']
  .map((file) => read(path.join(COMPONENTS, file)))
  .join('\n');

const PROBE = `
  <div id="probe">
    <button type="button" class="dsn-button dsn-button--default">
      <span class="dsn-button__label">Opslaan</span>
    </button>
    <input type="text" class="dsn-text-input" />
  </div>`;

/** Alle custom properties die een volledige config op :root zet. */
function declaredNames(css: string): string[] {
  const root = css.slice(0, css.indexOf('@media'));
  return [...root.matchAll(/^\s*(--[\w-]+):/gm)].map((match) => match[1]);
}

/** Een document met de gegeven CSS en de probe binnen geneste containers. */
function htmlDocument(css: string[], containers: string[]): string {
  const body = containers.reduceRight(
    (inner, className) => `<div class="${className}">${inner}</div>`,
    PROBE
  );
  const styles = [...css, COMPONENT_CSS]
    .map((text) => `<style>${text}</style>`)
    .join('\n');
  return `<!doctype html><html><head>${styles}</head><body>${body}</body></html>`;
}

interface Measurement {
  tokens: Record<string, string>;
  components: Record<string, string>;
}

async function measure(
  page: Page,
  html: string,
  names: string[]
): Promise<Measurement> {
  await page.setContent(html);
  return page.evaluate((tokenNames) => {
    const probe = document.getElementById('probe')!;
    const style = getComputedStyle(probe);
    const tokens = Object.fromEntries(
      tokenNames.map((name) => [name, style.getPropertyValue(name).trim()])
    );

    const button = getComputedStyle(probe.querySelector('.dsn-button')!);
    const input = getComputedStyle(probe.querySelector('.dsn-text-input')!);
    const components = {
      'button color': button.color,
      'button background-color': button.backgroundColor,
      'button border-radius': button.borderTopLeftRadius,
      'button font-family': button.fontFamily,
      'button font-size': button.fontSize,
      'button padding-inline-start': button.paddingInlineStart,
      'text-input padding-block-start': input.paddingBlockStart,
      'text-input border-width': input.borderTopWidth,
      'text-input color': input.color,
    };
    return { tokens, components };
  }, names);
}

interface Scenario {
  name: string;
  /** Klassen per container, van buiten naar binnen. */
  containers: string[];
  /** De volledige config die hetzelfde resultaat geeft op :root. */
  reference: string;
}

const SCENARIOS: Scenario[] = [
  { name: 'geen klassen', containers: [''], reference: 'start-light-default' },
  {
    name: 'Start dark',
    containers: ['dsn-theme-start dsn-mode-dark'],
    reference: 'start-dark-default',
  },
  {
    name: 'Wireframe light',
    containers: ['dsn-theme-wireframe'],
    reference: 'wireframe-light-default',
  },
  {
    name: 'Wireframe dark',
    containers: ['dsn-theme-wireframe dsn-mode-dark'],
    reference: 'wireframe-dark-default',
  },
  {
    name: 'dense',
    containers: ['dsn-density-dense'],
    reference: 'start-light-information-dense',
  },
  {
    name: 'Start dark en dense op één element',
    containers: ['dsn-theme-start dsn-mode-dark dsn-density-dense'],
    reference: 'start-dark-information-dense',
  },
  {
    name: 'Wireframe dark en dense op één element',
    containers: ['dsn-theme-wireframe dsn-mode-dark dsn-density-dense'],
    reference: 'wireframe-dark-information-dense',
  },
  {
    name: 'dense binnen Start dark',
    containers: ['dsn-theme-start dsn-mode-dark', 'dsn-density-dense'],
    reference: 'start-dark-information-dense',
  },
  {
    name: 'dense binnen Wireframe',
    containers: ['dsn-theme-wireframe', 'dsn-density-dense'],
    reference: 'wireframe-light-information-dense',
  },
  {
    name: 'Wireframe binnen dense',
    containers: ['dsn-density-dense', 'dsn-theme-wireframe'],
    reference: 'wireframe-light-information-dense',
  },
  {
    name: 'default binnen dense',
    containers: ['dsn-density-dense', 'dsn-density-default'],
    reference: 'start-light-default',
  },
  {
    name: 'Start binnen Wireframe',
    containers: ['dsn-theme-wireframe', 'dsn-theme-start'],
    reference: 'start-light-default',
  },
  {
    name: 'Wireframe binnen Start dark (mode erft mee)',
    containers: ['dsn-theme-start dsn-mode-dark', 'dsn-theme-wireframe'],
    reference: 'wireframe-dark-default',
  },
  {
    name: 'dark op de ouder, thema op het kind',
    containers: ['dsn-mode-dark', 'dsn-theme-wireframe'],
    reference: 'wireframe-dark-default',
  },
];

// De importvolgorde mag niet uitmaken: bij gelijke specificiteit wint de
// laatste regel, dus beide volgordes moeten hetzelfde resultaat geven.
const ORDERS = {
  'thema eerst': [...THEME_FILES, ...DENSITY_FILES],
  'dichtheid eerst': [...DENSITY_FILES, ...THEME_FILES],
};

describe('scoped tokens: klassen geven dezelfde waarden als de volledige config', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
  }, 60_000);

  afterAll(async () => {
    await browser?.close();
  });

  for (const [order, files] of Object.entries(ORDERS)) {
    describe(order, () => {
      for (const scenario of SCENARIOS) {
        it(scenario.name, { timeout: 30_000 }, async () => {
          const referenceCss = fullConfig(scenario.reference);
          const names = declaredNames(referenceCss);

          const expected = await measure(
            page,
            htmlDocument([referenceCss], ['']),
            names
          );
          const actual = await measure(
            page,
            htmlDocument(
              [fullConfig('variables'), ...files.map(scoped)],
              scenario.containers
            ),
            names
          );

          const mismatches = names.filter(
            (name) => actual.tokens[name] !== expected.tokens[name]
          );
          const sample = mismatches
            .slice(0, 8)
            .map(
              (name) =>
                `  ${name}: ${actual.tokens[name] || '(leeg)'}, verwacht ${expected.tokens[name]}`
            )
            .join('\n');
          expect
            .soft(
              mismatches.length,
              `${mismatches.length} van ${names.length} tokens wijken af van ${scenario.reference}:\n${sample}`
            )
            .toBe(0);
          expect.soft(actual.components).toEqual(expected.components);
        });
      }
    });
  }
});
