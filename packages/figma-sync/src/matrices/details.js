/**
 * Variant-matrix voor Details.
 *
 * Een native `<details>` met een eigen chevron. De open en dichte stand zijn
 * echt verschillend gemeten: dicht is de inhoud er niet, en het icoon staat
 * 180 graden gedraaid zodra `[open]` geldt.
 *
 * De native driehoek van de browser is `::-webkit-details-marker` en
 * `list-style` op de `<summary>`. Allebei pseudo-elementen, dus onbereikbaar
 * voor de extractor. Dat geeft hier niets: de CSS verbergt ze en tekent een
 * eigen `dsn-details__icon`, en dat is een echte laag die wel overkomt.
 */

import { icon } from '../icons.js';
import { HEADING, TEKST } from '../text.js';

export default {
  component: 'Details',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/paragraph/paragraph.css',
    '@dsn-starter-kit/components-html/src/details/details.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    state: ['closed', 'open'],
  },

  componentProperties: [{ name: 'summary', type: 'TEXT', slot: 'summary' }],

  render({ state }) {
    const open = state === 'open' ? ' open' : '';

    return `<details class="dsn-details"${open} data-figma-root>
      <summary class="dsn-details__summary">
        ${icon('chevron-down', { className: 'dsn-details__icon' })}
        <span class="dsn-details__summary-label" data-figma-slot="summary">${HEADING}</span>
      </summary>
      <div class="dsn-details__content">
        <p class="dsn-paragraph">${TEKST}</p>
      </div>
    </details>`;
  },
};
