#!/usr/bin/env node
/**
 * Assembles manifest.json from one file per component.
 *
 * Every component describes itself in src/<dir>/<name>.manifest.json, next to
 * its CSS. <name> is the kebab-case form of the component name; <dir> is the
 * component's own directory, or the directory of its cssBlock when it has
 * none (EmailInput lives in src/text-input/ because it is a dsn-text-input).
 *
 * manifest.json stays checked in: npm consumers, figma-sync and the tests read
 * it without a build. It is generated, though, so nobody edits it by hand.
 *
 *   node scripts/build-manifest.js           validate, then write manifest.json
 *   node scripts/build-manifest.js --check   validate, and fail if manifest.json
 *                                            is not what the parts produce
 *
 * In CI (CI=true) the default is --check. A build there must not quietly fix
 * a manifest.json someone forgot to regenerate and commit.
 */

const fs = require('fs');
const path = require('path');
const {
  validateManifest,
  validateComponent,
  readJson,
} = require('./validate-manifest.js');

const PACKAGE_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PACKAGE_DIR, 'src');
const MANIFEST_PATH = path.join(PACKAGE_DIR, 'manifest.json');
const SCHEMA_PATH = path.join(PACKAGE_DIR, 'manifest-schema.json');

const PART_SUFFIX = '.manifest.json';

/** Schema version of the manifest structure. Independent of the package. */
const VERSION = '1.1.0';

const DESCRIPTION =
  'Framework-agnostic component manifest for the Design System Starter Kit. Each entry describes a component at the design system level, not at a specific platform implementation level. The HTML/CSS layer is the source of truth; React and Web Components are wrappers on top. Generated from src/<dir>/<name>.manifest.json by scripts/build-manifest.js: edit those files, not this one.';

/** 'EmailInput' -> 'email-input' */
function kebabCase(name) {
  return name.replace(/(?<!^)(?=[A-Z])/g, '-').toLowerCase();
}

/** Every src/<dir>/<name>.manifest.json, as paths relative to the package. */
function findParts(srcDir = SRC_DIR) {
  return fs
    .readdirSync(srcDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((dir) =>
      fs
        .readdirSync(path.join(srcDir, dir.name))
        .filter((file) => file.endsWith(PART_SUFFIX))
        .map((file) => path.join(srcDir, dir.name, file))
    )
    .sort();
}

/**
 * Reads, validates and merges the parts. Returns the manifest and every
 * problem found, so the caller can report them all at once.
 */
function assembleManifest({
  srcDir = SRC_DIR,
  schema = readJson(SCHEMA_PATH),
} = {}) {
  const errors = [];
  const components = [];

  for (const file of findParts(srcDir)) {
    const rel = path.relative(PACKAGE_DIR, file);
    const component = readJson(file);
    errors.push(...validateComponent(component, schema, rel));

    const expected = `${kebabCase(String(component?.name))}${PART_SUFFIX}`;
    if (path.basename(file) !== expected) {
      errors.push(`${rel}: bestandsnaam hoort ${expected} te zijn`);
    }
    components.push(component);
  }

  components.sort((a, b) => String(a.name).localeCompare(String(b.name)));

  const manifest = {
    $schema: './manifest-schema.json',
    version: VERSION,
    description: DESCRIPTION,
    components,
  };

  // Catches what no single part can see, such as a name used twice.
  errors.push(...validateManifest(manifest, schema));

  return { manifest, errors: [...new Set(errors)] };
}

/** Formats like the rest of the repo, so format:check accepts the output. */
async function format(manifest) {
  const prettier = await import('prettier');
  const options = (await prettier.resolveConfig(MANIFEST_PATH)) ?? {};
  return prettier.format(JSON.stringify(manifest), {
    ...options,
    filepath: MANIFEST_PATH,
  });
}

async function main() {
  const check = process.argv.includes('--check') || process.env.CI === 'true';
  const { manifest, errors } = assembleManifest();

  if (errors.length > 0) {
    console.error(
      'Het component-manifest voldoet niet aan manifest-schema.json:'
    );
    for (const error of errors) console.error(`  ${error}`);
    process.exit(1);
  }

  const output = await format(manifest);
  const current = fs.existsSync(MANIFEST_PATH)
    ? fs.readFileSync(MANIFEST_PATH, 'utf-8')
    : '';

  if (output === current) {
    console.log(
      `Validated manifest.json: ${manifest.components.length} components.`
    );
    return;
  }

  if (check) {
    console.error(
      'manifest.json loopt niet gelijk met de src/*/*.manifest.json-bestanden.\n' +
        'Draai `pnpm --filter @dsn-starter-kit/components-html build:manifest` en commit het resultaat.'
    );
    process.exit(1);
  }

  fs.writeFileSync(MANIFEST_PATH, output);
  console.log(`Wrote manifest.json: ${manifest.components.length} components.`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { assembleManifest, findParts, format, kebabCase };
