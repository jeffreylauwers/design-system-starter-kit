/**
 * Runner: leest de SVG-iconen en schrijft de Figma node spec voor de iconset.
 *
 *   node src/build-icons.js
 *
 * Dit is een ander type generator dan build-components.js. Daar wordt in een
 * browser gemeten omdat de eindwaarde pas uit de cascade volgt; hier is de
 * bron een bestand met een vaste viewBox. Er valt niets te meten, dus er wordt
 * niet gemeten: de SVG gaat na normalisatie ongewijzigd naar de plugin.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.join(__dirname, '..');
const monorepoRoot = path.join(packageRoot, '..', '..');

const iconsDir = path.join(
  monorepoRoot,
  'packages/components-html/assets/icons'
);
const registryFile = path.join(
  monorepoRoot,
  'packages/components-react/src/Icon/icon-registry.generated.ts'
);
const outputDir = path.join(packageRoot, 'dist');

/**
 * De pagina waar de iconen komen te staan.
 *
 * Bewust een eigen pagina en 51 losse componenten, geen component set met een
 * `icon`-as. Een instance swap property kiest uit componenten; een set van 51
 * varianten levert in die keuzelijst één regel op waarna de designer alsnog
 * via de variant-dropdown moet zoeken. Losse componenten zijn precies wat de
 * swap-picker verwacht.
 */
const PAGE_NAME = 'dsn/Icons';

/**
 * Iconen zijn in de browser `currentColor`; Figma kent dat begrip niet en maakt
 * er zwart van. Een losstaand icooncomponent heeft geen tekstouder om de kleur
 * van te erven, dus krijgt het de neutrale tekstkleur als vertrekpunt, gebonden
 * aan de variable zodat het icoon de theme-schakelaar volgt. Een instance kan
 * die kleur overschrijven, precies zoals `currentColor` in de browser.
 *
 * Let op: dit is een gekozen standaard, geen gemeten binding. De verificatie
 * uit DR-2026-06 (gemeten waarde moet gelijk zijn aan de tokenwaarde) geldt
 * hier niet, want er is geen meting om tegen af te zetten.
 */
const COLOR = {
  collection: 'dsn/Primitives',
  name: 'color/neutral/color-default',
};

/** De basisgrootte in Figma. Alle iconen hebben viewBox `0 0 24 24`. */
const SIZE = 24;

/**
 * Haalt de namen uit de gegenereerde registry, zodat code en Figma
 * aantoonbaar dezelfde term gebruiken in plaats van allebei toevallig hetzelfde
 * uit de bestandsnamen af te leiden.
 */
function registryNames() {
  if (!fs.existsSync(registryFile)) return null;
  const source = fs.readFileSync(registryFile, 'utf8');
  const union = source.match(/export type IconName =([\s\S]*?);/);
  if (!union) return null;
  return [...union[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
}

/**
 * Maakt de SVG klaar voor `figma.createNodeFromSvg`.
 *
 * - `class` eruit: de Tabler-klassen zeggen in Figma niets en worden anders
 *   wel de laagnaam van de vector.
 * - `width` en `height` expliciet op 24: 31 van de 51 bestanden hebben ze,
 *   20 niet, en zonder maat leidt Figma de grootte af uit de viewBox. Dat
 *   klopt hier toevallig, maar niet als er ooit een icoon met een andere
 *   viewBox bijkomt.
 *
 * `fill="currentColor"` en `stroke="currentColor"` blijven staan. Figma maakt
 * er zwart van; de plugin kleurt daarna precies die vullingen en lijnen die de
 * SVG had, en houdt zo het verschil tussen een gevuld en een lijn-icoon intact.
 */
function normalizeSvg(source) {
  const opening = source.match(/<svg\b[^>]*>/);
  if (!opening || !/viewBox="/.test(opening[0])) return null;

  const tag = opening[0]
    .replace(/\sclass="[^"]*"/g, '')
    .replace(/\swidth="[^"]*"/g, '')
    .replace(/\sheight="[^"]*"/g, '')
    .replace(/<svg/, `<svg width="${SIZE}" height="${SIZE}"`);

  // Inspringing tussen elementen wordt in Figma een lege tekstnode noch iets
  // anders nuttigs; eruit houdt de spec leesbaar in de diff.
  return source
    .replace(opening[0], tag)
    .replace(/\s*\n\s*/g, '')
    .trim();
}

function main() {
  if (!fs.existsSync(iconsDir)) {
    console.error(`❌ Iconenmap niet gevonden: ${iconsDir}`);
    process.exit(1);
  }

  console.log('🎨 Building Figma icon set...\n');

  const files = fs
    .readdirSync(iconsDir)
    .filter((file) => file.endsWith('.svg'))
    .sort();

  const warnings = [];
  const icons = [];

  for (const file of files) {
    const name = path.basename(file, '.svg');
    const svg = normalizeSvg(
      fs.readFileSync(path.join(iconsDir, file), 'utf8')
    );

    if (!svg) {
      warnings.push(
        `${file} heeft geen bruikbare <svg …viewBox> en is overgeslagen`
      );
      continue;
    }

    icons.push({
      name,
      svg,
      width: SIZE,
      height: SIZE,
      boundVariables: { fills: COLOR },
    });
  }

  // De registry is de lijst waar de code mee werkt. Loopt die uit de pas met
  // wat hier de deur uit gaat, dan verwijzen straks instance swap properties
  // naar een icoon dat in Figma anders heet dan in de code.
  const registry = registryNames();
  if (!registry) {
    warnings.push(
      'icon-registry.generated.ts kon niet gelezen worden; namen zijn alleen uit de bestandsnamen afgeleid'
    );
  } else {
    const generated = new Set(icons.map((icon) => icon.name));
    const missing = registry.filter((name) => !generated.has(name));
    const extra = [...generated].filter((name) => !registry.includes(name));
    if (missing.length) {
      warnings.push(
        `in de registry maar niet in de iconset: ${missing.join(', ')}`
      );
    }
    if (extra.length) {
      warnings.push(
        `in de iconset maar niet in de registry: ${extra.join(', ')}. Draai: node packages/components-react/scripts/generate-icons.js`
      );
    }
  }

  const payload = {
    $schema: 'dsn-figma-icons/1',
    generatedAt: new Date().toISOString(),
    iconSet: {
      page: PAGE_NAME,
      size: SIZE,
      icons,
    },
    warnings,
    // Dezelfde vorm als bij de componenten, zodat de plugin één controle heeft
    // op "zijn de variables er al?".
    bindings: { collections: [COLOR.collection] },
  };

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, 'icons.json'),
    `${JSON.stringify(payload, null, 2)}\n`
  );

  console.log(
    `   ${String(icons.length).padStart(3)} iconen op pagina ${PAGE_NAME}  -> dist/icons.json`
  );
  console.log(
    `   ${' '.repeat(3)} kleur gebonden aan ${COLOR.collection} / ${COLOR.name}`
  );

  if (warnings.length) {
    console.log(`\n   ⚠️  ${warnings.length} aandachtspunten:`);
    for (const warning of warnings) console.log(`      ${warning}`);
  }

  console.log('\n✅ Klaar\n');
}

main();
