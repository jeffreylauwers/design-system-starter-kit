/**
 * Variant-matrix voor MenuButton.
 *
 * Hetzelfde uiterlijk als een MenuLink, maar het is een `<button>` in plaats
 * van een `<a>`: voor een actie die geen navigatie is. Anders dan bij
 * ButtonLink en LinkButton is dit géén doublure, want MenuButton heeft eigen
 * klassen en eigen tokens.
 *
 * De iconen werken zoals bij Button: twee slots die altijd gerenderd worden,
 * elk met een boolean die ze aanzet en een instance swap die het icoon kiest.
 * Dezelfde namen als de props `iconStart` en `iconEnd` in React. Een icoon is
 * geen as: welk icoon er staat, of dat er een staat, verandert geen gemeten
 * token. Zie issue #400.
 *
 * Bewust nog niet hier: `dotBadge`.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

export default {
  component: 'MenuButton',

  // De DotBadge is een instance van zijn eigen set; de variant kiest een
  // designer daar. Hij staat direct in de knop, zoals in menu-button.css:
  // hij is absoluut gepositioneerd ten opzichte van de knop. React zet hem in
  // het label, maar dat label is geen positioneringscontext, dus het beeld is
  // hetzelfde.
  instances: true,

  // De dot hangt met `inset-inline-end` en `inset-block-start` in de
  // rechterbovenhoek van de knop, en blijft daar als de knop breder wordt.
  absoluteConstraints: { 'dot-badge': { horizontal: 'MAX', vertical: 'MIN' } },

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/dot-badge/dot-badge.css',
    '@dsn-starter-kit/components-html/src/menu-button/menu-button.css',
  ],

  wrapperStyle: 'width: 328px;',

  axes: {
    state: ['default', 'hover', 'active'],
  },

  pseudoStates: { hover: 'hover', active: 'active' },

  /**
   * `showIconStart` staat standaard aan, anders dan bij Button: de oude
   * standaardvariant van deze set had een icoon, en een menu-item heeft er
   * vaker een dan een knop.
   */
  componentProperties: [
    { name: 'label', type: 'TEXT', slot: 'label' },
    {
      name: 'showIconStart',
      type: 'BOOLEAN',
      slot: 'icon-start',
      default: true,
    },
    {
      name: 'iconStart',
      type: 'INSTANCE_SWAP',
      slot: 'icon-start',
      default: 'settings',
    },
    {
      name: 'showDotBadge',
      type: 'BOOLEAN',
      slot: 'dot-badge',
      default: false,
    },
    {
      name: 'showIconEnd',
      type: 'BOOLEAN',
      slot: 'icon-end',
      default: false,
    },
    {
      name: 'iconEnd',
      type: 'INSTANCE_SWAP',
      slot: 'icon-end',
      default: 'chevron-right',
    },
  ],

  render() {
    return `<li class="dsn-menu-button" data-figma-root>
      <button type="button" class="dsn-menu-button__button">
        ${icon('settings', { slot: 'icon-start' })}
        <span class="dsn-menu-button__label" data-figma-slot="label">${TEKST}</span>
        <span class="dsn-dot-badge dsn-dot-badge--negative" aria-hidden="true" data-figma-slot="dot-badge"></span>
        ${icon('chevron-right', { slot: 'icon-end' })}
      </button>
    </li>`;
  },
};
