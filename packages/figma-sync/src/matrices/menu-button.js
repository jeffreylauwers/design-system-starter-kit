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

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
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
        ${icon('chevron-right', { slot: 'icon-end' })}
      </button>
    </li>`;
  },
};
