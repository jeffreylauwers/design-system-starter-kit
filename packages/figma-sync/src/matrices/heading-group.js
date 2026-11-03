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
 *
 * Dit is de eerste matrix op `instances: true`: in Figma is HeadingGroup een
 * frame met een instance van `dsn-pre-heading` en een van `dsn-heading`, geen
 * eigen nagebouwde typografie. De PreHeading herkent de generator aan zijn
 * klasse. De Heading niet, want die is hier de root zelf en geen kind: de
 * tekst hangt direct in de `<h2>`. Vandaar `data-figma-instance` op de span
 * eromheen. De appearance zoekt de generator zelf uit door te vergelijken. Het
 * level niet: dat haalt de Heading uit de tag, en de span is geen `<h*>`. Het
 * level is dat van de `<h2>` eromheen, dus `data-figma-variant="level=2"`. Een
 * designer zet het in het paneel om, want de Heading is exposed.
 *
 * Geen eigen component properties meer. Beide instances zijn "exposed", dus
 * de `label` van de Heading en die van de PreHeading staan gewoon in het
 * paneel van de HeadingGroup.
 */

import { HEADING, TEKST } from '../text.js';

export default {
  component: 'HeadingGroup',
  setName: 'dsn-heading-group',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/heading/heading.css',
    '@dsn-starter-kit/components-html/src/pre-heading/pre-heading.css',
    '@dsn-starter-kit/components-html/src/heading-group/heading-group.css',
  ],

  wrapperStyle: 'width: 328px;',

  axes: {
    appearance: ['heading-1', 'heading-2', 'heading-3', 'heading-4'],
  },

  instances: true,

  render({ appearance }) {
    return `<h2 class="dsn-heading dsn-heading--${appearance} dsn-heading-group" data-figma-root>
      <span class="dsn-pre-heading">${TEKST}</span>
      <span data-figma-instance="dsn-heading" data-figma-variant="level=2">${HEADING}</span>
    </h2>`;
  },
};
