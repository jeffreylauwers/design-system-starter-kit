/**
 * Variant-matrix voor HeadingGroup.
 *
 * Een kop met een pre-heading erboven, als één blok. De root draagt drie
 * klassen (`dsn-heading dsn-heading--{appearance} dsn-heading-group`) en de
 * setnaam komt normaal uit de eerste; zonder `setName` zou deze set dus
 * `dsn-heading` gaan heten en niet van de Heading-set te onderscheiden zijn.
 *
 * Dit is ook het component waar de regel over inverse containers uit CLAUDE.md
 * op aangrijpt: PreHeading heeft een eigen kleurtoken, en dat is precies het
 * token dat op een donkere achtergrond vergeten wordt. In Figma is dat nu een
 * eigen laag met een eigen binding, dus zichtbaar.
 */

import { HEADING, TEKST } from '../text.js';

export default {
  component: 'HeadingGroup',
  setName: 'dsn-heading-group',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/heading/heading.css',
    '@dsn-starter-kit/components-html/src/pre-heading/pre-heading.css',
    '@dsn-starter-kit/components-html/src/heading-group/heading-group.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    appearance: ['heading-1', 'heading-2', 'heading-3', 'heading-4'],
  },

  componentProperties: [
    { name: 'preHeading', type: 'TEXT', slot: 'pre-heading' },
    { name: 'label', type: 'TEXT', slot: 'label' },
  ],

  render({ appearance }) {
    return `<h2 class="dsn-heading dsn-heading--${appearance} dsn-heading-group" data-figma-root>
      <span class="dsn-pre-heading" data-figma-slot="pre-heading">${TEKST}</span>
      <span data-figma-slot="label">${HEADING}</span>
    </h2>`;
  },
};
