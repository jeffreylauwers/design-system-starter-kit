/**
 * Variant-matrix voor ModalDialog.
 *
 * Een native `<dialog>` die alleen bestaat als hij open is: zonder `[open]`
 * geldt de `display: none` uit de UA-stylesheet, en dan valt er niets te meten.
 * Het attribuut staat er daarom altijd op, en `state` gaat over wat er ín de
 * dialoog staat, niet over open of dicht.
 *
 * De footer is een slot (`data-figma-children="footer"`, issue #450), met de
 * twee knoppen in hun ActionGroup als standaardinhoud. Een designer haalt de
 * knoppen er zelf uit of zet er een bij; de `footer`-as die dat eerder deed
 * is weg, en daarmee is ModalDialog een los component. De footer zelf is het
 * slot, en niet een frame erin: hij hangt direct onder de root, en alleen
 * daar blijft de inhoud van een designer een tweede import staan. Zijn
 * padding en de scheidingslijn erboven horen bij het slot.
 *
 * De `::backdrop` komt niet mee. Dat is een pseudo-element, net als
 * `::file-selector-button`, en het is bovendien Backdrop, dat volgens de
 * README bewust geen eigen component in Figma is.
 */

import { icon } from '../icons.js';
import { HEADING, TEKST } from '../text.js';

export default {
  component: 'ModalDialog',

  // De Paragraph en de footerknoppen zijn instances van hun eigen sets. De
  // knoppen renderen daarvoor dezelfde opbouw als de Button-set, met een
  // chevron aan weerszijden: die staan in de instance uit via `showIconStart`
  // en `showIconEnd`, net als in de losse set.
  //
  // De sluitknop blijft een gemeten laag. Hij is icon-only, en daar heeft de
  // Button-set nog geen variant voor: zie issue #451.
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
    '@dsn-starter-kit/components-html/src/modal-dialog/modal-dialog.css',
  ],

  warnings: [
    'de `::backdrop` komt niet mee: dat is een pseudo-element en dus geen DOM-node. Backdrop is volgens de README ook bewust geen eigen component in Figma.',
  ],

  render() {
    const footerMarkup = `<div class="dsn-modal-dialog__footer" data-figma-children="footer">
             <div class="dsn-action-group">
               <button type="button" class="dsn-button dsn-button--strong dsn-button--size-default">
                 ${icon('chevron-left')}
                 <span class="dsn-button__label">${TEKST}</span>
                 ${icon('chevron-right')}
               </button>
               <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-default">
                 ${icon('chevron-left')}
                 <span class="dsn-button__label">${TEKST}</span>
                 ${icon('chevron-right')}
               </button>
             </div>
           </div>`;

    return `<dialog class="dsn-modal-dialog" open data-figma-root>
      <div class="dsn-modal-dialog__header">
        <h2 class="dsn-modal-dialog-heading">${HEADING}</h2>
        <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only" data-figma-instance="none">
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
