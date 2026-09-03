/**
 * Variant-matrix voor Paragraph.
 *
 * Drie maten tekst: de lopende tekst, de inleidende `lead` en de kleine
 * `small-print`. Meer assen heeft het component niet, en dat is de bedoeling:
 * kleur komt van de context waar de paragraaf in staat, niet van een modifier.
 */

import { TEKST } from '../text.js';

export default {
  component: 'Paragraph',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/paragraph/paragraph.css',
  ],

  axes: {
    appearance: ['default', 'lead', 'small-print'],
  },

  componentProperties: [{ name: 'label', type: 'TEXT', slot: 'label' }],

  render({ appearance }) {
    const classes = [
      'dsn-paragraph',
      appearance !== 'default' && `dsn-paragraph--${appearance}`,
    ]
      .filter(Boolean)
      .join(' ');

    return `<p class="${classes}" data-figma-root data-figma-slot="label">${TEKST}</p>`;
  },
};
