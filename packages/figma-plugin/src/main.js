/**
 * Entry point van de plugin (draait in de Figma-sandbox).
 *
 * De plugin leest niets zelf van schijf: de UI laat de gebruiker de door de
 * generator geschreven JSON-bestanden kiezen en stuurt de inhoud hierheen.
 * Daarmee heeft de plugin geen netwerktoegang en geen token nodig.
 */

import { importVariables } from './variables.js';
import { importComponentSet } from './components.js';
import { importIconSet } from './icons.js';

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

async function runImport(message, log) {
  if (message.kind === 'variables') {
    const result = await importVariables(message.payload, log);
    return `${result.aliasCount} aliassen gelegd`;
  }
  if (message.kind === 'icons') {
    const result = await importIconSet(message.payload, log);
    return `${result.created} iconen toegevoegd, ${result.updated} bijgewerkt`;
  }
  const result = await importComponentSet(message.payload, log);
  return `${result.variants} varianten, ${result.bindings.bound} bindingen`;
}

async function handleImport(message) {
  const log = createLog();
  const started = Date.now();

  try {
    const summary = await runImport(message, log);

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

/**
 * Meerdere bestanden tegelijk laten vallen levert meerdere berichten op. Die
 * moeten op volgorde blijven: componenten binden aan variables die er al
 * moeten zijn, en straks aan iconen die er al moeten staan. Zonder deze wachtrij
 * lopen de imports door elkaar heen en hangt het van de bestandsgrootte af of
 * de volgorde klopt.
 */
let queue = Promise.resolve();

figma.ui.onmessage = (message) => {
  if (message.type === 'import') {
    queue = queue.then(() => handleImport(message));
    return queue;
  }
  if (message.type === 'close') return figma.closePlugin();
  return undefined;
};
