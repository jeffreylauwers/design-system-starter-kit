/**
 * Variant-matrix voor FormField.
 *
 * De omhulling die label, beschrijving, foutmelding, control en status bij
 * elkaar houdt. De `invalid`-stand is geen kleurtje maar een echte
 * layoutwijziging: een dikke rand aan de inline-start plus extra
 * `padding-inline-start`, dus dat hoort op een as.
 *
 * Let op: de tekstvelden en labels hierin zijn gemeten lagen en geen instances
 * van de FormFieldLabel- en TextInput-sets. Dat is de kern van issue #369; tot
 * dat opgelost is levert een wijziging aan FormFieldLabel geen wijziging op in
 * de FormField-set, en moet die opnieuw gegenereerd worden.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

export default {
  component: 'FormField',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/form-field-label/form-field-label.css',
    '@dsn-starter-kit/components-html/src/form-field-description/form-field-description.css',
    '@dsn-starter-kit/components-html/src/form-field-error-message/form-field-error-message.css',
    '@dsn-starter-kit/components-html/src/text-input/text-input.css',
    '@dsn-starter-kit/components-html/src/form-field/form-field.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    state: ['default', 'invalid'],
    description: ['with-description', 'no-description'],
  },

  render({ state, description }) {
    const invalid = state === 'invalid';

    const classes = ['dsn-form-field', invalid && 'dsn-form-field--invalid']
      .filter(Boolean)
      .join(' ');

    const descriptionMarkup =
      description === 'with-description'
        ? `<p class="dsn-form-field-description">${TEKST}</p>`
        : '';

    const errorMarkup = invalid
      ? `<p class="dsn-form-field-error-message">
           ${icon('exclamation-circle')}
           <span>${TEKST}</span>
         </p>`
      : '';

    return `<div class="${classes}" data-figma-root>
      <label class="dsn-form-field-label">${TEKST}</label>
      ${descriptionMarkup}
      ${errorMarkup}
      <input type="text" class="dsn-text-input"${invalid ? ' aria-invalid="true"' : ''}>
    </div>`;
  },
};
