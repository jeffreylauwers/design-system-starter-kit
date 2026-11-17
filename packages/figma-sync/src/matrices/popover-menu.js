/**
 * Variant-matrix voor PopoverMenu.
 *
 * Het paneel van de Popover (alle visuele tokens delegeren naar
 * `--dsn-popover-*`) met een lijst MenuButtons erin, zonder kop en zonder
 * sluitknop. Net als bij Popover is de root het paneel zelf en niet de
 * wrapper: die positioneert het paneel naast zijn trigger, en een designer
 * zet het in Figma zelf op zijn plek. Daarom is `placement` geen as.
 *
 * De lijst is het slot `items`: een designer zet er zelf MenuButtons in of
 * haalt ze eruit. De lijst is zelf geen Menu-instance
 * (`data-figma-instance="none"`): de Menu-set bestaat uit MenuLinks, en een
 * slot in een instance kan een designer niet vullen.
 *
 * Zonder `showPopover()` geldt de `display: none` uit de UA-stylesheet, dus
 * die aanroep staat in `domSetup`, zoals bij Popover.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

export default {
  component: 'PopoverMenu',

  // De items zijn instances van de MenuButton-set, in dezelfde opbouw als
  // die set, zodat ze geen overrides nodig hebben.
  instances: true,

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/button/button.css',
    '@dsn-starter-kit/components-html/src/menu-link/menu-link.css',
    '@dsn-starter-kit/components-html/src/menu-button/menu-button.css',
    '@dsn-starter-kit/components-html/src/menu/menu.css',
    '@dsn-starter-kit/components-html/src/popover-menu/popover-menu.css',
  ],

  wrapperStyle: 'width: 328px;',

  domSetup: `
    for (const popover of document.querySelectorAll('[popover]')) {
      popover.showPopover();
    }
  `,

  render() {
    const item = () =>
      `<li class="dsn-menu-button">
         <button type="button" class="dsn-menu-button__button">
           ${icon('settings', { slot: 'icon-start' })}
           <span class="dsn-menu-button__label" data-figma-slot="label">${TEKST}</span>
           ${icon('chevron-right', { slot: 'icon-end' })}
         </button>
       </li>`;

    return `<div class="dsn-popover-menu-wrapper">
      <div class="dsn-popover-menu dsn-popover-menu--placement-bottom" popover data-figma-root>
        <ul class="dsn-menu" role="list" data-figma-instance="none" data-figma-children="items">
          ${item()}${item()}${item()}
        </ul>
      </div>
    </div>`;
  },
};
