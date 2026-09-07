/**
 * Variant-matrix voor ModalDialog.
 *
 * Een native `<dialog>` die alleen bestaat als hij open is: zonder `[open]`
 * geldt de `display: none` uit de UA-stylesheet, en dan valt er niets te meten.
 * Het attribuut staat er daarom altijd op, en `state` gaat over wat er ín de
 * dialoog staat, niet over open of dicht.
 *
 * De `::backdrop` komt niet mee. Dat is een pseudo-element, net als `::marker`
 * en `::file-selector-button`, en het is bovendien Backdrop, dat volgens de
 * README bewust geen eigen component in Figma is.
 */

import { icon } from '../icons.js';
import { HEADING, TEKST } from '../text.js';

export default {
  component: 'ModalDialog',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/button/button.css',
    '@dsn-starter-kit/components-html/src/heading/heading.css',
    '@dsn-starter-kit/components-html/src/paragraph/paragraph.css',
    '@dsn-starter-kit/components-html/src/action-group/action-group.css',
    '@dsn-starter-kit/components-html/src/modal-dialog/modal-dialog.css',
  ],

  warnings: [
    'de `::backdrop` komt niet mee: dat is een pseudo-element en dus geen DOM-node. Backdrop is volgens de README ook bewust geen eigen component in Figma.',
  ],

  axes: {
    footer: ['with-footer', 'no-footer'],
  },

  render({ footer }) {
    const footerMarkup =
      footer === 'with-footer'
        ? `<div class="dsn-modal-dialog__footer">
             <div class="dsn-action-group">
               <button type="button" class="dsn-button dsn-button--strong dsn-button--size-default">
                 <span class="dsn-button__label">${TEKST}</span>
               </button>
               <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-default">
                 <span class="dsn-button__label">${TEKST}</span>
               </button>
             </div>
           </div>`
        : '';

    return `<dialog class="dsn-modal-dialog" open data-figma-root>
      <div class="dsn-modal-dialog__header">
        <h2 class="dsn-modal-dialog-heading">${HEADING}</h2>
        <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only">
          ${icon('x')}
          <span class="dsn-button__label">Sluiten</span>
        </button>
      </div>
      <div class="dsn-modal-dialog__body">
        <p class="dsn-paragraph">${TEKST}</p>
      </div>
      ${footerMarkup}
    </dialog>`;
  },
};
