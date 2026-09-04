/**
 * Variant-matrix voor RadioOption.
 *
 * Zelfde opbouw als CheckboxOption, met een radio in plaats van een checkbox.
 * De radio hierin is een gemeten laag en geen instance van de Radio-set; zie
 * issue #369.
 */

import { TEKST, VEEL_TEKST } from '../text.js';

export default {
  component: 'RadioOption',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/radio/radio.css',
    '@dsn-starter-kit/components-html/src/option-label/option-label.css',
    '@dsn-starter-kit/components-html/src/radio-option/radio-option.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    state: ['unchecked', 'checked', 'disabled'],
    length: ['short-text', 'long-text'],
  },

  render({ state, length }) {
    const checked = state === 'checked' ? ' checked' : '';
    const disabled = state === 'disabled' ? ' disabled' : '';
    const labelClasses = [
      'dsn-option-label',
      state === 'disabled' && 'dsn-option-label--disabled',
    ]
      .filter(Boolean)
      .join(' ');
    const text = length === 'short-text' ? TEKST : VEEL_TEKST;

    return `<label class="dsn-radio-option" data-figma-root>
      <span class="dsn-radio">
        <input type="radio" name="demo" class="dsn-radio__input"${checked}${disabled}>
        <span class="dsn-radio__control" aria-hidden="true">
          <span class="dsn-radio__inner-circle"></span>
        </span>
      </span>
      <span class="${labelClasses}">${text}</span>
    </label>`;
  },
};
