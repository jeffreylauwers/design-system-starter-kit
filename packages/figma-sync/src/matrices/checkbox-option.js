/**
 * Variant-matrix voor CheckboxOption.
 *
 * Checkbox en label naast elkaar in één klikbaar `<label>`. De uitlijning is
 * `align-items: flex-start`, zodat het vakje bij de eerste tekstregel blijft
 * staan als het label afbreekt.
 *
 * De tekstlengte is geen as: het frame staat op HUG (`hugRoot`) en groeit mee
 * met het label dat de designer zelf typt. Een tweede variant met veel tekst
 * voegde daar niets aan toe behalve varianten om door te klikken.
 *
 * De checkbox hierin is een gemeten laag en geen instance van de Checkbox-set.
 * Zie issue #369.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

import { FLAG } from '../flags.js';

export default {
  component: 'CheckboxOption',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/checkbox/checkbox.css',
    '@dsn-starter-kit/components-html/src/option-label/option-label.css',
    '@dsn-starter-kit/components-html/src/checkbox-option/checkbox-option.css',
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

    return `<label class="dsn-checkbox-option" data-figma-root>
      <span class="dsn-checkbox">
        <input type="checkbox" class="dsn-checkbox__input"${checked}${disabled}>
        <span class="dsn-checkbox__control" aria-hidden="true">
          ${icon('check', { className: 'dsn-checkbox__icon' })}
        </span>
      </span>
      <span class="${labelClasses}">${TEKST}</span>
    </label>`;
  },
};
