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
 */

import { icon } from '../icons.js';
import { HEADING, TEKST } from '../text.js';

export default {
  component: 'Drawer',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/button/button.css',
    '@dsn-starter-kit/components-html/src/heading/heading.css',
    '@dsn-starter-kit/components-html/src/paragraph/paragraph.css',
    '@dsn-starter-kit/components-html/src/drawer/drawer.css',
  ],

  warnings: [
    'de `::backdrop` komt niet mee: dat is een pseudo-element en dus geen DOM-node.',
  ],

  axes: {
    side: ['left', 'right'],
    footer: ['with-footer', 'no-footer'],
  },

  render({ side, footer }) {
    const footerMarkup =
      footer === 'with-footer'
        ? `<div class="dsn-drawer__footer">
             <button type="button" class="dsn-button dsn-button--strong dsn-button--size-default">
               <span class="dsn-button__label">${TEKST}</span>
             </button>
           </div>`
        : '';

    return `<dialog class="dsn-drawer dsn-drawer--side-${side}" open data-figma-root>
      <div class="dsn-drawer__header">
        <h2 class="dsn-drawer-heading">${HEADING}</h2>
        <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only">
          ${icon('x')}
          <span class="dsn-button__label">Sluiten</span>
        </button>
      </div>
      <div class="dsn-drawer__body">
        <p class="dsn-paragraph">${TEKST}</p>
      </div>
      ${footerMarkup}
    </dialog>`;
  },
};
