/**
 * Vangnet voor een refactor van de Figma-generator en -plugin.
 *
 *   pnpm figma:snapshot           # bouwt alles en legt de baseline vast
 *   pnpm figma:snapshot:compare   # bouwt opnieuw en vergelijkt met de baseline
 *
 * Twee dingen worden vastgelegd, allebei als tekst:
 *
 * 1. Wat de generator schrijft: `design-tokens/dist/figma/variables.json` en
 *    elke `figma-sync/dist/*.json`. Zonder `generatedAt`, want dat verschilt
 *    bij elke build en zegt niets over de inhoud.
 * 2. Wat de plugin daarvan maakt: de eindstand van de mock na de smoke test,
 *    met elke laag, variable en property (zie `serialize-mock.js`).
 *
 * Een refactor die niets aan het gedrag verandert, laat beide byte voor byte
 * gelijk. Verschilt er iets, dan noemt de vergelijking het bestand en de
 * eerste regel die afwijkt. De baseline staat in `.figma-snapshot/` en hoort
 * niet in git: hij is een momentopname van jouw werkkopie, geen referentie
 * voor iedereen.
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baselineDir = path.join(root, '.figma-snapshot');
const SMOKE_TEST = 'packages/figma-plugin/scripts/smoke-test.js';
const PLUGIN_STATE = 'plugin-state.json';

/** De generator-output, zonder tijdstempel, op bestandsnaam. */
function generatorOutput() {
  const files = new Map();
  const add = (name, file) => {
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    delete payload.generatedAt;
    files.set(name, `${JSON.stringify(payload, null, 2)}\n`);
  };

  const variables = path.join(
    root,
    'packages/design-tokens/dist/figma/variables.json'
  );
  if (!fs.existsSync(variables)) {
    throw new Error(`${variables} ontbreekt; draai eerst pnpm build:figma`);
  }
  add('variables.json', variables);

  const specs = path.join(root, 'packages/figma-sync/dist');
  for (const file of fs.readdirSync(specs).sort()) {
    if (file.endsWith('.json'))
      add(`figma-sync/${file}`, path.join(specs, file));
  }
  return files;
}

/** De eindstand van de mock na de smoke test. */
function pluginState() {
  const file = path.join(baselineDir, '.current-plugin-state.json');
  fs.mkdirSync(baselineDir, { recursive: true });
  const run = spawnSync(process.execPath, [SMOKE_TEST], {
    cwd: root,
    env: { ...process.env, FIGMA_SNAPSHOT: file },
    encoding: 'utf8',
  });
  if (run.status !== 0) {
    process.stdout.write(run.stdout);
    process.stderr.write(run.stderr);
    throw new Error('De smoke test faalt; los dat eerst op');
  }
  const content = fs.readFileSync(file, 'utf8');
  fs.rmSync(file);
  return content;
}

function current() {
  const files = generatorOutput();
  files.set(PLUGIN_STATE, pluginState());
  return files;
}

function readBaseline() {
  const files = new Map();
  const walk = (dir, prefix = '') => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const relative = prefix + entry.name;
      if (entry.isDirectory()) walk(path.join(dir, entry.name), `${relative}/`);
      else
        files.set(
          relative,
          fs.readFileSync(path.join(dir, entry.name), 'utf8')
        );
    }
  };
  walk(baselineDir);
  return files;
}

function save() {
  fs.rmSync(baselineDir, { recursive: true, force: true });
  const files = current();
  for (const [name, content] of files) {
    const file = path.join(baselineDir, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
  console.log(
    `✓ baseline vastgelegd: ${files.size} bestanden in .figma-snapshot/`
  );
}

/** De eerste regel die verschilt, met het regelnummer. */
function firstDifference(before, after) {
  const a = before.split('\n');
  const b = after.split('\n');
  for (let line = 0; line < Math.max(a.length, b.length); line += 1) {
    if (a[line] !== b[line]) {
      return `regel ${line + 1}\n      was:  ${a[line]?.trim() ?? '(einde)'}\n      nu:   ${b[line]?.trim() ?? '(einde)'}`;
    }
  }
  return '';
}

function compare() {
  if (!fs.existsSync(baselineDir)) {
    throw new Error('Geen baseline; draai eerst pnpm figma:snapshot');
  }
  const before = readBaseline();
  const after = current();
  const names = [...new Set([...before.keys(), ...after.keys()])].sort();

  let differences = 0;
  for (const name of names) {
    if (!before.has(name)) {
      console.log(`  + ${name} (nieuw)`);
    } else if (!after.has(name)) {
      console.log(`  - ${name} (verdwenen)`);
    } else if (before.get(name) !== after.get(name)) {
      console.log(
        `  ≠ ${name}: ${firstDifference(before.get(name), after.get(name))}`
      );
    } else {
      continue;
    }
    differences += 1;
  }

  if (differences) {
    console.log(
      `\n✗ ${differences} van de ${names.length} bestanden wijken af van de baseline`
    );
    process.exitCode = 1;
  } else {
    console.log(`✓ alle ${names.length} bestanden gelijk aan de baseline`);
  }
}

const mode = process.argv[2];
try {
  if (mode === 'save') save();
  else if (mode === 'compare') compare();
  else throw new Error('Gebruik: figma-snapshot.mjs save | compare');
} catch (error) {
  console.error(`✗ ${error.message}`);
  process.exitCode = 1;
}
