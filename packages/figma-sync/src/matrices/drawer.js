/**
 * Variant-matrix voor Drawer.
 *
 * Zelfde `[open]`-eis als ModalDialog: zonder dat attribuut geldt de
 * `display: none` uit de UA-stylesheet. De zijde is een echte as, want
 * `--side-left` en `--side-right` zetten allebei een eigen `inset` en een
 * eigen uit-transform.
 *
 * De drawer is `position: fixed`, dus zijn maat komt uit zijn insets en niet
 * uit zijn inhoud. Daarom blijft hij in Figma FIXED en niet HUG.
 *
 * De body en de footer zijn slots, net als bij ModalDialog: de body met de
 * Paragraph als standaardinhoud, de footer met een instance van ActionGroup.
 * De header is bewust geen slot, want daar zet DrawerHeader in code altijd
 * zelf de sluitknop in. De `footer`-as is daarmee weg: wil een designer geen
 * footer, dan zet hij het slot uit.
 */

import { icon } from '../icons.js';
import { HEADING, TEKST } from '../text.js';

export default {
  component: 'Drawer',

  // De sluitknop is een instance van de icon-only Button, met `x` via de
  // instance swap `icon`. De Paragraph en de ActionGroup in de slots zijn
  // instances van hun eigen sets; de knoppen in de ActionGroup renderen
  // dezelfde opbouw als de ActionGroup-set, zodat die geen overrides nodig
  // heeft.
  instances: true,

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/button/button.css',
    '@dsn-starter-kit/components-html/src/heading/heading.css',
    '@dsn-starter-kit/components-html/src/paragraph/paragraph.css',
    '@dsn-starter-kit/components-html/src/action-group/action-group.css',
    '@dsn-starter-kit/components-html/src/drawer/drawer.css',
  ],

  warnings: [
    'de `::backdrop` komt niet mee: dat is een pseudo-element en dus geen DOM-node.',
  ],

  axes: {
    side: ['left', 'right'],
  },

  render({ side }) {
    const button = (variant) =>
      `<li class="dsn-action-group__item" data-figma-unwrap>
         <button type="button" class="dsn-button dsn-button--${variant} dsn-button--size-default">
           ${icon('chevron-left')}
           <span class="dsn-button__label">${TEKST}</span>
           ${icon('chevron-right')}
         </button>
       </li>`;

    return `<dialog class="dsn-drawer dsn-drawer--side-${side}" open data-figma-root>
      <div class="dsn-drawer__header">
        <h2 class="dsn-drawer-heading">${HEADING}</h2>
        <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only">
          ${icon('x')}
          <span class="dsn-button__label">Sluiten</span>
        </button>
      </div>
      <div class="dsn-drawer__body" data-figma-children="body">
        <p class="dsn-paragraph">${TEKST}</p>
      </div>
      <div class="dsn-drawer__footer" data-figma-children="footer">
        <ul class="dsn-action-group" aria-label="Acties">
          ${button('strong')}
          ${button('subtle')}
        </ul>
      </div>
    </dialog>`;
  },
};
