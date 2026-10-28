/**
 * Variant-matrix voor ActionGroup.
 *
 * Een layoutcomponent, en die krijgen volgens de README geen matrix: een
 * designer gebruikt daar auto layout voor. ActionGroup is de uitzondering
 * sinds er slots zijn (issue #450). De knoppen staan in een slot, en dat slot
 * draagt wat een designer anders zelf moet nabouwen: de richting, het afbreken
 * naar een nieuwe regel en de twee gaps, aan hun variables gebonden. Een knop
 * die erbij komt krijgt zo vanzelf dezelfde ruimte.
 *
 * Gemeten in Figma Desktop (28 oktober 2026): een slot kan afbreken met beide
 * gaps gebonden, en een designer kan de knoppen in het slot van een geneste
 * ActionGroup (in de footer van ModalDialog) aanpassen; dat blijft staan na
 * een tweede import.
 *
 * De `<li>`'s komen niet mee (`data-figma-unwrap`). Ze bestaan voor de
 * semantiek en tekenen niets, en in een slot sleept een designer een Button,
 * geen `<li>` met een Button erin. De knoppen staan dus direct in het slot.
 *
 * De knoppen renderen dezelfde opbouw als de Button-set, met een chevron aan
 * weerszijden: die staan in de instance uit via `showIconStart` en
 * `showIconEnd`, net als in de losse set.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

export default {
  component: 'ActionGroup',

  instances: true,

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/button/button.css',
    '@dsn-starter-kit/components-html/src/action-group/action-group.css',
  ],

  wrapperStyle: 'width: 328px;',

  axes: {
    direction: ['horizontal', 'vertical'],
  },

  render({ direction }) {
    const modifier =
      direction === 'vertical' ? ' dsn-action-group--vertical' : '';

    const item = (variant) =>
      `<li class="dsn-action-group__item" data-figma-unwrap>
         <button type="button" class="dsn-button dsn-button--${variant} dsn-button--size-default">
           ${icon('chevron-left')}
           <span class="dsn-button__label">${TEKST}</span>
           ${icon('chevron-right')}
         </button>
       </li>`;

    return `<ul class="dsn-action-group${modifier}" aria-label="Acties" data-figma-root data-figma-children="slot">
      ${item('strong')}
      ${item('subtle')}
    </ul>`;
  },
};
