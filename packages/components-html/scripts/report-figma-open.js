#!/usr/bin/env node
/**
 * Lists every Figma binding with `"open": true`: a part of the API that is not
 * in Figma for a reason nobody has looked into yet, or that is only partly
 * there.
 *
 * While the api blocks are being filled in (issue #488), such a binding marks
 * a question for later instead of a guessed reason. This script collects them
 * as a Markdown table, ready to paste into an issue:
 *
 *   pnpm --filter @dsn-starter-kit/components-html report:figma-open
 */

const path = require('path');
const { readJson } = require('./validate-manifest.js');

const MANIFEST_PATH = path.resolve(__dirname, '..', 'manifest.json');

/** Every open binding, as { component, part, name, reason }. */
function findOpen(manifest) {
  const rows = [];
  for (const component of manifest.components) {
    const api = component.api;
    if (!api) continue;
    for (const [part, list] of [
      ['prop', api.props],
      ['slot', api.slots],
      ['state', api.states],
    ]) {
      for (const item of list) {
        for (const binding of item.figma ?? []) {
          if (binding.open) {
            rows.push({
              component: component.name,
              part,
              name: item.name,
              reason: binding.reason,
            });
          }
        }
      }
    }
  }
  return rows;
}

function main() {
  const rows = findOpen(readJson(MANIFEST_PATH));
  if (rows.length === 0) {
    console.log('Geen open Figma-bindingen.');
    return;
  }
  console.log('| Component | Onderdeel | Naam | Reden nu |');
  console.log('| --- | --- | --- | --- |');
  for (const row of rows) {
    console.log(
      `| ${row.component} | ${row.part} | \`${row.name}\` | ${row.reason} |`
    );
  }
  console.log(`\n${rows.length} open.`);
}

if (require.main === module) main();

module.exports = { findOpen };
