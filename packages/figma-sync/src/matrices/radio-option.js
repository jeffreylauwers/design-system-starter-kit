/**
 * Variant-matrix voor RadioOption.
 *
 * Zelfde opbouw als CheckboxOption, met een radio in plaats van een checkbox.
 * De radio hierin is een gemeten laag en geen instance van de Radio-set; zie
 * issue #369.
 *
 * De tekstlengte is geen as: het frame staat op HUG (`hugRoot`) en groeit mee
 * met het label dat de designer zelf typt.
 */

import { TEKST } from '../text.js';

import { FLAG } from '../flags.js';

export default {
  component: 'RadioOption',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/radio/radio.css',
    '@dsn-starter-kit/components-html/src/option-label/option-label.css',
    '@dsn-starter-kit/components-html/src/radio-option/radio-option.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    state: ['unchecked', 'checked'],
    disabled: FLAG,
  },

  hugRoot: true,

  render({ state, disabled: isDisabled }) {
    const checked = state === 'checked' ? ' checked' : '';
    const disabled = isDisabled === 'true' ? ' disabled' : '';
    const labelClasses = [
      'dsn-option-label',
      isDisabled === 'true' && 'dsn-option-label--disabled',
    ]
      .filter(Boolean)
      .join(' ');

    return `<label class="dsn-radio-option" data-figma-root>
      <span class="dsn-radio">
        <input type="radio" name="demo" class="dsn-radio__input"${checked}${disabled}>
        <span class="dsn-radio__control" aria-hidden="true">
          <span class="dsn-radio__inner-circle"></span>
        </span>
      </span>
      <span class="${labelClasses}">${TEKST}</span>
    </label>`;
  },
};
