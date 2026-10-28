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
import { setNameFor, toComponentSet } from './to-figma.js';
import { dependencyOrder, findCandidates } from './instances.js';
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

/**
 * Wat een instance van een set moet weten: de naam, de pagina, de varianten
 * om mee te vergelijken, en of de plugin er een frame omheen zet.
 *
 * Een component dat tot één tekstlaag of icoon inklapt (Heading, Paragraph)
 * kan in Figma zichzelf niet zijn: de plugin zet er een frame omheen, en dan
 * zit de tekst binnen de instance één laag dieper. Dat is `wrapped`.
 */
function targetFrom(spec) {
  const set = spec.componentSet;
  return {
    name: set.name,
    page: set.page,
    components: set.components,
    wrapped: set.components[0]?.node.type !== 'FRAME',
    exposed: (set.componentProperties ?? []).length > 0,
    // Van slot naar property, voor de iconen die een instance swap zijn: een
    // ander icoon daar is een property op de instance en geen andere opbouw.
    swaps: new Map(
      (set.componentProperties ?? [])
        .filter((property) => property.type === 'INSTANCE_SWAP')
        .map((property) => [property.slot, property.name])
    ),
  };
}

/** De sets uit een eerdere build, voor zover ze niet in deze run zitten. */
function loadBuiltTargets(inThisRun) {
  const targets = new Map();
  if (!fs.existsSync(outputDir)) return targets;

  for (const file of fs.readdirSync(outputDir)) {
    if (!file.endsWith('.json') || file === 'icons.json') continue;
    const spec = JSON.parse(
      fs.readFileSync(path.join(outputDir, file), 'utf8')
    );
    // De sleutel, niet de naam in Figma: `__item` staat op meer pagina's.
    const name = spec.componentSet?.key ?? spec.componentSet?.name;
    if (!name || inThisRun.has(name)) continue;
    targets.set(name, targetFrom(spec));
  }
  return targets;
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

  // Eerst alles meten, dan omzetten. Een matrix met instances heeft bij het
  // omzetten de spec van zijn doelsets nodig (de variant wordt gekozen door te
  // vergelijken), dus die moeten eerder omgezet zijn. Welke dat zijn blijkt
  // pas uit de meting.
  const measured = new Map();
  for (const { key, matrix } of matrices) {
    const started = Date.now();
    measured.set(key, {
      matrix,
      extracted: await extractMatrix(matrix),
      seconds: (Date.now() - started) / 1000,
    });
  }

  // Welke set hoort bij welke matrix: uit deze run, en anders uit dist/ van
  // een eerdere build (bij `build-components heading-group`).
  const keyForSet = new Map();
  for (const [key, { matrix, extracted }] of measured) {
    keyForSet.set(setNameFor(matrix, extracted), key);
  }
  const targets = loadBuiltTargets(keyForSet);

  const dependenciesOf = (key) => {
    const { matrix, extracted } = measured.get(key);
    if (!matrix.instances) return [];
    const blocks = new Set();
    for (const { tree } of extracted) {
      for (const block of findCandidates(tree)) blocks.add(block);
    }
    return [...blocks].map((block) => keyForSet.get(block)).filter(Boolean);
  };

  const order = dependencyOrder([...measured.keys()], dependenciesOf);

  for (const key of order) {
    const { matrix, extracted, seconds: measuredSeconds } = measured.get(key);
    const started = Date.now();
    // Eén index per gemeten breedte. De modes van `dsn/Density` hangen aan die
    // breedte, en de verificatie van een binding eist dat het token de gemeten
    // waarde reproduceert in dezelfde theme-, mode- en viewportstand. Een
    // matrix met varianten op twee viewports heeft dus twee indexen, en elke
    // variant wordt tegen die van zijn eigen breedte geverifieerd.
    const widths = matrix.viewports
      ? [
          ...new Set(
            Object.values(matrix.viewports).map((entry) => entry.width)
          ),
        ]
      : [matrix.viewport?.width ?? 360];
    const variableIndexes = variablesPayload
      ? new Map(
          widths.map((width) => [
            width,
            createVariableIndex(
              variablesPayload,
              modesForMatrix(matrix, variablesPayload.collections, width)
            ),
          ])
        )
      : undefined;

    const spec = toComponentSet(matrix, extracted, variableIndexes, {
      targets,
    });
    // Vanaf nu kan een volgende matrix er instances van maken.
    targets.set(
      spec.componentSet.key ?? spec.componentSet.name,
      targetFrom(spec)
    );

    const destination = path.join(outputDir, `${key}.json`);
    fs.writeFileSync(destination, `${JSON.stringify(spec, null, 2)}\n`);

    const seconds = (measuredSeconds + (Date.now() - started) / 1000).toFixed(
      1
    );
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

    const instances = spec.componentSet.dependsOn ?? [];
    if (instances.length) {
      console.log(
        `   ${' '.repeat(12)} instances van ${instances.map((target) => target.name).join(', ')}`
      );
    }
    if (spec.instanceCandidates) {
      console.log(
        `   ${' '.repeat(12)} nog gemeten, kan instance worden: ${spec.instanceCandidates.join(', ')}`
      );
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
