#!/usr/bin/env node
/**
 * Writes the color groups of a theme from its theme.config.json.
 *
 * A theme with a theme.config.json gets its colors from the theme engine:
 * per group one base color (or a reference to another group), from which
 * @dsn-starter-kit/theme-engine derives all 30 tokens per mode with the WCAG
 * contrast rules. Only the `$value` of the color groups changes; `$type`,
 * `$description`, key order and every other token in colors-{mode}.json
 * (shadow, transparent, focus, form-control, heading, backdrop) stay as they
 * are. A theme without a theme.config.json is left alone.
 *
 * The JSON stays checked in, so the published package does not change shape
 * and nothing downstream needs the engine.
 *
 *   node src/config/generate-colors.js           write colors-{mode}.json
 *   node src/config/generate-colors.js --check   fail if they are not what
 *                                                the config produces
 *
 * In CI (CI=true) the default is --check. A build there must not quietly fix
 * a JSON file someone forgot to regenerate and commit.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applyColorTokens,
  generateColorTokens,
  validateThemeConfig,
} from '@dsn-starter-kit/theme-engine';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const THEMES_DIR = path.resolve(__dirname, '../tokens/themes');
const CONFIG_FILE = 'theme.config.json';
const MODES = ['light', 'dark'];

/** Formats like the rest of the repo, so format:check accepts the output. */
async function format(json, filepath) {
  const prettier = await import('prettier');
  const options = (await prettier.resolveConfig(filepath)) ?? {};
  return prettier.format(JSON.stringify(json), { ...options, filepath });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

/** Every theme directory that has a theme.config.json. */
function configuredThemes() {
  return fs
    .readdirSync(THEMES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((theme) => fs.existsSync(path.join(THEMES_DIR, theme, CONFIG_FILE)))
    .sort();
}

async function main() {
  const check = process.argv.includes('--check') || process.env.CI === 'true';
  const stale = [];
  let written = 0;

  for (const theme of configuredThemes()) {
    const configPath = path.join(THEMES_DIR, theme, CONFIG_FILE);
    const config = readJson(configPath);
    const errors = validateThemeConfig(config);
    if (errors.length > 0) {
      console.error(`${path.relative(process.cwd(), configPath)}:`);
      for (const error of errors) console.error(`  ${error}`);
      process.exit(1);
    }

    for (const mode of MODES) {
      const file = path.join(THEMES_DIR, theme, `colors-${mode}.json`);
      const values = generateColorTokens(config, mode);
      const output = await format(
        applyColorTokens(readJson(file), values),
        file
      );
      const current = fs.readFileSync(file, 'utf-8');
      if (output === current) continue;

      const relative = path.relative(process.cwd(), file);
      if (check) {
        stale.push(relative);
      } else {
        fs.writeFileSync(file, output);
        written++;
        console.log(`Wrote ${relative}`);
      }
    }
  }

  if (stale.length > 0) {
    console.error(
      `Deze kleurbestanden lopen niet gelijk met hun ${CONFIG_FILE}:\n` +
        stale.map((file) => `  ${file}`).join('\n') +
        '\nDraai `pnpm --filter @dsn-starter-kit/design-tokens generate:colors` en commit het resultaat.'
    );
    process.exit(1);
  }
  if (written === 0) {
    console.log('Theme colors are up to date.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
