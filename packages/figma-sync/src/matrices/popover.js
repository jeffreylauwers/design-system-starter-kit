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
 *
 * De root is de popover zelf, niet de wrapper eromheen. Die wrapper bestaat
 * om de popover in CSS-only gebruik naast zijn trigger te positioneren, en
 * meet zonder trigger 0x0: de popover hing er absoluut aan, buiten beeld. Een
 * designer zet hem zelf op zijn plek.
 *
 * De body en de footer zijn slots, net als bij ModalDialog: de body met de
 * Paragraph als standaardinhoud, de footer met een instance van ActionGroup.
 * De header is bewust geen slot, want daar zet PopoverHeader in code altijd
 * zelf de sluitknop in. Er is geen `footer`-as meer, dus Popover is een los
 * component: wil een designer geen footer, dan zet hij het slot uit.
 */

import { icon } from '../icons.js';
import { HEADING, TEKST } from '../text.js';

export default {
  component: 'Popover',

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

  // De knoppen in de footer zijn de standaardinhoud van de ActionGroup-set,
  // op de standaardmaat. In code staan ze in een Popover vaak op `small`; een
  // andere maat is een andere opbouw dan de ActionGroup-set, en dan kan hij
  // geen instance zijn. Een designer zet ze in het slot op `small`.
  render() {
    const button = (variant) =>
      `<li class="dsn-action-group__item" data-figma-unwrap>
         <button type="button" class="dsn-button dsn-button--${variant} dsn-button--size-default">
           ${icon('chevron-left')}
           <span class="dsn-button__label">${TEKST}</span>
           ${icon('chevron-right')}
         </button>
       </li>`;

    return `<div class="dsn-popover-wrapper">
      <div class="dsn-popover" popover data-figma-root>
        <div class="dsn-popover__header">
          <h2 class="dsn-popover-heading">${HEADING}</h2>
          <button type="button" class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only">
            ${icon('x')}
            <span class="dsn-button__label">Sluiten</span>
          </button>
        </div>
        <div class="dsn-popover__body" data-figma-children="body">
          <p class="dsn-paragraph">${TEKST}</p>
        </div>
        <div class="dsn-popover__footer" data-figma-children="footer">
          <ul class="dsn-action-group" aria-label="Acties">
            ${button('strong')}
            ${button('subtle')}
          </ul>
        </div>
      </div>
    </div>`;
  },
};
