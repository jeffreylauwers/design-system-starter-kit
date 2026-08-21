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

async function main() {
  const requested = process.argv.slice(2);
  const matrices = await loadMatrices(requested);

  if (!matrices.length) {
    console.error(`❌ Geen matrix gevonden voor: ${requested.join(', ')}`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  console.log('🧩 Building Figma component specs...\n');

  for (const { key, matrix } of matrices) {
    const started = Date.now();
    const extracted = await extractMatrix(matrix);
    const spec = toComponentSet(matrix, extracted);

    const destination = path.join(outputDir, `${key}.json`);
    fs.writeFileSync(destination, `${JSON.stringify(spec, null, 2)}\n`);

    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    console.log(
      `   ${matrix.component.padEnd(12)} ${String(extracted.length).padStart(3)} varianten  ${seconds}s  -> dist/${key}.json`
    );

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
