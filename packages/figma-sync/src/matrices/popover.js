/**
 * Variant-matrix voor Popover.
 *
 * De enige van de drie overlays die de Popover API gebruikt in plaats van
 * `<dialog>`. Zonder `showPopover()` geldt de `display: none` uit de
 * UA-stylesheet en valt er niets te meten, dus die aanroep staat in `domSetup`.
 *
 * Popover zet zelf `color: inherit`, en is daarmee het component dat laat zien
 * hoe ModalDialog en Drawer het hadden moeten doen: die twee erven de
 * tekstkleur niet en houden de zwarte `CanvasText` van de UA-stylesheet.
 */

import { icon } from '../icons.js';
import { HEADING, TEKST } from '../text.js';

export default {
  component: 'Popover',

  // De sluitknop is een instance van de icon-only Button, met `x` via de
  // instance swap `icon`. De knop in de footer rendert dezelfde opbouw als de
  // Button-set, met een chevron aan weerszijden: die staan in de instance uit
  // via `showIconStart` en `showIconEnd`, net als in de losse set.
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
    '@dsn-starter-kit/components-html/src/popover/popover.css',
  ],

  wrapperStyle: 'width: 328px;',

  /**
   * `:popover-open` is geen attribuut maar een toestand die de Popover API
   * zet. Zonder deze aanroep blijft de popover `display: none`.
   */
  domSetup: `
    for (const popover of document.querySelectorAll('[popover]')) {
      popover.showPopover();
    }
  `,

  axes: {
    footer: ['with-footer', 'no-footer'],
  },

  render({ footer }) {
    const footerMarkup =
      footer === 'with-footer'
        ? `<div class="dsn-popover__footer">
             <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-small">
               ${icon('chevron-left')}
               <span class="dsn-button__label">${TEKST}</span>
               ${icon('chevron-right')}
             </button>
           </div>`
        : '';

    return `<div class="dsn-popover-wrapper" data-figma-root>
      <div class="dsn-popover" popover>
        <div class="dsn-popover__header">
          <h2 class="dsn-popover-heading">${HEADING}</h2>
          <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only">
            ${icon('x')}
            <span class="dsn-button__label">Sluiten</span>
          </button>
        </div>
        <div class="dsn-popover__body">
          <p class="dsn-paragraph">${TEKST}</p>
        </div>
        ${footerMarkup}
      </div>
    </div>`;
  },
};
