/**
 * Variant-matrix voor Heading.
 *
 * De eenvoudigste vorm die er is: één element dat alleen tekst bevat. De
 * extractor klapt dat tot één TEXT-node in plaats van een frame met een
 * tekstnode erin, dus dit is meteen de toets of die stap ook op een root
 * werkt.
 *
 * De as heet `appearance` en niet `level`: `dsn-heading--heading-2` zegt in de
 * CSS hoe de kop eruitziet, niet welk `<h*>`-element het is. Die twee staan
 * los van elkaar (`<h1 class="dsn-heading dsn-heading--heading-3">` is geldig),
 * en Figma kent geen kopniveau, alleen uiterlijk.
 */

import { HEADING } from '../text.js';

export default {
  component: 'Heading',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/heading/heading.css',
  ],

  axes: {
    appearance: [
      'heading-1',
      'heading-2',
      'heading-3',
      'heading-4',
      'heading-5',
      'heading-6',
    ],
  },

  componentProperties: [{ name: 'label', type: 'TEXT', slot: 'label' }],

  render({ appearance }) {
    return `<h2 class="dsn-heading dsn-heading--${appearance}" data-figma-root data-figma-slot="label">${HEADING}</h2>`;
  },
};
