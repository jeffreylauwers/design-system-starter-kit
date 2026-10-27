/**
 * Variant-matrix voor UnorderedList.
 *
 * De items staan in een slot (`data-figma-children`, issue #450): een
 * designer zet er zelf items bij of haalt ze weg, in de instance, zonder te
 * detachen. De standaardinhoud is 3 instances van `__item`
 * (`dsn-unordered-list__item`). Zie "Slots" in de README.
 *
 * Het bolletje komt uit `::marker`, dat de extractor als laag tekent. De
 * inspringing van de lijst staat daardoor niet meer op de lijst maar in de
 * markerkolom van elk item, met hetzelfde token. Zie "Markers van lijsten" in
 * de README.
 *
 * Een item is geen `cssBlock` uit de manifest (het is een kale `<li>`), dus
 * de generator herkent hem niet vanzelf; `data-figma-instance` wijst hem aan.
 */

import { TEKST } from '../text.js';

export const ITEM_COUNT = 3;

export default {
  component: 'UnorderedList',

  instances: true,

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/unordered-list/unordered-list.css',
  ],

  wrapperStyle: 'width: 328px;',

  render() {
    const items = Array.from(
      { length: ITEM_COUNT },
      () =>
        `<li data-figma-instance="dsn-unordered-list__item"><span data-figma-slot="label">${TEKST}</span></li>`
    ).join('');

    return `<ul class="dsn-unordered-list" data-figma-root data-figma-children="slot">${items}</ul>`;
  },
};
