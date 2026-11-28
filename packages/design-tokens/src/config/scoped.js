/**
 * Scoped CSS voor runtime omschakelen met klassen (dist/css/scoped/).
 *
 * Een custom property wordt opgelost op het element waar hij gedeclareerd
 * staat. Een componenttoken als
 *
 *   --dsn-button-default-color: var(--dsn-color-action-1-color-default);
 *
 * dat alleen op :root staat, krijgt daar de light-waarde, en die erft een
 * container met `dsn-theme-start dsn-mode-dark` als kant-en-klare kleur. Het
 * scoped bestand kan de kleurtoken nog zo goed overschrijven: niets rekent de
 * componenttoken opnieuw uit. Zie DR-2026-18.
 *
 * Daarom herhaalt elk scoped bestand niet alleen de tokens die op zijn as
 * verschillen, maar ook elke token die daar (via var()) naar verwijst. De
 * declaraties komen letterlijk uit de volledige configs in dist/css, zodat de
 * klassenroute en de route met één volledige config hetzelfde opleveren.
 *
 * Er zijn twee assen:
 *
 * - thema x mode: start-light (op :root), start-dark, wireframe-light,
 *   wireframe-dark. Alle vier de bestanden bevatten dezelfde set tokens, zodat
 *   een container elke combinatie kan terugzetten, hoe ze ook genest zijn.
 * - dichtheid: default (op :root) en information-dense.
 *
 * Een token kan op de ene as afhangen van de andere. De padding van
 * formuliervelden is per thema een andere maat (var(--dsn-space-block-md) of
 * -lg) en die maat verschilt per dichtheid. Zo'n declaratie kan in het
 * dichtheidsbestand niet voor elk thema kloppen. Hij staat daar met
 * specificiteit 0 (:where), zodat het themabestand op hetzelfde element wint,
 * met een extra regel per thema waarvoor de declaratie afwijkt, voor een
 * dichtheidsklasse onder een themacontainer.
 */

import fs from 'fs';
import path from 'path';

// =============================================================================
// LEZEN
// =============================================================================

/**
 * Leest de declaraties uit het :root-blok van een volledige config.
 * @returns {Map<string, string>} naam (met --) naar waarde, in bestandsvolgorde
 */
export function readDeclarations(css, file = 'css') {
  const start = css.indexOf(':root {');
  const end = css.indexOf('\n}', start);
  if (start === -1 || end === -1) {
    throw new Error(`${file}: geen :root-blok gevonden`);
  }

  const declarations = new Map();
  const block = css.slice(start + ':root {'.length, end);
  for (const line of block.split('\n')) {
    if (!line.trim()) continue;
    const match = line.match(/^\s*(--[\w-]+):\s*(.*?);(?:\s*\/\*.*\*\/)?\s*$/);
    if (!match) {
      throw new Error(`${file}: onverwachte regel in :root: ${line.trim()}`);
    }
    declarations.set(match[1], match[2]);
  }
  return declarations;
}

// =============================================================================
// AFHANKELIJKHEDEN
// =============================================================================

const referencesOf = (value) =>
  [...value.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]);

/** Tokens waarvan de declaratie verschilt tussen de gegeven configs. */
function differing(configs) {
  const names = new Set(configs.flatMap((config) => [...config.keys()]));
  return [...names].filter(
    (name) => new Set(configs.map((config) => config.get(name))).size > 1
  );
}

/** De tokens plus alles wat er, rechtstreeks of via andere tokens, naar verwijst. */
function withDependents(leaves, configs) {
  const dependents = new Map();
  for (const config of configs) {
    for (const [name, value] of config) {
      for (const reference of referencesOf(value)) {
        if (!dependents.has(reference)) dependents.set(reference, new Set());
        dependents.get(reference).add(name);
      }
    }
  }

  const result = new Set(leaves);
  const queue = [...leaves];
  while (queue.length) {
    for (const dependent of dependents.get(queue.pop()) ?? []) {
      if (!result.has(dependent)) {
        result.add(dependent);
        queue.push(dependent);
      }
    }
  }
  return result;
}

// =============================================================================
// SCHRIJVEN
// =============================================================================

const where = (selector) => `:where(${selector})`;

function rule(selector, declarations, comment) {
  const lines = declarations.map(([name, value]) => `  ${name}: ${value};`);
  const heading = comment ? `/* ${comment} */\n` : '';
  return `${heading}${selector} {\n${lines.join('\n')}\n}\n`;
}

/**
 * Bouwt de scoped bestanden voor één as.
 *
 * @param {object} axis       de as van de bestanden: { values: [{ id, selector, label, file, inherits? }] }
 * @param {object} other      de andere as, zelfde vorm
 * @param {(a: string, b: string) => Map<string, string>} config
 *        de declaraties van de volledige config voor waarde a op deze as en b op de andere
 * @returns {{ file: string, css: string, count: number, missing: string[] }[]}
 */
