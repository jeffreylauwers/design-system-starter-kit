/**
 * Variant-matrix voor PreHeading.
 *
 * Eén variant, en dat is geen reden om hem over te slaan: PreHeading heeft
 * eigen kleur- en typografietokens, en juist die worden in een inverse
 * context vergeten (zie de regel over inverse containers in CLAUDE.md). Als
 * hij als component in Figma staat, is te zien wat er hoort te veranderen.
 */

import { TEKST } from '../text.js';

export default {
  component: 'PreHeading',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/pre-heading/pre-heading.css',
  ],

  axes: {
    appearance: ['default'],
  },

  componentProperties: [{ name: 'label', type: 'TEXT', slot: 'label' }],

  render() {
    return `<span class="dsn-pre-heading" data-figma-root data-figma-slot="label">${TEKST}</span>`;
  },
};
