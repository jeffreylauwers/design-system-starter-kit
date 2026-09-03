/**
 * Runner: rendert de matrices en schrijft de Figma node specs weg.
 *
 *   node src/build-components.js            # alle matrices
 *   node src/build-components.js button     # één matrix
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { extractMatrix } from './extract.js';
import { toComponentSet } from './to-figma.js';
import {
  createVariableIndex,
  loadVariablesPayload,
  modesForMatrix,
  VARIABLES_FILE,
} from './variable-index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', 'dist');

async function loadMatrices(requested) {
  const dir = path.join(__dirname, 'matrices');
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.js'))
    .filter(
      (file) => !requested.length || requested.includes(path.parse(file).name)
    );

  return Promise.all(
    files.map(async (file) => ({
      key: path.parse(file).name,
      matrix: (await import(path.join(dir, file))).default,
    }))
  );
}

/**
 * Ruimt specs op waar geen matrix meer bij hoort.
 *
 * `dist/` staat in `.gitignore` en overleeft dus een branchwissel. Een matrix
 * die op de ene branch bestaat en op de andere niet laat daar zijn JSON achter,
 * en die wordt daarna gewoon meegenomen door `pnpm test:figma-plugin` en door
 * de plugin. Dan test je een spec van de ene branch tegen een plugin van de
 * andere, zonder dat iets je waarschuwt.
 *
 * Alleen bij een volledige build: draait er een filter mee (`build-components
 * button`), dan zegt het ontbreken van de andere bestanden niets over hun
 * bestaansrecht en zou opruimen juist weggooien wat er hoort te staan.
 *
 * `icons.json` blijft altijd staan: dat bestand komt van `build-icons.js` en
 * heeft geen matrix.
 */
function pruneStaleSpecs(matrices) {
  const expected = new Set([
    'icons.json',
    ...matrices.map(({ key }) => `${key}.json`),
  ]);

  const stale = fs
    .readdirSync(outputDir)
    .filter((file) => file.endsWith('.json'))
    .filter((file) => !expected.has(file));

  for (const file of stale) fs.rmSync(path.join(outputDir, file));

  return stale;
}

async function main() {
  const requested = process.argv.slice(2);
  const matrices = await loadMatrices(requested);

  if (!matrices.length) {
    console.error(`❌ Geen matrix gevonden voor: ${requested.join(', ')}`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  console.log('🧩 Building Figma component specs...\n');

  // Alleen bij een volledige build; zie pruneStaleSpecs.
  const stale = requested.length ? [] : pruneStaleSpecs(matrices);
  if (stale.length) {
    console.log(
      `   🧹 ${stale.length} verouderde spec${stale.length === 1 ? '' : 's'} opgeruimd: ${stale.join(', ')}\n      Er is geen matrix meer die daarbij hoort.\n`
    );
  }

  // De variables bepalen wat er te binden valt. Ontbreken ze, dan draait de
  // build gewoon door met vaste waarden; de componenten volgen dan alleen de
  // theme-schakelaar in Figma nog niet.
  const variablesPayload = loadVariablesPayload();
  if (!variablesPayload) {
    console.warn(
      `   ⚠️  ${VARIABLES_FILE} ontbreekt; er worden geen variables gebonden.\n      Draai eerst: pnpm build:figma-variables\n`
    );
  }

  for (const { key, matrix } of matrices) {
    const started = Date.now();
    const variableIndex = variablesPayload
      ? createVariableIndex(
          variablesPayload,
          modesForMatrix(matrix, variablesPayload.collections)
        )
      : undefined;

    const extracted = await extractMatrix(matrix);
    const spec = toComponentSet(matrix, extracted, variableIndex);

    const destination = path.join(outputDir, `${key}.json`);
    fs.writeFileSync(destination, `${JSON.stringify(spec, null, 2)}\n`);

    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    console.log(
      `   ${matrix.component.padEnd(12)} ${String(extracted.length).padStart(3)} varianten  ${seconds}s  -> dist/${key}.json`
    );

    const { bound, unbound } = spec.bindings;
    console.log(
      `   ${' '.repeat(12)} ${String(bound).padStart(3)} bindingen${unbound.length ? `, ${unbound.length} eigenschappen zonder token` : ''}`
    );

    if (unbound.length) {
      console.log('\n   🔗 Niet gebonden (houden hun vaste waarde):');
      for (const miss of unbound) {
        console.log(
          `      ${miss.property.padEnd(26)} ${miss.reason}${miss.detail ? ` (${miss.detail})` : ''}  [${miss.nodes}x]`
        );
      }
      console.log();
    }

    if (spec.warnings.length) {
      console.log(`\n   ⚠️  ${spec.warnings.length} aandachtspunten:`);
      for (const warning of spec.warnings) console.log(`      ${warning}`);
      console.log();
    }
  }

  console.log('\n✅ Klaar\n');
}

main().catch((error) => {
  console.error('❌ Component build failed:', error);
  process.exit(1);
});