function buildAxis(axis, other, config) {
  const [root] = other.values;
  const all = axis.values.flatMap((a) =>
    other.values.map((b) => config(a.id, b.id))
  );

  // Wat op deze as verschilt, bij elke waarde van de andere as.
  const leaves = other.values.flatMap((b) =>
    differing(axis.values.map((a) => config(a.id, b.id)))
  );
  const names = withDependents(leaves, all);

  return axis.values.map((a) => {
    const own = config(a.id, root.id);
    const plain = [];
    const varying = [];
    const missing = [];

    // Volgorde van de volledige config; tokens die alleen elders bestaan achteraan.
    const ordered = [
      ...[...own.keys()].filter((name) => names.has(name)),
      ...[...names].filter((name) => !own.has(name)),
    ];

    for (const name of ordered) {
      if (!own.has(name)) {
        missing.push(name);
        continue;
      }
      const perOther = other.values.map((b) => config(a.id, b.id).get(name));
      if (new Set(perOther).size === 1) plain.push(name);
      else varying.push(name);
    }

    const blocks = [
      rule(
        a.selector,
        plain.map((name) => [name, own.get(name)])
      ),
    ];

    if (varying.length) {
      // Verschilt een declaratie op beide assen, dan staat hij in beide
      // bestanden met specificiteit 0 en wint op één element geen van beide.
      const both = varying.filter((name) =>
        isVaryingOnBothAxes(name, axis, other, config)
      );
      if (both.length) {
        throw new Error(
          `${both.join(', ')}: de declaratie verschilt per ${axis.label} én per ${other.label}, dat kunnen de scoped bestanden niet uitdrukken (zie DR-2026-18)`
        );
      }

      blocks.push(
        rule(
          where(a.selector),
          varying.map((name) => [name, own.get(name)]),
          `Verschilt per ${other.label}: specificiteit 0, zodat een ${other.label}klasse op hetzelfde element wint.`
        )
      );

      const declarationsOf = (b) =>
        varying.map((name) => [name, config(a.id, b.id).get(name)]);
      const signature = (b) => JSON.stringify(declarationsOf(b));

      for (const b of other.values.slice(1)) {
        const fallback = other.values.find((y) => y.id === b.inherits) ?? root;
        if (signature(b) === signature(fallback)) continue;
        blocks.push(
          rule(
            `${where(b.selector)} ${where(a.selector)}`,
            declarationsOf(b),
            `Binnen een ${b.label} container.`
          )
        );
      }
    }

    return {
      file: a.file,
      css: blocks.join('\n'),
      count: plain.length + varying.length,
      missing,
    };
  });
}

/**
 * Of de declaratie van een token (de tekst, niet de opgeloste waarde) zowel
 * per waarde van deze as als per waarde van de andere as verschilt.
 */
function isVaryingOnBothAxes(name, axis, other, config) {
  const variesAcross = (values, pick) =>
    new Set(values.map((value) => pick(value).get(name))).size > 1;
  const onOther = axis.values.some((a) =>
    variesAcross(other.values, (b) => config(a.id, b.id))
  );
  const onAxis = other.values.some((b) =>
    variesAcross(axis.values, (a) => config(a.id, b.id))
  );
  return onOther && onAxis;
}

/**
 * Schrijft de scoped bestanden voor thema x mode en dichtheid naar
 * dist/css/scoped/, op basis van de volledige configs in dist/css/.
 */
export function buildScopedFiles({
  distDir,
  themes,
  modes,
  projectTypes,
  themeModeSelector,
  densitySelectors,
}) {
  const cache = new Map();
  const declarations = (theme, mode, projectType) => {
    const name = `${theme}-${mode}-${projectType}`;
    if (!cache.has(name)) {
      const file = path.join(distDir, `${name}.css`);
      cache.set(name, readDeclarations(fs.readFileSync(file, 'utf8'), file));
    }
    return cache.get(name);
  };

  // De eerste waarde van elke as staat op :root.
  const themeMode = {
    label: 'thema',
    values: themes.flatMap((theme) =>
      modes.map((mode) => ({
        id: `${theme}-${mode}`,
        theme,
        mode,
        selector: themeModeSelector(theme, mode),
        label: `${theme} ${mode}`,
        file: `${theme}-${mode}.css`,
        // Een element onder een dark container valt ook onder de light-selector
        // van hetzelfde thema.
        inherits: mode === modes[0] ? undefined : `${theme}-${modes[0]}`,
      }))
    ),
  };
  const density = {
    label: 'dichtheid',
    values: projectTypes.map((projectType) => ({
      id: projectType,
      selector: densitySelectors[projectType],
      label: projectType,
      file: `density-${projectType}.css`,
    })),
  };

  const byId = (axis, id) => axis.values.find((value) => value.id === id);
  const themeModeConfig = (tm, projectType) => {
    const { theme, mode } = byId(themeMode, tm);
    return declarations(theme, mode, projectType);
  };

  const results = [
    ...buildAxis(themeMode, density, themeModeConfig),
    ...buildAxis(density, themeMode, (projectType, tm) =>
      themeModeConfig(tm, projectType)
    ),
  ];

  const header = `/**\n * Do not edit directly\n * Generated on ${new Date().toUTCString()}\n */\n\n`;
  const outDir = path.join(distDir, 'scoped');
  fs.mkdirSync(outDir, { recursive: true });
  for (const result of results) {
    fs.writeFileSync(path.join(outDir, result.file), header + result.css);
  }
  return results;
}
