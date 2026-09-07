/**
 * Variant-matrix voor Menu.
 *
 * De `<ul>` die MenuLink-items bij elkaar houdt. De oriëntatie is een echte as:
 * `--horizontal` verandert niet alleen de richting maar ook de spacing en de
 * scheidingslijnen van de items erin.
 *
 * De items hierin zijn gemeten lagen en geen instances van de MenuLink-set;
 * zie issue #369.
 */

import { TEKST } from '../text.js';

export default {
  component: 'Menu',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/button/button.css',
    '@dsn-starter-kit/components-html/src/menu-link/menu-link.css',
    '@dsn-starter-kit/components-html/src/menu/menu.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    orientation: ['vertical', 'horizontal'],
  },

  render({ orientation }) {
    const classes = [
      'dsn-menu',
      orientation === 'horizontal' && 'dsn-menu--horizontal',
    ]
      .filter(Boolean)
      .join(' ');

    const item = (current) =>
      `<li class="dsn-menu-link">
         <a href="#" class="dsn-menu-link__link"${current ? ' aria-current="page"' : ''}>
           <span class="dsn-menu-link__label">${TEKST}</span>
         </a>
       </li>`;

    return `<ul class="${classes}" data-figma-root>
      ${item(true)}${item(false)}${item(false)}
    </ul>`;
  },
};
