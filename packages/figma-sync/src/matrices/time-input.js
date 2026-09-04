/**
 * Variant-matrix voor TimeInput.
 *
 * Een native `<input type="time">` met een eigen knop ernaast die de
 * browserkiezer opent. De knop is een gewone `dsn-button` in de subtle-variant,
 * icon-only, dus dit is meteen de toets of een Button binnen een ander
 * component dezelfde maten oplevert als in zijn eigen set.
 *
 * De knop verdwijnt in de uitgeschakelde en alleen-lezen stand, zoals in
 * `TimeInput.tsx`. Dat volgt uit de stand en is dus geen aparte boolean.
 *
 * De native kiezer-indicator van de browser (`::-webkit-calendar-picker-indicator`)
 * is een pseudo-element en heeft in Figma dus geen tegenhanger; de CSS verbergt
 * hem, en de zichtbare knop is de laag die overkomt.
 */

import { icon } from '../icons.js';

export default {
  component: 'TimeInput',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/button/button.css',
    '@dsn-starter-kit/components-html/src/text-input/text-input.css',
    '@dsn-starter-kit/components-html/src/time-input/time-input.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    state: ['default', 'hover', 'focus', 'disabled', 'invalid'],
  },

  pseudoStates: { hover: 'hover', focus: 'focus' },

  render({ state }) {
    const disabled = state === 'disabled';
    const invalid = state === 'invalid' ? ' aria-invalid="true"' : '';

    const button = disabled
      ? ''
      : `<button type="button" class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only dsn-time-input__button">
           ${icon('clock')}
           <span class="dsn-button__label">Tijdkiezer openen</span>
         </button>`;

    return `<div class="dsn-time-input-wrapper" data-figma-root>
      <input type="time" class="dsn-text-input dsn-time-input"${disabled ? ' disabled' : ''}${invalid}>
      ${button}
    </div>`;
  },
};
