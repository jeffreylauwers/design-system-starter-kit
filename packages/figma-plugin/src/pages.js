/**
 * De pagina's die deze plugin beheert.
 *
 * De iconset staat op `dsn/Icons` en elke component set op zijn eigen
 * `dsn/{Component}`. Alles onder één `dsn/`-prefix, zodat de plugin die
 * pagina's alfabetisch kan zetten zonder aan de pagina's van de designer te
 * komen.
 */

/** Alleen pagina's met deze prefix worden door de plugin geordend. */
export const MANAGED_PREFIX = 'dsn/';

/**
 * `figma.root.children` is pas te lezen na `loadAllPagesAsync` in een bestand
 * met dynamic page loading; zonder die aanroep gooit Figma daar sinds 2024 een
 * fout op.
 */
async function loadAllPages() {
  if (typeof figma.loadAllPagesAsync === 'function') {
    await figma.loadAllPagesAsync();
  }
}

/** Zoekt de pagina met deze naam, of maakt hem aan. */
export async function findOrCreatePage(name) {
  await loadAllPages();

  const existing = figma.root.children.find(
    (page) => page.type === 'PAGE' && page.name === name
  );
  if (existing) return existing;

  const page = figma.createPage();
  page.name = name;
  return page;
}

/**
 * Opent een pagina. In een bestand met dynamic page loading is het synchrone
 * `figma.currentPage =` niet meer toegestaan; setCurrentPageAsync is de route
 * die het wel is.
 */
export async function openPage(page) {
  if (figma.currentPage === page) return;
  if (typeof figma.setCurrentPageAsync === 'function') {
    await figma.setCurrentPageAsync(page);
  } else {
    figma.currentPage = page;
  }
}

/**
 * Zet de `dsn/`-pagina's alfabetisch.
 *
 * Alleen die pagina's, en alleen binnen de plekken die ze al innamen: de
 * pagina's van de designer blijven staan waar ze stonden. Een plugin die de
 * hele paginalijst herschikt zou een indeling omgooien die iemand met de hand
 * heeft gemaakt, en dat is een grotere ingreep dan het probleem dat hij oplost.
 *
 * Het verplaatsen gaat van voor naar achter: staat op de gewenste plek al de
 * juiste pagina, dan gebeurt er niets, en anders wordt de gewenste pagina
 * daarheen verplaatst. Alles vóór die plek is dan al goed, dus de pagina die
 * moet komen staat gegarandeerd verderop en schuift de rest een plek op.
 *
 * @returns {Promise<string[]>} de nieuwe volgorde van de beheerde pagina's
 */
export async function sortManagedPages() {
  await loadAllPages();

  const pages = [...figma.root.children];
  const slots = [];
  const managed = [];

  pages.forEach((page, index) => {
    if (page.name.startsWith(MANAGED_PREFIX)) {
      slots.push(index);
      managed.push(page);
    }
  });

  const sorted = [...managed].sort((a, b) =>
    a.name.localeCompare(b.name, 'nl')
  );

  const target = [...pages];
  slots.forEach((slot, index) => {
    target[slot] = sorted[index];
  });

  for (const [index, page] of target.entries()) {
    if (figma.root.children[index] === page) continue;
    figma.root.insertChild(index, page);
  }

  return sorted.map((page) => page.name);
}
