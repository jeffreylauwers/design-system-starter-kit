/**
 * Variant-matrix voor MenuButton.
 *
 * Hetzelfde uiterlijk als een MenuLink, maar het is een `<button>` in plaats
 * van een `<a>`: voor een actie die geen navigatie is. Anders dan bij
 * ButtonLink en LinkButton is dit géén doublure, want MenuButton heeft eigen
 * klassen en eigen tokens.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

export default {
  component: 'MenuButton',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/menu-button/menu-button.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    icon: ['with-icon', 'no-icon'],
    state: ['default', 'hover'],
  },

  pseudoStates: { hover: 'hover' },

  componentProperties: [{ name: 'label', type: 'TEXT', slot: 'label' }],

  render({ icon: iconAxis }) {
    const iconMarkup = iconAxis === 'with-icon' ? icon('settings') : '';

    return `<li class="dsn-menu-button" data-figma-root>
      <button type="button" class="dsn-menu-button__button">
        ${iconMarkup}
        <span class="dsn-menu-button__label" data-figma-slot="label">${TEKST}</span>
      </button>
    </li>`;
  },
};
