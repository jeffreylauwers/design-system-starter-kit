/**
 * Variant-matrix voor ModalDialog.
 *
 * Een native `<dialog>` die alleen bestaat als hij open is: zonder `[open]`
 * geldt de `display: none` uit de UA-stylesheet, en dan valt er niets te meten.
 * Het attribuut staat er daarom altijd op, en `state` gaat over wat er ín de
 * dialoog staat, niet over open of dicht.
 *
 * De body is een slot (`data-figma-children="body"`, issue #450), met de
 * Paragraph als standaardinhoud: in code is ModalDialogBody een houder voor
 * willekeurige inhoud. De header is bewust geen slot. ModalDialogHeader zet de
 * sluitknop er in code altijd zelf in, en een slot laat een designer die
 * weghalen.
 *
 * De footer is ook een slot (`data-figma-children="footer"`), met een
 * instance van ActionGroup als standaardinhoud. Een designer past de knoppen
 * aan in het slot van die ActionGroup, of zet iets anders in de footer. De
 * `footer`-as die het aantal knoppen eerder regelde is weg, en daarmee is
 * ModalDialog een los component. De footer zelf is het
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

  // De Paragraph en de ActionGroup in de footer zijn instances van hun eigen
  // sets. De knoppen in de ActionGroup renderen dezelfde opbouw als de
  // ActionGroup-set, zodat die instance geen overrides nodig heeft: de
  // knoppen pas je aan in het slot van de geneste ActionGroup.
  //
  // De sluitknop is een instance van de icon-only Button, met `x` via de
  // instance swap `icon` (issue #451).
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
    const button = (variant) =>
      `<li class="dsn-action-group__item" data-figma-unwrap>
         <button type="button" class="dsn-button dsn-button--${variant} dsn-button--size-default">
           ${icon('chevron-left')}
           <span class="dsn-button__label">${TEKST}</span>
           ${icon('chevron-right')}
         </button>
       </li>`;

    const footerMarkup = `<div class="dsn-modal-dialog__footer" data-figma-children="footer">
             <ul class="dsn-action-group" aria-label="Acties">
               ${button('strong')}
               ${button('subtle')}
             </ul>
           </div>`;

    return `<dialog class="dsn-modal-dialog" open data-figma-root>
      <div class="dsn-modal-dialog__header">
        <h2 class="dsn-modal-dialog-heading">${HEADING}</h2>
        <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only">
          ${icon('x')}
          <span class="dsn-button__label">Sluiten</span>
        </button>
      </div>
      <div class="dsn-modal-dialog__body" data-figma-children="body">
        <p class="dsn-paragraph">${TEKST}</p>
      </div>
      ${footerMarkup}
    </dialog>`;
  },
};
