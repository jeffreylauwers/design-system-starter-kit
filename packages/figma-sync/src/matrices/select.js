/**
 * Variant-matrix voor Select.
 *
 * Een `<select>` met een eigen chevron ernaast: de native pijl wordt met
 * `appearance: none` weggehaald, en het icoon is een echte laag die absoluut
 * over het veld heen ligt. De root is de wrapper, want die draagt de maat.
 *
 * De chevron verdwijnt in de uitgeschakelde stand, precies zoals in
 * `Select.tsx`. Dat is geen boolean maar een gevolg van de stand, dus het
 * hangt aan de `state`-as.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

export default {
  component: 'Select',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/text-input/text-input.css',
    '@dsn-starter-kit/components-html/src/select/select.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    state: ['default', 'hover', 'focus', 'disabled', 'invalid'],
    width: ['auto', 'md', 'full'],
  },

  pseudoStates: { hover: 'hover', focus: 'focus' },

  render({ state, width }) {
    const wrapperClasses = [
      'dsn-select-wrapper',
      width !== 'auto' && `dsn-select-wrapper--width-${width}`,
    ]
      .filter(Boolean)
      .join(' ');

    const disabled = state === 'disabled';
    const invalid = state === 'invalid' ? ' aria-invalid="true"' : '';

    return `<div class="${wrapperClasses}" data-figma-root>
      <select class="dsn-text-input dsn-select"${disabled ? ' disabled' : ''}${invalid}>
        <option>${TEKST}</option>
      </select>
      ${disabled ? '' : icon('chevron-down', { className: 'dsn-select__icon' })}
    </div>`;
  },
};
