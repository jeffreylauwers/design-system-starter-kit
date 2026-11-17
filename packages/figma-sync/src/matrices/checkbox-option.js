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

import { FLAG, skipFlagCombinations } from '../flags.js';

export default {
  component: 'CheckboxOption',

  instances: true,

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

  wrapperStyle: 'width: 328px;',

  axes: {
    state: ['unchecked', 'checked', 'indeterminate'],
    interaction: ['default', 'hover', 'active'],
    disabled: FLAG,
    invalid: FLAG,
  },

  // Dezelfde assen en weglatingen als Checkbox: `invalid` heeft net als
  // `disabled` geen eigen hover- of active-stijl.
  skipVariant: skipFlagCombinations({
    flags: ['disabled', 'invalid'],
    base: { interaction: 'default' },
  }),

  pseudoStates: { hover: 'hover', active: 'active' },

  // De hover- en active-stijlen hangen aan het `<input>`, niet aan het label:
  // het midden van de root valt in de tekst en raakt de input niet.
  pseudoTarget: '.dsn-checkbox__input',

  // `:indeterminate` is een DOM-property; zie de matrix van Checkbox.
  domSetup: `
    for (const input of document.querySelectorAll('input[data-indeterminate]')) {
      input.indeterminate = true;
    }
  `,

  hugRoot: true,

  render({ state, disabled: isDisabled, invalid }) {
    const checked = state === 'checked' ? ' checked' : '';
    const disabled = isDisabled === 'true' ? ' disabled' : '';
    const indeterminate =
      state === 'indeterminate' ? ' data-indeterminate' : '';
    const inputClasses = [
      'dsn-checkbox__input',
      invalid === 'true' && 'dsn-checkbox__input--invalid',
    ]
      .filter(Boolean)
      .join(' ');
    const iconName = state === 'indeterminate' ? 'minus' : 'check';
    const labelClasses = [
      'dsn-option-label',
      isDisabled === 'true' && 'dsn-option-label--disabled',
    ]
      .filter(Boolean)
      .join(' ');

    return `<label class="dsn-checkbox-option" data-figma-root>
      <span class="dsn-checkbox">
        <input type="checkbox" class="${inputClasses}"${checked}${disabled}${indeterminate}>
        <span class="dsn-checkbox__control" aria-hidden="true">
          ${icon(iconName, { className: 'dsn-checkbox__icon' })}
        </span>
      </span>
      <span class="${labelClasses}">${TEKST}</span>
    </label>`;
  },
};
