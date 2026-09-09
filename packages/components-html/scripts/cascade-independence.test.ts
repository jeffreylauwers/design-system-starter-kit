import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Bewaakt dat een component-override niet van de bronvolgorde afhangt.
 *
 * Sommige elementen dragen twee component-klassen tegelijk, bijvoorbeeld
 * `class="dsn-button ... dsn-date-input__button"`. Zetten beide klassen
 * dezelfde CSS-eigenschap, dan hebben ze met één klasse elk dezelfde
 * specificiteit (0,1,0) en beslist de bronvolgorde wie wint.
 *
 * Die volgorde is geen eigenschap van dit pakket. Bundlers splitsen CSS per
 * component-chunk, en elk chunk dat een basiscomponent meeneemt (Table en
 * MenuLink importeren button.css) kan ná de override landen. Dan draait de
 * uitkomst om, zonder dat er iets aan de CSS veranderd is.
 *
 * De regel is daarom: overschrijf je een eigenschap van een basiscomponent,
 * verzwaar de selector dan met de klasse van dat basiscomponent, zodat de
 * uitkomst op specificiteit wordt beslist. Dus
 * `.dsn-button.dsn-date-input__button` in plaats van `.dsn-date-input__button`.
 *
 * Deze test leest de bron-CSS en de markup uit de repo, zoekt de elementen die
 * twee component-klassen dragen, en meldt elke override die alleen door
 * volgorde overeind blijft. Hij is opgezet als vangnet voor nieuwe gevallen:
 * DateInput (`position`), TimeInput (`position`) en MenuLink (`align-self`)
 * zijn hier alle drie eerder op stukgelopen, en table.css draagt in zijn
 * commentaar dezelfde les over de sorteericonen.
 */

/**
 * Gevallen die vandaag alleen door de bronvolgorde goed gaan, en die bewust
 * nog niet verzwaard zijn. Ze staan hier zodat de test nieuwe gevallen wél
 * afvangt zonder dat de bekende schuld hem permanent rood maakt.
 *
 * Waarom nog niet opgelost: bij deze regels moeten de begeleidende regels mee
 * verzwaard worden, anders verliezen die op hun beurt. `.dsn-details__icon` en
 * `.dsn-file__status-icon` worden bijvoorbeeld overschreven vanuit
 * `@media (forced-colors: active)` en `@media (prefers-reduced-motion)`, en een
 * media query verhoogt de specificiteit niet. Verzwaar je alleen de basisregel,
 * dan breekt hoog contrast of de reduced-motion-uitzondering. Dat vraagt om een
 * eigen ronde met eigen verificatie.
 *
 * Werk je zo'n geval weg, haal het dan hier weg.
 */
const KNOWN_ORDER_DEPENDENT = new Set([
  'dsn-progress-bar__description',
  'dsn-breadcrumb-navigation__separator',
  'dsn-breadcrumb-navigation__back-icon',
  'dsn-checkbox__icon',
  'dsn-details__icon',
  'dsn-file__status-icon',
]);

const SRC = join(import.meta.dirname, '..', 'src');
const REPO = join(import.meta.dirname, '..', '..', '..');

/** Mappen met markup waarin twee component-klassen gecombineerd kunnen zijn. */
const MARKUP_DIRS = [
  'packages/components-react/src',
  'packages/storybook/src',
  'packages/figma-sync/src/matrices',
];

/** Leest alle bestanden onder een map, recursief. */
function readFilesUnder(dir: string, extensions: string[]): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...readFilesUnder(path, extensions));
    } else if (extensions.some((e) => entry.name.endsWith(e))) {
      out.push(readFileSync(path, 'utf8'));
    }
  }
  return out;
}

/** Verwijdert commentaar, zodat voorbeelden in comments niet meetellen. */
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * De componentnamen van dit pakket, als klassenaam: `dsn-button`,
 * `dsn-date-input`, enzovoort. Dit is bewust de mapnaam en niet elke klasse
 * die in de CSS voorkomt, zodat utility-klassen als `dsn-col-6` (die per
 * definitie met elkaar botsen en dat ook mogen) buiten beeld blijven.
 */
function componentClassNames(): string[] {
  return readdirSync(SRC, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => `dsn-${e.name}`);
}

/** Alle bron-CSS van dit pakket, samengevoegd en zonder commentaar. */
function readAllCss(): string {
  return readdirSync(SRC, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) =>
      stripComments(readFileSync(join(SRC, e.name, `${e.name}.css`), 'utf8'))
    )
    .join('\n');
}

/**
 * Geeft de declaraties terug die een regel met exact deze kale selector zet,
 * als eigenschap naar waarde. Alleen de kale selector telt: `.dsn-button` wel,
 * `.dsn-button:hover` niet, want een pseudo-klasse verhoogt de specificiteit al.
 */
function declarations(css: string, className: string): Map<string, string> {
  const found = new Map<string, string>();
  const rule = new RegExp(
    `(?:^|\\}|;)\\s*\\.${className.replace(/-/g, '\\-')}\\s*\\{([^}]*)\\}`,
    'g'
  );
  for (const match of css.matchAll(rule)) {
    for (const declaration of match[1].split(';')) {
      const colon = declaration.indexOf(':');
      if (colon === -1) continue;
      const property = declaration.slice(0, colon).trim();
      const value = declaration
        .slice(colon + 1)
        .trim()
        .replace(/\s+/g, ' ');
      if (/^[a-z-]+$/.test(property) && !property.startsWith('--')) {
        found.set(property, value);
      }
    }
  }
  return found;
}

