/**
 * Variant-matrix voor UnorderedList.
 *
 * Een lijst van 10 instances van `dsn-unordered-list-item`, alle tien op
 * hetzelfde item. Een designer vult de tekst per item in het paneel in en zet
 * de items uit die hij niet nodig heeft; booleans per item zijn er bewust niet.
 * Straks bepaalt een slot het aantal (issue #450), en dan vult de designer dat
 * slot met dezelfde items.
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

export const ITEM_COUNT = 10;

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
        `<li data-figma-instance="dsn-unordered-list-item"><span data-figma-slot="label">${TEKST}</span></li>`
    ).join('');

    return `<ul class="dsn-unordered-list" data-figma-root>${items}</ul>`;
  },
};
