/**
 * Variant-matrix voor CheckboxOption.
 *
 * Checkbox en label naast elkaar in één klikbaar `<label>`. De uitlijning is
 * `align-items: flex-start`, zodat het vakje bij de eerste tekstregel blijft
 * staan als het label afbreekt; de variant met veel tekst staat er daarom in.
 *
 * De checkbox hierin is een gemeten laag en geen instance van de Checkbox-set.
 * Zie issue #369.
 */

import { icon } from '../icons.js';
import { TEKST, VEEL_TEKST } from '../text.js';

export default {
  component: 'CheckboxOption',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-react/src/Checkbox/Checkbox.css',
    '@dsn-starter-kit/components-html/src/option-label/option-label.css',
    '@dsn-starter-kit/components-html/src/checkbox-option/checkbox-option.css',
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

    return `<label class="dsn-checkbox-option" data-figma-root>
      <span class="dsn-checkbox">
        <input type="checkbox" class="dsn-checkbox__input"${checked}${disabled}>
        <span class="dsn-checkbox__control" aria-hidden="true">
          ${icon('check', { className: 'dsn-checkbox__icon' })}
        </span>
      </span>
      <span class="${labelClasses}">${text}</span>
    </label>`;
  },
};