/**
 * Zoekt in de markup naar class-attributen die een componentklasse combineren
 * met een klasse van een ánder component, en geeft die paren terug.
 */
function findCoAppliedPairs(components: string[]): Map<string, Set<string>> {
  const sources = MARKUP_DIRS.flatMap((rel) =>
    readFilesUnder(join(REPO, rel), ['.tsx', '.ts', '.js', '.md', '.mdx'])
  );

  const pairs = new Map<string, Set<string>>();
  // Zowel class="..." (HTML) als className="..." (JSX).
  const attribute = /class(?:Name)?=["'`]([^"'`]*dsn-[^"'`]*)["'`]/g;

  for (const source of sources) {
    for (const [, value] of source.matchAll(attribute)) {
      const classes = [
        ...new Set(
          value.split(/\s+/).filter((c) => /^dsn-[a-z0-9_-]+$/.test(c))
        ),
      ];
      const bases = classes.filter((c) => components.includes(c));

      for (const base of bases) {
        for (const other of classes) {
          // Alleen klassen van een ánder component. De eigen modifiers en
          // elementen (`dsn-button--subtle`, `dsn-button__label`) zijn per
          // definitie bedoeld om het basiscomponent te overschrijven, en die
          // staan in hetzelfde bestand, dus daar is de volgorde wél bekend.
          if (other === base) continue;
          if (other.startsWith(`${base}__`) || other.startsWith(`${base}--`)) {
            continue;
          }
          if (!pairs.has(base)) pairs.set(base, new Set());
          pairs.get(base)!.add(other);
        }
      }
    }
  }
  return pairs;
}

describe('CSS-overrides winnen op specificiteit, niet op bronvolgorde', () => {
  const css = readAllCss();
  const components = componentClassNames();
  const pairs = findCoAppliedPairs(components);

  it('vindt de knoppen die naast dsn-button een tweede componentklasse dragen', () => {
    // Zonder deze vondsten toetst de test hieronder niets. Faalt dit, dan is
    // de markup-scan stuk en niet de CSS.
    const others = pairs.get('dsn-button');
    expect(others).toBeDefined();
    expect([...others!]).toEqual(
      expect.arrayContaining([
        'dsn-date-input__button',
        'dsn-time-input__button',
        'dsn-menu-link__expand-button',
      ])
    );
  });

  it('leest de declaraties van een kale regel, niet die van een variant', () => {
    const button = declarations(css, 'dsn-button');
    expect(button.get('position')).toBe('relative');
    expect(button.get('align-self')).toBe('flex-start');
    // `background-color` staat alleen op de varianten (`--primary` en
    // dergelijke), niet op de kale `.dsn-button`.
    expect(button.has('background-color')).toBe(false);
  });

  it('verzwaart elke override van een basiscomponent met diens klasse', () => {
    const problems: string[] = [];

    for (const [base, others] of pairs) {
      const baseDeclarations = declarations(css, base);
      if (baseDeclarations.size === 0) continue;

      for (const other of others) {
        if (KNOWN_ORDER_DEPENDENT.has(other)) continue;

        // Alleen een andere wáárde is een probleem. Zet de override dezelfde
        // waarde als het basiscomponent (button-link herhaalt bijvoorbeeld
        // bewust `text-decoration: none` als vangnet), dan kan de volgorde de
        // uitkomst niet veranderen.
        const clashes = [...declarations(css, other)]
          .filter(([property, value]) => {
            const baseValue = baseDeclarations.get(property);
            return baseValue !== undefined && baseValue !== value;
          })
          .map(([property]) => property);
        if (clashes.length === 0) continue;

        problems.push(
          `.${other} zet ${clashes.join(', ')}, en .${base} doet dat ook. ` +
            'Beide selectors hebben specificiteit (0,1,0), dus de bronvolgorde ' +
            `beslist. Schrijf de regel als .${base}.${other} { ... }.`
        );
      }
    }

    expect(problems).toEqual([]);
  });

  it('houdt de lijst met bekende gevallen actueel', () => {
    // Een naam die niet meer botst hoort uit KNOWN_ORDER_DEPENDENT, anders
    // dekt de lijst stilletjes een geval af dat allang opgelost is.
    const stale: string[] = [];

    for (const known of KNOWN_ORDER_DEPENDENT) {
      const base = [...pairs.entries()].find(([, others]) => others.has(known));
      if (!base) {
        stale.push(`${known} komt niet meer voor naast een basiscomponent`);
        continue;
      }
      const baseDeclarations = declarations(css, base[0]);
      const clashes = [...declarations(css, known)].filter(
        ([property, value]) => {
          const baseValue = baseDeclarations.get(property);
          return baseValue !== undefined && baseValue !== value;
        }
      );
      if (clashes.length === 0) {
        stale.push(`${known} botst niet meer met .${base[0]}`);
      }
    }

    expect(stale).toEqual([]);
  });
});
