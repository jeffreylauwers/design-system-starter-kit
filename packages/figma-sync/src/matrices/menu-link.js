/**
 * Variant-matrix voor MenuLink.
 *
 * Een item in een Menu, met een niveau dat de inspringing bepaalt en een
 * uitklapknop voor een submenu. Die knop is een echte `dsn-button`, wat
 * `menu-link.css` ook declareert met `@dsn-depends-on: button`.
 *
 * Het niveau is een as en geen property: `--level-2` en hoger zetten een eigen
 * `padding-inline-start` en een eigen typografie, dus dat zijn gemeten tokens.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

export default {
  component: 'MenuLink',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/button/button.css',
    '@dsn-starter-kit/components-html/src/menu-link/menu-link.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    level: ['1', '2', '3'],
    state: ['default', 'current'],
    expand: ['with-expand', 'no-expand'],
  },

  render({ level, state, expand }) {
    const classes = [
      'dsn-menu-link',
      level !== '1' && `dsn-menu-link--level-${level}`,
    ]
      .filter(Boolean)
      .join(' ');

    const expandMarkup =
      expand === 'with-expand'
        ? `<span class="dsn-menu-link__divider" aria-hidden="true"></span>
           <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only dsn-menu-link__expand-button">
             ${icon('chevron-down')}
             <span class="dsn-button__label">Submenu openen</span>
           </button>`
        : '';

    return `<li class="${classes}" data-figma-root>
      <a href="#" class="dsn-menu-link__link"${state === 'current' ? ' aria-current="page"' : ''}>
        <span class="dsn-menu-link__label">${TEKST}</span>
      </a>
      ${expandMarkup}
    </li>`;
  },
};
