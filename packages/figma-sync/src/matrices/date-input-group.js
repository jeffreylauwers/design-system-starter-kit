/**
 * Variant-matrix voor DateInputGroup.
 *
 * Drie losse velden voor dag, maand en jaar, elk met een eigen label erboven.
 * De buitenste flexrij lijnt uit op `flex-end`, zodat de velden op één lijn
 * staan ook als een label over twee regels loopt.
 *
 * De velden zijn instances van de TextInput-set, exposed: per veld staan
 * `showValue`, `showPlaceholder`, `value` en `placeholder` in het paneel. De
 * matrix toont ze ingevuld. De breedte kiest geen variant (een vaste breedte
 * is ook een override), dus `inlineSize` staat er met `data-figma-variant`
 * bij.
 */

/** Zoals in DateInputGroup.tsx: dag en maand krijgen `xs`, het jaar `sm`. */
const FIELDS = [
  { label: 'Dag', inlineSize: 'xs', value: '01' },
  { label: 'Maand', inlineSize: 'xs', value: '01' },
  { label: 'Jaar', inlineSize: 'sm', value: '2026' },
];

import { FLAG, skipFlagCombinations } from '../flags.js';
import { fieldTextAttributes } from '../field-text.js';

export default {
  component: 'DateInputGroup',

  fonts: [
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/form-field-label/form-field-label.css',
    '@dsn-starter-kit/components-html/src/text-input/text-input.css',
    '@dsn-starter-kit/components-html/src/date-input-group/date-input-group.css',
  ],

  wrapperStyle: 'width: 328px;',

  instances: true,

  axes: {
    disabled: FLAG,
    invalid: FLAG,
  },

  // Een veld is niet tegelijk uitgeschakeld en ongeldig, net als bij TextInput.
  skipVariant: skipFlagCombinations({ flags: ['disabled', 'invalid'] }),

  render({ disabled: isDisabled, invalid: isInvalid }) {
    const invalid = isInvalid === 'true' ? ' aria-invalid="true"' : '';
    const disabled = isDisabled === 'true' ? ' disabled' : '';

    const fields = FIELDS.map(
      ({ label, inlineSize, value }) =>
        `<div class="dsn-date-input-group__field">
           <label class="dsn-date-input-group__label">${label}</label>
           <input type="text" inputmode="numeric" class="dsn-text-input dsn-text-input--inline-size-${inlineSize}" data-figma-variant="inlineSize=${inlineSize}"${fieldTextAttributes({ showValue: 'true' }, { value })}${disabled}${invalid}>
         </div>`
    ).join('');

    return `<div class="dsn-date-input-group" data-figma-root>${fields}</div>`;
  },
};
