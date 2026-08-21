/**
 * Genereert dist/figma/variables.json (+ een report) uit de design tokens.
 *
 * Wordt aangeroepen vanuit build.js, maar is ook los te draaien:
 *   node src/config/build-figma.js
 */

import StyleDictionary from 'style-dictionary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { themes, modes, projectTypes } from './config.js';
import { buildFigmaVariables } from './figma.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.join(__dirname, '..', '..');

/**
 * Laadt de volledig geresolvede tokenset voor één theme x mode x density.
 * Dezelfde source-volgorde als createFullConfig: project-types komen als
 * laatste zodat hun overrides winnen.
 */
async function loadTokens(theme, mode, projectType) {
  const sd = new StyleDictionary(
    {
      source: [
        `src/tokens/themes/${theme}/base.json`,
        `src/tokens/themes/${theme}/colors-${mode}.json`,
        'src/tokens/components/*.json',
        `src/tokens/project-types/${projectType}/*.json`,
      ],
      platforms: { js: { transformGroup: 'js' } },
      log: { verbosity: 'silent', warnings: 'disabled' },
    },
    { init: false }
  );
  await sd.init();
  const dictionary = await sd.getPlatformTokens('js');
  return dictionary.allTokens;
}

function summarise(payload) {
  const lines = [];
  for (const collection of payload.collections) {
    const aliases = collection.variables.filter((v) => v.alias).length;
    const types = collection.variables.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] ?? 0) + 1;
      return acc;
    }, {});
    const typeSummary = Object.entries(types)
      .map(([type, count]) => `${count} ${type}`)
      .join(', ');
    lines.push(
      `   ${collection.name.padEnd(16)} ${String(collection.variables.length).padStart(4)} variables  ` +
        `(${collection.modes.length} mode${collection.modes.length === 1 ? '' : 's'}: ${collection.modes.join(', ')})`
    );
    lines.push(
      `   ${''.padEnd(16)}      ${typeSummary}${aliases ? `, waarvan ${aliases} als alias` : ''}`
    );
  }
  return lines.join('\n');
}

export async function buildFigma() {
  console.log('🎯 Building Figma variables...\n');

  const payload = await buildFigmaVariables({
    loadTokens,
    themes,
    modes,
    densities: projectTypes,
  });

  const outputDir = path.join(packageRoot, 'dist', 'figma');
  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(
    path.join(outputDir, 'variables.json'),
    `${JSON.stringify(payload, null, 2)}\n`
  );

  // Het report is bewust een apart bestand: het hoort niet in de payload die
  // naar Figma gaat, maar je wilt bij een review wel kunnen zien wat er afviel.
  const grouped = payload.skipped.reduce((acc, entry) => {
    (acc[entry.reason] ??= []).push(entry.token);
    return acc;
  }, {});
  fs.writeFileSync(
    path.join(outputDir, 'variables-report.json'),
    `${JSON.stringify(
      {
        generatedAt: payload.generatedAt,
        meta: payload.meta,
        totals: Object.fromEntries(
          payload.collections.map((c) => [c.name, c.variables.length])
        ),
        skippedCount: payload.skipped.length,
        skippedByReason: grouped,
        // Referenties die niet als Figma-alias gelegd konden worden omdat het
        // doeltoken zelf niet naar een variable mapt. Deze variables krijgen een
        // vaste waarde en volgen dus geen theme- of mode-wissel.
        danglingReferences: payload.danglingReferences,
      },
      null,
      2
    )}\n`
  );

  console.log(summarise(payload));
  console.log(
    `\n   ${payload.skipped.length} tokens overgeslagen (zie dist/figma/variables-report.json)`
  );
  console.log('\n✅ dist/figma/variables.json\n');

  return payload;
}

// Direct uitgevoerd (niet geïmporteerd)? Dan zelf draaien.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  buildFigma().catch((error) => {
    console.error('❌ Figma build failed:', error);
    process.exit(1);
  });
}
