/**
 * Variant-matrix voor het list item van UnorderedList.
 *
 * Geen component in code: een UnorderedList bevat kale `<li>`-elementen. In
 * Figma is het wel een eigen set, zodat de lijst uit instances van één item
 * bestaat en een designer de tekst per item in het paneel invult. Later vult
 * een slot de lijst met deze items (issue #450).
 *
 * Het item is een rij met een markerkolom en de tekst. Het bolletje komt uit
 * `::marker`, dat de extractor als laag tekent; de kolom is zo breed als de
 * inspringing van de lijst en hangt aan hetzelfde token. Zie "Markers van
 * lijsten" in de README.
 *
 * `level` is de geneste weergave. De matrix rendert een echt geneste lijst en
 * meet het diepste item; de inspringing van de lijsten erboven komt als lege
 * laag vóór de marker, elk met het padding-token van zijn lijst. Het bolletje
 * blijft op elk niveau een `disc`, want zo zet de CSS het.
 */

import { TEKST } from '../text.js';

export default {
  component: 'UnorderedListItem',
  setName: 'dsn-unordered-list-item',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/unordered-list/unordered-list.css',
  ],

  wrapperStyle: 'width: 328px;',

  axes: {
    level: ['1', '2', '3'],
  },

  componentProperties: [{ name: 'label', type: 'TEXT', slot: 'label' }],

  render({ level }) {
    const item = `<li data-figma-root><span data-figma-slot="label">${TEKST}</span></li>`;

    // Elk niveau erboven is een item met tekst en daarin de volgende lijst.
    let markup = `<ul class="dsn-unordered-list">${item}</ul>`;
    for (let depth = 1; depth < Number(level); depth += 1) {
      markup = `<ul class="dsn-unordered-list"><li>${TEKST}${markup}</li></ul>`;
    }
    return markup;
  },
};
