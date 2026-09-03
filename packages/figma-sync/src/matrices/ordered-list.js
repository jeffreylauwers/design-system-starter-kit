/**
 * Variant-matrix voor OrderedList.
 *
 * Zelfde beperking als UnorderedList: de nummers komen niet mee, want
 * `::marker` is een pseudo-element en geen DOM-node. De inspringing is hier
 * groter dan bij de ongeordende lijst, en juist die maat is wat een designer
 * uit Figma nodig heeft.
 */

import { TEKST } from '../text.js';

export default {
  component: 'OrderedList',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/ordered-list/ordered-list.css',
  ],

  wrapperStyle: 'width: 343px;',

  warnings: [
    'de nummers ontbreken: `::marker` is een pseudo-element en geen DOM-node, dus er valt niets te meten. De inspringing en de afstand tussen items komen wel mee; zet de nummering in Figma met een lijststijl.',
  ],

  axes: {
    length: ['single-item', 'multiple-items'],
  },

  render({ length }) {
    const items =
      length === 'single-item' ? [TEKST] : [TEKST, `${TEKST} ${TEKST}`, TEKST];

    return `<ol class="dsn-ordered-list" data-figma-root>
      ${items.map((item) => `<li>${item}</li>`).join('')}
    </ol>`;
  },
};
