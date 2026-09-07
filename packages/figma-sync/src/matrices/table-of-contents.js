/**
 * Variant-matrix voor TableOfContents.
 *
 * Een kop met een ongeordende lijst links eronder. De `plain`-variant is geen
 * kleurverschil maar een ander kopniveau (heading-5 in plaats van heading-3) en
 * een ander kader, dus een echte as.
 *
 * Zelfde `::marker`-beperking als bij UnorderedList: de bolletjes zijn een
 * pseudo-element en komen niet mee. Zie issue #373.
 */

import { HEADING, TEKST } from '../text.js';

export default {
  component: 'TableOfContents',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/heading/heading.css',
    '@dsn-starter-kit/components-html/src/link/link.css',
    '@dsn-starter-kit/components-html/src/unordered-list/unordered-list.css',
    '@dsn-starter-kit/components-html/src/table-of-contents/table-of-contents.css',
  ],

  wrapperStyle: 'width: 343px;',

  warnings: [
    'de bolletjes van de lijst ontbreken: `::marker` is een pseudo-element en dus geen DOM-node. Zie issue #373.',
  ],

  axes: {
    appearance: ['default', 'plain'],
  },

  render({ appearance }) {
    const plain = appearance === 'plain';

    const classes = [
      'dsn-table-of-contents',
      plain && 'dsn-table-of-contents--plain',
    ]
      .filter(Boolean)
      .join(' ');

    const item = () => `<li><a href="#" class="dsn-link">${TEKST}</a></li>`;

    return `<nav class="${classes}" data-figma-root>
      <h2 class="dsn-heading dsn-heading--${plain ? 'heading-5' : 'heading-3'} dsn-table-of-contents__heading">${HEADING}</h2>
      <ul class="dsn-unordered-list">${item()}${item()}${item()}</ul>
    </nav>`;
  },
};
