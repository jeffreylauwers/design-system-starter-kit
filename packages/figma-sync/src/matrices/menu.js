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

import { icon } from '../icons.js';
import { TEKST } from '../text.js';
import { FLAG } from '../flags.js';
import { axisValues } from '../manifest.js';

export default {
  component: 'Menu',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/button/button.css',
    '@dsn-starter-kit/components-html/src/menu-link/menu-link.css',
    '@dsn-starter-kit/components-html/src/menu/menu.css',
  ],

  wrapperStyle: 'width: 328px;',

  axes: {
    orientation: axisValues('Menu', 'orientation'),
    iconStart: FLAG,
  },

  // `iconStart` verandert alleen de inspringing van MenuLinks vanaf level 2
  // (de breedte van een icoon plus de gap). Daarom staat er in de verticale
  // stand een level-2-item onder het eerste item. Een horizontaal Menu heeft
  // geen levels, dus daar bestaat `iconStart=true` niet.
  skipVariant: ({ orientation, iconStart }) =>
    orientation === 'horizontal' && iconStart === 'true',

  render({ orientation, iconStart }) {
    const classes = [
      'dsn-menu',
      orientation === 'horizontal' && 'dsn-menu--horizontal',
      iconStart === 'true' && 'dsn-menu--icon-start',
    ]
      .filter(Boolean)
      .join(' ');

    // Met `iconStart` hebben de level-1-items een icoon, zoals in de stories.
    const item = (current, level = 1) =>
      `<li class="dsn-menu-link${level > 1 ? ` dsn-menu-link--level-${level}` : ''}">
         <a href="#" class="dsn-menu-link__link"${current ? ' aria-current="page"' : ''}>
           ${level === 1 && iconStart === 'true' ? icon('settings') : ''}
           <span class="dsn-menu-link__label">${TEKST}</span>
         </a>
       </li>`;

    const nested = orientation === 'vertical' ? item(false, 2) : '';

    return `<ul class="${classes}" data-figma-root>
      ${item(true)}${nested}${item(false)}${item(false)}
    </ul>`;
  },
};
