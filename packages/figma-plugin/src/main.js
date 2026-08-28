/**
 * Entry point van de plugin (draait in de Figma-sandbox).
 *
 * De plugin leest niets zelf van schijf: de UI laat de gebruiker de door de
 * generator geschreven JSON-bestanden kiezen en stuurt de inhoud hierheen.
 * Daarmee heeft de plugin geen netwerktoegang en geen token nodig.
 */

import { importVariables } from './variables.js';
import { importComponentSet } from './components.js';

figma.showUI(__html__, { width: 420, height: 520 });

/** Verzamelt meldingen en stuurt ze naar de UI. */
function createLog() {
  const entries = [];
  const push = (level) => (message) => {
    entries.push({ level, message });
    figma.ui.postMessage({ type: 'log', level, message });
  };
  return {
    entries,
    info: push('info'),
    warn: push('warn'),
    error: push('error'),
  };
}

async function handleImport(message) {
  const log = createLog();
  const started = Date.now();

  try {
    let summary;

    if (message.kind === 'variables') {
      const result = await importVariables(message.payload, log);
      summary = `${result.aliasCount} aliassen gelegd`;
    } else {
      const result = await importComponentSet(message.payload, log);
      summary = `${result.variants} varianten, ${result.bindings.bound} bindingen`;
    }

    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    const errors = log.entries.filter(
      (entry) => entry.level === 'error'
    ).length;

    figma.ui.postMessage({
      type: 'done',
      ok: errors === 0,
      summary: `${summary} in ${seconds}s${errors ? `, ${errors} fouten` : ''}`,
    });
  } catch (error) {
    log.error(error.message);
    figma.ui.postMessage({ type: 'done', ok: false, summary: error.message });
  }
}

figma.ui.onmessage = (message) => {
  if (message.type === 'import') return handleImport(message);
  if (message.type === 'close') return figma.closePlugin();
  return undefined;
};
